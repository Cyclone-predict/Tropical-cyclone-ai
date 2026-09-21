# CycloneAI Labs - Frontend

This is the frontend dashboard for **CycloneAI Labs**, an AI/ML-based tropical cyclone identification, classification, and prediction system using multi-source satellite data.

## Project Overview

This frontend connects to a FastAPI backend that handles advanced AI/ML inference. It visualizes:
- Current cyclone status, confidence scores, and trends.
- AI explainability (heatmaps/Grad-CAM) over satellite imagery.
- Historical cyclone tracks and predicted trajectories on interactive maps.
- Chronological evolution of storm patterns.

## Technology Stack

- **React 19**
- **Vite**
- **JavaScript / JSX**
- **React Leaflet** (Mapping)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)
- **Tailwind-inspired utility CSS** (Vanilla CSS variables & flex/grid)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Copy `.env.example` to `.env` or set the variable directly:

```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to the running FastAPI server:
```
VITE_API_URL=http://localhost:8000
```

## Available Scripts

### Development

To start the development server:

```bash
npm run dev
```

### Production Build

To build the application for production:

```bash
npm run build
```

The output will be generated in the `dist/` directory.

## Backend Requirements & API Endpoints

The frontend requires the backend to implement the following REST endpoints:
- `POST /predict` (multipart/form-data with `file`)
- `GET /cyclones`
- `GET /cyclones/{id}`
- `GET /cyclones/{id}/history`
- `GET /cyclones/{id}/prediction`

## Demo Mode

The application includes a **Demo Mode** toggle in the header. When enabled, the frontend injects realistic mock data. This is strictly for demonstration and development purposes when the AI backend is unavailable. 

> **Important Data Integrity Rule:** 
> Demo values are clearly labelled. The application never fabricates scientific prediction values in live API mode.

## Troubleshooting

- **Map not rendering correctly:** Ensure you are connected to the internet (Leaflet pulls tiles from Carto/OSM).
- **Network Errors:** Verify the FastAPI server is running on `http://localhost:8000` and CORS is enabled on the backend.
- **Images not uploading:** Only image formats (JPG, PNG, TIFF) are supported.
