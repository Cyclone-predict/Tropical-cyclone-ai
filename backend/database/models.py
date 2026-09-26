from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .connection import Base


class Cyclone(Base):
    __tablename__ = "cyclones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location = Column(String(255), nullable=True)
    satellite_source = Column(String(255), nullable=True)
    image_reference = Column(String(500), nullable=True)

    predictions = relationship(
        "Prediction",
        back_populates="cyclone",
        cascade="all, delete-orphan"
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    cyclone_id = Column(
        Integer,
        ForeignKey("cyclones.id"),
        nullable=True
    )

    timestamp = Column(DateTime, default=datetime.utcnow)

    cyclone_detected = Column(Boolean, nullable=False)
    pattern = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True)
    trend = Column(String(100), nullable=True)

    cyclone = relationship(
        "Cyclone",
        back_populates="predictions"
    )


class HistoricalObservation(Base):
    __tablename__ = "historical_observations"

    id = Column(Integer, primary_key=True, index=True)

    cyclone_id = Column(
        Integer,
        ForeignKey("cyclones.id"),
        nullable=False
    )

    timestamp = Column(DateTime, default=datetime.utcnow)

    observation_data = Column(Text, nullable=True)
    satellite_source = Column(String(255), nullable=True)