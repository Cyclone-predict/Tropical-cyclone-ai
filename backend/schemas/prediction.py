from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class PredictionResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    cyclone_detected: Optional[bool] = None
    pattern: Optional[str] = None
    predicted_vmax: Optional[float] = None
    confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=1
    )
    trend: Optional[str] = None
    note: Optional[str] = None
    raw: Optional[Any] = None