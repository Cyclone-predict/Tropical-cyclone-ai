import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import Base, engine
from backend.routes.prediction import router as prediction_router

Base.metadata.create_all(bind=engine)


frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
).split(",")

app = FastAPI(
    title="CycloneAI Labs API",
    description="Prototype backend API for tropical cyclone image analysis and AI integration.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(prediction_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CycloneAI Backend"
    }