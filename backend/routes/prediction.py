import os
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.schemas.prediction import PredictionResponse
from backend.services.ai_service import predict_image


router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png"
}

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Use JPG, JPEG or PNG."
        )

    file_data = await file.read()

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum size is 10 MB."
        )

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    filename = f"{uuid.uuid4()}{extension}"

    upload_dir = "backend/uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file_data)

    try:
        result = predict_image(file_path)

        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI inference failed: {str(exc)}"
        )