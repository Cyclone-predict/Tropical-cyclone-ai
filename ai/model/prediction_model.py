import torch
import torch.nn as nn

class IntensityRegressionCNN(nn.Module):
    """
    CNN architecture for Cyclone Intensity Regression (Vmax).
    Uses 4 input channels (IR, WV, VIS, PMW).
    
    This is a lightweight prototype model designed for local laptop execution.
    It can be easily swapped for ResNet50 or similar when scaling up to the full TCIR dataset.
    """
    def __init__(self, in_channels=4):
        super(IntensityRegressionCNN, self).__init__()
        
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(in_channels, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), # 201 -> 100
            
            # Block 2
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), # 100 -> 50
            
            # Block 3
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), # 50 -> 25
        )
        
        # Adaptive pooling to handle potential variations in input size safely
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4)) # output: (N, 64, 4, 4)
        
        self.regressor = nn.Sequential(
            nn.Linear(64 * 4 * 4, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.5),
            nn.Linear(128, 1) # Single output: Intensity (Vmax)
        )
        
    def forward(self, x):
        x = self.features(x)
        x = self.adaptive_pool(x)
        x = torch.flatten(x, 1)
        intensity = self.regressor(x)
        return intensity.squeeze(1)

def get_model():
    """Returns the instantiated model."""
    return IntensityRegressionCNN()

if __name__ == "__main__":
    # Test model shape with pipeline validation dimensions
    model = get_model()
    dummy_input = torch.zeros((2, 4, 201, 201)) # Batch 2, 4 channels, 201x201
    output = model(dummy_input)
    print(f"Model output shape: {output.shape} (Expected: torch.Size([2]))")
