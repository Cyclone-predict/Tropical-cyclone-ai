from io import BytesIO
from pathlib import Path

import h5py
import numpy as np
import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)
ROOT = Path(__file__).resolve().parent.parent
CHECKPOINT_PATH = ROOT / "models" / "intensity_prototype.pth"


def _tcir_hdf5_bytes(frame_count=1):
    buffer = BytesIO()
    matrix = np.arange(frame_count * 201 * 201 * 4, dtype=np.float32).reshape(
        frame_count, 201, 201, 4
    )
    with h5py.File(buffer, "w") as hdf5_file:
        hdf5_file.create_dataset("matrix", data=matrix)
    return buffer.getvalue()


def test_health_endpoint():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
    assert response.json()['service'] == 'CycloneAI Backend'


def test_analyze_requires_tcir_file():
    response = client.post('/analyze')
    assert response.status_code == 400
    payload = response.json()
    assert payload['success'] is False
    assert 'tcir' in payload['error'].lower()


def test_analyze_rejects_rgb_image_without_inventing_tcir_channels():
    response = client.post(
        '/analyze',
        files={'image': ('satellite.png', b'not a TCIR file', 'image/png')},
    )

    assert response.status_code == 415
    payload = response.json()
    assert payload['success'] is False
    assert 'four satellite channels' in payload['error'].lower()


def test_analyze_rejects_invalid_hdf5_content():
    response = client.post(
        '/analyze',
        files={'image': ('invalid.h5', b'not hdf5', 'application/x-hdf5')},
    )

    assert response.status_code == 400
    assert 'valid tcir hdf5' in response.json()['error'].lower()


@pytest.mark.skipif(not CHECKPOINT_PATH.is_file(), reason='Local prototype checkpoint is not generated')
def test_analyze_runs_member_1_inference_on_uploaded_tcir_hdf5():
    response = client.post(
        '/analyze',
        files={'image': ('sample.h5', _tcir_hdf5_bytes(), 'application/x-hdf5')},
    )

    assert response.status_code == 200, response.text
    payload = response.json()
    assert 'pattern' in payload
    assert 'predicted_vmax' in payload
    assert payload['note'] == 'Pipeline validation only - not trained on real TCIR data'
