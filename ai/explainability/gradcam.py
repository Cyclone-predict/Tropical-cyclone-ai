import torch
import numpy as np
import cv2
import os

class GradCAM:
    """
    Structural placeholder for Grad-CAM explainability pipeline.
    Hooking into the last convolutional layer of the CNN model.
    """
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_full_backward_hook(self.save_gradient)
        
    def save_activation(self, module, input, output):
        self.activations = output
        
    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]
        
    def generate_heatmap(self, input_tensor, target_class=None):
        self.model.eval()
        
        # Forward pass
        output = self.model(input_tensor)
        
        # Normally for regression we just backward on the raw output
        # For classification, we'd pick the target_class logit
        self.model.zero_grad()
        output.backward(retain_graph=True)
        
        # Get gradients and activations
        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]
        
        # Pool gradients across spatial dimensions
        weights = np.mean(gradients, axis=(1, 2))
        
        # Weight activations
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        cam = np.maximum(cam, 0) # ReLU on CAM
        if np.max(cam) != 0:
            cam = cam / np.max(cam) # Normalize
            
        # Resize to input dimensions (201x201)
        cam = cv2.resize(cam, (201, 201))
        
        return cam

def apply_colormap_on_image(org_im, activation, colormap_name=cv2.COLORMAP_JET):
    """
    Apply heatmap to the original image (e.g., IR channel).
    """
    # Dummy processing for pipeline validation
    heatmap = cv2.applyColorMap(np.uint8(255 * activation), colormap_name)
    heatmap = np.float32(heatmap) / 255
    
    if org_im.ndim == 2:
        org_im = cv2.cvtColor((org_im * 255).astype(np.uint8), cv2.COLOR_GRAY2BGR)
        org_im = np.float32(org_im) / 255
        
    cam = heatmap + org_im
    cam = cam / np.max(cam)
    return np.uint8(255 * cam)
