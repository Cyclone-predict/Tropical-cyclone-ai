import os
import h5py
import numpy as np
import pandas as pd
from pathlib import Path

# The official TCIR dataset structure uses HDF5 with two main keys:
# 'info' for metadata (cyclone ID, wind speed, lat, lon)
# 'matrix' for the actual images (IR, WV, VIS, PMW)

DATA_RAW_DIR = Path("../../data/raw") # relative to script or use absolute depending on run context. We will use absolute for safety in this script.
DATA_RAW_DIR = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw')))

SUPPORTED_FILE_PATTERN = "*.h5"

def locate_dataset():
    """Finds the TCIR HDF5 dataset in the data/raw directory."""
    if not DATA_RAW_DIR.exists():
        return None
    
    h5_files = list(DATA_RAW_DIR.glob(SUPPORTED_FILE_PATTERN))
    if not h5_files:
        return None
        
    # Prefer the 2017 test subset if multiple exist, else take the first
    for f in h5_files:
        if "2017" in f.name:
            return f
    return h5_files[0]

def inspect_dataset(file_path):
    """
    Safely inspects the HDF5 dataset structure without loading everything into memory.
    This helps us verify the actual data fields before writing full pipelines.
    """
    print(f"Inspecting dataset: {file_path}")
    inspection_results = {}
    
    try:
        with h5py.File(file_path, 'r') as hf:
            keys = list(hf.keys())
            inspection_results["keys"] = keys
            
            if 'matrix' in hf:
                matrix_shape = hf['matrix'].shape
                matrix_dtype = hf['matrix'].dtype
                inspection_results['matrix'] = {"shape": matrix_shape, "dtype": str(matrix_dtype)}
                
            if 'info' in hf:
                info_shape = hf['info'].shape
                info_dtype = hf['info'].dtype
                inspection_results['info'] = {"shape": info_shape, "dtype": str(info_dtype)}
                
                # Try to extract the first row safely to see the exact metadata fields
                first_row = hf['info'][0]
                inspection_results['info_fields'] = first_row.dtype.names
                
    except Exception as e:
        inspection_results["error"] = str(e)
        
    return inspection_results

if __name__ == "__main__":
    dataset_path = locate_dataset()
    if dataset_path:
        print("Real TCIR subset found!")
        results = inspect_dataset(dataset_path)
        for k, v in results.items():
            print(f"{k}: {v}")
    else:
        print("No .h5 dataset found in data/raw/")
        print("Please place a real TCIR subset (e.g., TCIR-ALL_2017.h5) in data/raw/ to proceed.")
