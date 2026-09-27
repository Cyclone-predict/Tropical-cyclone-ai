import torch
from torch.utils.data import DataLoader
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ai.preprocessing.dataset import TCIRDataset, create_leakage_safe_splits
from ai.model.prediction_model import get_model

def evaluate_model(h5_file_path, checkpoint_path):
    print("=== PIPELINE VALIDATION ONLY ===")
    print("Evaluating on structural validation asset. Not trained/evaluated on real TCIR data.")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load model
    model = get_model()
    if os.path.exists(checkpoint_path):
        model.load_state_dict(torch.load(checkpoint_path, map_location=device))
        print("Loaded saved prototype weights.")
    else:
        print("No saved weights found. Using initialized model for pipeline test.")
    
    model.to(device)
    model.eval()
    
    # Setup dataset
    full_dataset = TCIRDataset(h5_file_path)
    _, _, test_idx = create_leakage_safe_splits(h5_file_path)
    
    test_sampler = torch.utils.data.SubsetRandomSampler(test_idx)
    test_loader = DataLoader(full_dataset, batch_size=4, sampler=test_sampler)
    
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels, _ in test_loader:
            images = images.to(device)
            outputs = model(images)
            all_preds.extend(outputs.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
    if len(all_labels) == 0:
        print("Test set is empty (dataset might be too small).")
        return
        
    mae = mean_absolute_error(all_labels, all_preds)
    rmse = np.sqrt(mean_squared_error(all_labels, all_preds))
    
    print("\n--- Pipeline Validation Metrics ---")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print("NOTE: These metrics are structurally generated on the validation asset.")
    print("They contain no scientific value regarding cyclone intensity prediction.")

if __name__ == "__main__":
    asset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw', 'pipeline_test_asset.h5'))
    ckpt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'intensity_prototype.pth'))
    
    if os.path.exists(asset_path):
        evaluate_model(asset_path, ckpt_path)
    else:
        print("Validation asset not found.")
