import os
import h5py
import numpy as np

def create_validation_asset():
    """
    Creates a structural validation asset matching the documented TCIR schema.
    This is ONLY for software pipeline validation, NOT real data.
    """
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw'))
    os.makedirs(output_dir, exist_ok=True)
    asset_path = os.path.join(output_dir, 'pipeline_test_asset.h5')
    
    # Tiny dataset: 2 cyclones, 10 frames each = 20 total frames
    num_frames = 20
    
    with h5py.File(asset_path, 'w') as hf:
        # Create 'matrix': (N, 201, 201, 4) for IR1, WV, VIS, PMW
        # Using zeros to represent structural placeholders
        matrix_data = np.zeros((num_frames, 201, 201, 4), dtype=np.float32)
        hf.create_dataset('matrix', data=matrix_data)
        
        # Create 'info': structured array
        # Assuming minimal required fields based on TCIR: ID, lat, lon, Vmax (wind speed)
        dt = np.dtype([
            ('ID', 'S20'), 
            ('time', 'S20'),
            ('lat', 'f4'), 
            ('lon', 'f4'), 
            ('Vmax', 'f4')
        ])
        info_data = np.zeros((num_frames,), dtype=dt)
        
        # Assign dummy cyclone IDs and linearly increasing intensity to test grouping/trends
        for i in range(num_frames):
            cyclone_id = b"VALIDATION_CYC_01" if i < 10 else b"VALIDATION_CYC_02"
            info_data[i]['ID'] = cyclone_id
            info_data[i]['time'] = f"20170101{i:02d}".encode('utf-8')
            info_data[i]['lat'] = 10.0 + i
            info_data[i]['lon'] = 120.0 + i
            # Simulating wind speed (knots)
            info_data[i]['Vmax'] = 30.0 + (i * 2.0)
            
        hf.create_dataset('info', data=info_data)
        
    print(f"Successfully created pipeline validation asset at {asset_path}")

if __name__ == "__main__":
    create_validation_asset()
