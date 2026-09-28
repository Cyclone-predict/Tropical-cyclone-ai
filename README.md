# CycloneAI SIH Prototype

Prototype integration of a React frontend, FastAPI backend, and Member 1's TCIR inference pipeline.

## Run locally

From the repository root, install the backend and AI dependencies, configure a local database, and generate the small structural validation asset and checkpoint:

```powershell
python -m pip install -r backend/requirements.txt
python -m pip install -r ai/requirements.txt
$env:DATABASE_URL = "sqlite:///./cycloneai.db"
python ai/dataset/generate_validation_asset.py
python ai/training/train_prediction.py
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

In a second terminal, from the repository root:

```powershell
Set-Location frontend
npm ci
$env:VITE_API_URL = "http://127.0.0.1:8000"
npm run dev
```

Open `http://localhost:5173`. Upload `data/raw/pipeline_test_asset.h5` from the repository root, or another TCIR HDF5 file with a `matrix` dataset shaped `(N, 201, 201, 4)`.

## Prototype limits

The generated asset and checkpoint are synthetic structural validation artifacts. The inference pipeline uses the uploaded HDF5 frame, but its output is not a scientifically validated forecast or measure of real-world accuracy. Member 1's current inference also includes prototype placeholder detection, confidence, and trend fields; do not present those fields as validated model results.

Generated `.h5` data, `.pth` checkpoints, virtual environments, and secrets are intentionally excluded by `.gitignore` and must not be committed.
