# CycloneAI - AI/ML Pipeline

This directory contains the AI/ML pipeline for the CycloneAI Labs SIH 2026 project.

**IMPORTANT SCIENTIFIC DISCLAIMER:**
> Full TCIR training data has not been downloaded due to local storage/compute constraints. The model is currently a structural prototype validated on a synthetic test asset (`pipeline_test_asset.h5`). It has not been trained on real TCIR data. No metrics (Accuracy, MAE, RMSE) output by this prototype have scientific value. 
> 
> All testing is: **"Pipeline validation only — not trained/evaluated on real TCIR data."**

## Architecture

1. **Dataset**: TCIR (Dataset of Tropical Cyclone for Image-to-intensity Regression). HDF5 format (`matrix` images, `info` metadata).
2. **Model**: Convolutional Neural Network (CNN) for intensity regression (Vmax).
3. **Task**: Image-to-intensity prediction.

## Directory Structure
- `dataset/`: Contains script to generate/check the HDF5 structure.
- `preprocessing/`: `preprocess.py` (HDF5 inspector) and `dataset.py` (PyTorch Dataset + Leakage-safe split logic).
- `model/`: `prediction_model.py` (CNN architecture).
- `training/`: `train_prediction.py` (Training script with MSE loss).
- `evaluation/`: `evaluate.py` (MAE/RMSE metric evaluation).
- `explainability/`: `gradcam.py` (Grad-CAM hooks for CNN).
- `inference.py`: Final JSON output interface for Member 2 integration.

## How to use the Pipeline Validation Asset

We use a tiny structurally valid HDF5 file to test the software pipeline without the massive real dataset.

1. Generate the validation asset:
   ```bash
   python ai/dataset/generate_validation_asset.py
   ```
2. Train the structural model:
   ```bash
   python ai/training/train_prediction.py
   ```
3. Evaluate the structural model:
   ```bash
   python ai/evaluation/evaluate.py
   ```
4. Test inference output:
   ```bash
   python ai/inference.py
   ```

## How to Scale to Real TCIR Data

The code is strictly designed to match the official TCIR schema. To switch from pipeline validation to real training:

1. Download a real TCIR file (e.g. `TCIR-ALL_2017.h5.tar.gz`).
2. Extract the `.h5` file and place it in the `data/raw/` directory.
3. If the filename doesn't match the expected pattern, rename it or update the config in `dataset.py`.
4. Run `python ai/training/train_prediction.py` again.

## Member 2 Integration

Member 2 should interact exclusively with `ai/inference.py`.

```python
from ai.inference import predict

# Pass the image path to inference
json_result = predict("path/to/image.h5")
print(json_result)
```

Example JSON Output:
```json
{
    "cyclone_detected": true,
    "pattern": "Tropical Storm",
    "predicted_vmax": 45.3,
    "confidence": 0.85,
    "trend": "Stable",
    "note": "Pipeline validation only - not trained on real TCIR data"
}
```