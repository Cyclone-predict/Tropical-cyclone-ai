from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import Base, engine
from backend.database import models
from backend.routes.prediction import router as prediction_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CycloneAI Labs API",
    description="Backend API for tropical cyclone identification, classification and prediction.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }