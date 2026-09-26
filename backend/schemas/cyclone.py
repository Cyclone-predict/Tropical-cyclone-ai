from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CycloneResponse(BaseModel):
    id: int
    name: Optional[str] = None
    timestamp: datetime
    location: Optional[str] = None
    satellite_source: Optional[str] = None
    image_reference: Optional[str] = None

    class Config:
        from_attributes = True