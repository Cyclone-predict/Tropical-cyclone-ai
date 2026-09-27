# CycloneAI Backend

This backend is a FastAPI service for the SIH 2026 prototype. It validates TCIR-format HDF5 uploads and bridges the request to Member 1's AI inference pipeline.

## Framework
- FastAPI
- SQLAlchemy for local database access
- Pydantic models for validation
- CORS middleware for frontend local development

## Install
1. Activate the project environment.
2. Install dependencies:

   python -m pip install -r backend/requirements.txt
  python -m pip install -r ai/requirements.txt

3. Create the local structural prototype files (from the project root):

    python ai/dataset/generate_validation_asset.py
    python ai/training/train_prediction.py

The generated HDF5 asset and model checkpoint are local-only and remain ignored by Git.

## Start the backend
From the project root:

   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

API base URL:

   http://localhost:8000

## Endpoints
### GET /health
Returns backend status.

Example response:

{
  "status": "ok",
  "service": "CycloneAI Backend"
}

### POST /analyze
Accepts multipart/form-data with a file field named `image` containing a TCIR HDF5 file.

Request format:

- Field: image
- Type: `.h5` or `.hdf5`
- Required dataset: `matrix` with shape `(N, 201, 201, 4)`
- Channel order: IR, WV, VIS, PMW
- Max file size: 25 MB

Ordinary JPG/PNG images are not accepted: they do not contain the four TCIR satellite channels, and the backend does not invent or synthesize missing channels.

Example with curl:

   curl -X POST http://localhost:8000/analyze \
     -F "image=@data/raw/pipeline_test_asset.h5"

The route also exposes /predict as a compatibility alias.

## Response contract
The backend returns the inference JSON fields: `pattern`, `predicted_vmax`, and the existing pipeline-validation `note`.

The inference uses the first matrix frame, transposes it to `(4, 201, 201)`, and scales values by `1/255`, matching the existing `TCIRDataset` preprocessing. The model only estimates intensity; it does not produce cyclone detection, confidence, or temporal trend, so those values are not fabricated.

## Error responses
Errors are returned as JSON with a top-level success flag.

Examples:

{
  "success": false,
  "error": "No TCIR HDF5 file uploaded."
}

{
  "success": false,
  "error": "AI inference failed: ..."
}

## CORS configuration
CORS is configured in [backend/main.py](backend/main.py). It allows the local frontend origins in the environment variable FRONTEND_ORIGINS, defaulting to:

- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

## Member 1 inference integration
The backend calls the Member 1 AI pipeline through the bridge in [backend/services/ai_service.py](backend/services/ai_service.py). The implementation searches for a real predict(...) entry point in ai/inference.py and uses it when present.

The inference requires the ignored local checkpoint `models/intensity_prototype.pth`. Generate it with the commands above. The generated validation asset is synthetic and only verifies pipeline structure; outputs are not scientifically validated forecasts.

If the Member 1 branch is not checked out in this workspace, the backend returns a controlled structured error instead of pretending the model is available.

## Frontend contract
Member 3 should send a multipart form upload with a file field labelled image and consume the JSON result dynamically. Do not hard-code scientific conclusions into the UI.

## Notes
- This is a prototype integration for SIH 2026.
- The backend preserves validation notes and does not claim real meteorological accuracy.
- Temporary uploaded files are cleaned up immediately after inference.
