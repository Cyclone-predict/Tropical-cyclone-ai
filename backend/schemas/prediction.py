from typing import Optional

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    cyclone_detected: bool
    pattern: Optional[str] = None
    confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=1
    )
    trend: Optional[str] = None