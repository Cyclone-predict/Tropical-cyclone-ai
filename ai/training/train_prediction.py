import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from pathlib import Path
import os
import sys

# Ensure ai package is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ai.preprocessing.dataset import TCIRDataset, create_leakage_safe_splits
from ai.model.prediction_model import get_model

def train_model(h5_file_path, epochs=3, batch_size=4, lr=0.001):
    print("=== PIPELINE VALIDATION ONLY ===")
    print("Training on structural validation asset. Not trained/evaluated on real TCIR data.")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Setup dataset
    full_dataset = TCIRDataset(h5_file_path)
    train_idx, val_idx, test_idx = create_leakage_safe_splits(h5_file_path)
    
    # DataLoaders
    train_sampler = torch.utils.data.SubsetRandomSampler(train_idx)
    val_sampler = torch.utils.data.SubsetRandomSampler(val_idx)
    
    train_loader = DataLoader(full_dataset, batch_size=batch_size, sampler=train_sampler)
    val_loader = DataLoader(full_dataset, batch_size=batch_size, sampler=val_sampler)
    
    model = get_model().to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # Training Loop
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        for images, labels, _ in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * images.size(0)
            
        train_loss = train_loss / len(train_idx)
        
        # Validation Phase
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for images, labels, _ in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                
        val_loss = val_loss / len(val_idx)
        print(f"Epoch {epoch+1}/{epochs} - Train MSE Loss: {train_loss:.4f}, Val MSE Loss: {val_loss:.4f}")
        
    # Save checkpoint
    checkpoint_dir = Path("models")
    checkpoint_dir.mkdir(exist_ok=True)
    checkpoint_path = checkpoint_dir / "intensity_prototype.pth"
    torch.save(model.state_dict(), checkpoint_path)
    print(f"Prototype model saved to {checkpoint_path}")
    
if __name__ == "__main__":
    asset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw', 'pipeline_test_asset.h5'))
    
    if os.path.exists(asset_path):
        train_model(asset_path)
    else:
        print(f"Validation asset not found at {asset_path}. Run generate_validation_asset.py first.")
