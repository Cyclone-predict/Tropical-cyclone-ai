from __future__ import annotations

import json
import importlib
from pathlib import Path
from typing import Any, Callable


def _load_predictor() -> Callable[..., Any]:
    """Load Member 1's inference function without hard-coding a missing file path."""
    module_names = ["ai.inference", "inference"]

    for module_name in module_names:
        try:
            module = importlib.import_module(module_name)
        except ModuleNotFoundError:
            continue

        predictor = getattr(module, "predict", None)
        if callable(predictor):
            return predictor

    raise RuntimeError(
        "Member 1 AI inference is not available in this checkout. "
        "Expected ai/inference.py with a predict(...) entry point on the Samiya branch."
    )


def _normalize_result(raw_result: Any) -> dict:
    if isinstance(raw_result, str):
        try:
            parsed = json.loads(raw_result)
            if isinstance(parsed, dict):
                return parsed
        except (TypeError, ValueError):
            pass

    if isinstance(raw_result, dict):
        return raw_result
    if hasattr(raw_result, "model_dump"):
        return raw_result.model_dump()
    if hasattr(raw_result, "dict"):
        return raw_result.dict()
    raise TypeError("AI inference must return a dictionary or JSON string.")


def predict_image(image_path: str) -> dict:
    """
    Execute the real Member 1 inference function when available.
    This bridge intentionally preserves the prototype pipeline without inventing values.
    """
    predictor = _load_predictor()
    candidates = [image_path, str(Path(image_path)), Path(image_path)]

    last_error: Exception | None = None

    for candidate in candidates:
        try:
            return _normalize_result(predictor(candidate))
        except TypeError as exc:
            last_error = exc
        except ValueError as exc:
            last_error = exc
        except Exception as exc:
            last_error = exc
            break

    try:
        with open(image_path, "rb") as image_file:
            image_bytes = image_file.read()
        return _normalize_result(predictor(image_bytes))
    except Exception as exc:
        last_error = exc

    raise RuntimeError(
        "AI inference failed for the uploaded image. "
        f"Details: {last_error or 'unknown inference error'}"
    ) from last_error