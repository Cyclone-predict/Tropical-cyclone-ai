# CycloneAI - Dataset Module

## Purpose
The purpose of the dataset module is to handle the acquisition, ingestion, and verification of meteorological cyclone data.

## Primary Dataset
**TCIR (Tropical Cyclone Image-to-intensity Regression dataset)**
TCIR is a real research dataset containing historical tropical cyclone satellite observations (IR1, WV, VIS, PMW channels) and corresponding meteorological metadata (cyclone IDs, timestamps, coordinates, and maximum sustained wind intensity).

## Repository Data Exclusions
**The complete real TCIR dataset is NOT included in this repository.**
Raw datasets should be stored locally under the directory:
`data/raw/`

Raw HDF5 datasets are intentionally excluded from Git using `.gitignore` due to their massive size and to prevent accidental inclusion of unversioned binary data.

## Prototype Validation Asset
Currently, `data/raw/` contains a structural test asset: `pipeline_test_asset.h5`.
This is a small, structural validation asset created *only* to verify that the software pipeline can load TCIR-like HDF5 data, preprocess it, train/test the pipeline, evaluate it, and perform inference. 

**VERY IMPORTANT SCIENTIFIC DISCLAIMER:**
The validation asset is **NOT** the real TCIR dataset. Results obtained from it (Accuracy, MAE, RMSE, Confidence, Intensity Trends) have **NO scientific meaning** regarding real cyclone intensity prediction.
The current SIH implementation is a **software prototype** and has **NOT** been scientifically validated by training or evaluating on the complete real TCIR dataset.

## Future Workflow
The pipeline is designed to be fully scalable once the real TCIR dataset is manually downloaded.

Real TCIR data
    ↓
`data/raw/`
    ↓
preprocessing
    ↓
train/validation/test split
    ↓
model training
    ↓
evaluation
    ↓
inference

## Data Leakage Prevention
Cyclone/event-level separation is enforced in the preprocessing scripts so that observations from the exact same cyclone do not unintentionally appear in both training and testing sets, ensuring robust evaluation.

## Limitations
- No cyclone labels, accuracy, MAE, RMSE, confidence, or other scientific results will be fabricated under any circumstances.
- The system is an AI/ML prototype and does **not** replace official meteorological forecasting or early warning systems.
