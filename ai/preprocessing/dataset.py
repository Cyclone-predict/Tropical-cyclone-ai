import h5py
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from pathlib import Path
import os

class TCIRDataset(Dataset):
    """
    PyTorch Dataset for the TCIR HDF5 structure.
    Reads 'matrix' (images) and 'info' (metadata/labels).
    """
    def __init__(self, h5_file_path, transform=None):
        self.h5_file_path = h5_file_path
        self.transform = transform
        
        # Verify file exists
        if not os.path.exists(h5_file_path):
            raise FileNotFoundError(f"Dataset not found at {h5_file_path}")
            
        # Inspect length without holding the file open
        with h5py.File(h5_file_path, 'r') as hf:
            self.length = hf['matrix'].shape[0]
            
    def __len__(self):
        return self.length
        
    def __getitem__(self, idx):
        # Open file in __getitem__ to support multiprocessing DataLoader
        with h5py.File(self.h5_file_path, 'r') as hf:
            # TCIR matrix is (N, 201, 201, 4)
            # PyTorch expects (Channels, Height, Width) -> (4, 201, 201)
            img = hf['matrix'][idx]
            img = np.transpose(img, (2, 0, 1)) # NHWC -> NCHW
            
            # Read info
            info = hf['info'][idx]
            vmax = info['Vmax']
            cyclone_id = info['ID'].decode('utf-8') if isinstance(info['ID'], bytes) else info['ID']
            
        # Handle NaN values by replacing with 0 (simplistic approach for validation)
        img = np.nan_to_num(img, nan=0.0)
        vmax = np.nan_to_num(vmax, nan=0.0)
        
        # Convert to torch tensors
        img_tensor = torch.from_numpy(img).float()
        # Normalize (assuming images are unnormalized raw values, arbitrary scaling for prototype)
        img_tensor = img_tensor / 255.0 
        
        label_tensor = torch.tensor(vmax, dtype=torch.float32)
        
        return img_tensor, label_tensor, cyclone_id

def create_leakage_safe_splits(h5_file_path, train_ratio=0.7, val_ratio=0.15):
    """
    Splits the dataset safely by Cyclone ID to prevent data leakage.
    Returns indices for train, val, test.
    """
    with h5py.File(h5_file_path, 'r') as hf:
        info = hf['info'][:]
        
    cyclone_ids = [row['ID'].decode('utf-8') if isinstance(row['ID'], bytes) else row['ID'] for row in info]
    unique_ids = list(set(cyclone_ids))
    
    # Shuffle unique IDs for random split
    np.random.seed(42) # Reproducible seed
    np.random.shuffle(unique_ids)
    
    n_train = int(len(unique_ids) * train_ratio)
    n_val = int(len(unique_ids) * val_ratio)
    
    train_ids = set(unique_ids[:n_train])
    val_ids = set(unique_ids[n_train:n_train+n_val])
    test_ids = set(unique_ids[n_train+n_val:])
    
    train_indices = [i for i, cid in enumerate(cyclone_ids) if cid in train_ids]
    val_indices = [i for i, cid in enumerate(cyclone_ids) if cid in val_ids]
    test_indices = [i for i, cid in enumerate(cyclone_ids) if cid in test_ids]
    
    # If the validation asset is too small to have separate cyclones for all 3 splits,
    # fallback gracefully for the software prototype
    if len(train_indices) == 0 or len(val_indices) == 0 or len(test_indices) == 0:
        train_indices = list(range(len(cyclone_ids)))
        val_indices = list(range(len(cyclone_ids)))
        test_indices = list(range(len(cyclone_ids)))
        print("WARNING: Dataset too small for leakage-safe split. Using all data for all splits (PIPELINE VALIDATION ONLY).")
    
    return train_indices, val_indices, test_indices
