import io
import os
import tempfile
import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import JSONResponse
import h5py
from sqlalchemy.orm import Session

from backend.database.connection import get_db
from backend.database.models import Prediction
from backend.schemas.prediction import PredictionResponse
from backend.services.ai_service import predict_image


router = APIRouter(tags=["Prediction"])


ALLOWED_EXTENSIONS = {".h5", ".hdf5"}
MAX_FILE_SIZE = 25 * 1024 * 1024


def _json_error(message: str, status_code: int):
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": message},
    )


def _validate_tcir_file(file_data: bytes) -> str | None:
    try:
        with h5py.File(io.BytesIO(file_data), "r") as hdf5_file:
            if "matrix" not in hdf5_file:
                return "TCIR HDF5 file must contain a 'matrix' dataset."

            matrix = hdf5_file["matrix"]
            if matrix.ndim != 4 or tuple(matrix.shape[1:]) != (201, 201, 4):
                return "TCIR matrix must have shape (N, 201, 201, 4)."
            if matrix.shape[0] == 0:
                return "TCIR matrix must contain at least one frame."
            if matrix.dtype.kind not in "iuf":
                return "TCIR matrix values must be numeric."
    except (OSError, TypeError, ValueError):
        return "Uploaded file is not a valid TCIR HDF5 file."

    return None


@router.post("/analyze", response_model=PredictionResponse, response_model_exclude_none=True)
@router.post("/predict", response_model=PredictionResponse, response_model_exclude_none=True)
async def predict(
    image: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    if image is None or image.filename is None or image.filename == "":
        return _json_error("No TCIR HDF5 file uploaded.", 400)

    extension = os.path.splitext(image.filename)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        return _json_error(
            "Unsupported input format. Upload a TCIR HDF5 file (.h5 or .hdf5) "
            "with a (N, 201, 201, 4) matrix; RGB images cannot provide the four satellite channels.",
            415,
        )

    file_data = await image.read()
    if not file_data:
        return _json_error("Uploaded TCIR file is empty.", 400)
    if len(file_data) > MAX_FILE_SIZE:
        return _json_error("Uploaded TCIR file is too large. Maximum size is 25 MB.", 413)

    validation_error = _validate_tcir_file(file_data)
    if validation_error:
        return _json_error(validation_error, 400)

    temp_dir = tempfile.mkdtemp(prefix="cyclone_ai_")
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}{extension}")

    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(file_data)

        try:
            result = predict_image(temp_path)
        except Exception as exc:
            return _json_error(f"AI inference failed: {exc}", 503)

        try:
            if isinstance(result, dict) and isinstance(result.get("cyclone_detected"), bool):
                prediction = Prediction(
                    cyclone_id=None,
                    cyclone_detected=result["cyclone_detected"],
                    pattern=result.get("pattern"),
                    confidence=result.get("confidence"),
                    trend=result.get("trend"),
                )
                db.add(prediction)
                db.commit()
                db.refresh(prediction)
        except Exception as exc:
            db.rollback()
            return _json_error(f"Database error: {exc}", 500)

        return result
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except OSError:
            pass