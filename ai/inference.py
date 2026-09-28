import os
import torch
import numpy as np
import h5py

from ai.model.prediction_model import get_model


def predict(image_input_path: str):
    """
    Inference interface for Member 2 Backend integration.

    Args:
        image_input_path (str):
            Path to a TCIR HDF5 file containing a dataset named "matrix".

            Expected matrix shape:
                (N, 201, 201, 4)

            The first frame is used:
                (201, 201, 4)

            Then transposed to:
                (4, 201, 201)

    Returns:
        dict:
            Prediction result for the backend/frontend.
    """

    print("\n--- PIPELINE VALIDATION ONLY ---")
    print(
        "Executing structural inference logic on the uploaded TCIR asset. "
        "NOT real-world meteorological predictions.\n"
    )

    # ---------------------------------------------------------
    # 1. Load the existing model architecture
    # ---------------------------------------------------------

    model = get_model()

    checkpoint_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "models",
            "intensity_prototype.pth"
        )
    )

    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(
            f"Required model checkpoint not found: {checkpoint_path}"
        )

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device
    )

    model.load_state_dict(checkpoint)
    model.to(device)
    model.eval()

    # ---------------------------------------------------------
    # 2. Validate and read the TCIR HDF5 input
    # ---------------------------------------------------------

    if not os.path.isfile(image_input_path):
        raise FileNotFoundError(
            f"Input file not found: {image_input_path}"
        )

    try:
        with h5py.File(image_input_path, "r") as h5_file:

            if "matrix" not in h5_file:
                raise KeyError(
                    "TCIR HDF5 file does not contain the required "
                    "'matrix' dataset."
                )

            matrix = np.asarray(h5_file["matrix"])

    except OSError as exc:
        raise ValueError(
            f"Unable to read the TCIR HDF5 file: {str(exc)}"
        ) from exc

    # ---------------------------------------------------------
    # 3. Validate expected TCIR matrix shape
    # ---------------------------------------------------------

    if matrix.ndim != 4:
        raise ValueError(
            "Invalid TCIR matrix shape. Expected "
            "(N, 201, 201, 4), "
            f"but received {matrix.shape}."
        )

    if (
        matrix.shape[1] != 201
        or matrix.shape[2] != 201
        or matrix.shape[3] != 4
    ):
        raise ValueError(
            "Invalid TCIR matrix shape. Expected "
            "(N, 201, 201, 4), "
            f"but received {matrix.shape}."
        )

    if matrix.shape[0] == 0:
        raise ValueError(
            "TCIR matrix contains no frames."
        )

    # ---------------------------------------------------------
    # 4. Use the first frame
    # ---------------------------------------------------------

    first_frame = matrix[0]

    # Expected:
    # (201, 201, 4)

    # Convert to:
    # (4, 201, 201)

    first_frame = np.transpose(
        first_frame,
        (2, 0, 1)
    )

    # ---------------------------------------------------------
    # 5. Normalize exactly as required
    # ---------------------------------------------------------

    first_frame = first_frame.astype(
        np.float32
    ) / 255.0

    # Add batch dimension:
    # (4, 201, 201)
    #      ↓
    # (1, 4, 201, 201)

    input_tensor = torch.from_numpy(
        first_frame
    ).unsqueeze(0).to(device)

    # ---------------------------------------------------------
    # 6. Model prediction
    # ---------------------------------------------------------

    with torch.no_grad():
        intensity_output = model(input_tensor)

    intensity_pred = (
        intensity_output
        .detach()
        .reshape(-1)[0]
        .item()
    )

    # ---------------------------------------------------------
    # 7. Prototype classification/trend logic
    # ---------------------------------------------------------

    pattern = "Unknown"
    trend = "Stable"

    confidence = 0.85

    if intensity_pred < 34:
        pattern = "Tropical Depression"

    elif 34 <= intensity_pred < 64:
        pattern = "Tropical Storm"

    else:
        pattern = "Hurricane / Typhoon"
        trend = "Intensifying"

    cyclone_detected = True

    # ---------------------------------------------------------
    # 8. Return Python dictionary
    # ---------------------------------------------------------

    result = {
        "cyclone_detected": cyclone_detected,
        "pattern": pattern,
        "predicted_vmax": round(float(intensity_pred), 2),
        "confidence": confidence,
        "trend": trend,
        "note": (
            "Pipeline validation only - "
            "not trained on real TCIR data"
        )
    }

    return result


if __name__ == "__main__":
    test_input = "dummy_image.h5"

    try:
        result = predict(test_input)

        print("MEMBER 2 JSON OUTPUT:")
        print(result)

    except Exception as exc:
        print(f"INFERENCE ERROR: {exc}")