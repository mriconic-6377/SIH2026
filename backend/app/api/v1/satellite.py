"""
GeoResilience AI — Satellite & Remote Sensing API

Endpoints:
  GET  /api/v1/satellite/gpm-rainfall  — Real-time NASA GPM IMERG 0.1° satellite rainfall grids as GeoJSON
"""

from fastapi import APIRouter, Query
from app.services.nasa_gpm_service import fetch_nasa_gpm_rainfall

router = APIRouter(prefix="/api/v1/satellite", tags=["Satellite Remote Sensing"])


@router.get("/gpm-rainfall")
async def get_gpm_rainfall(
    intensity_multiplier: float = Query(1.0, ge=0.1, le=10.0, description="Multiplier for simulated cloudburst testing")
):
    """
    Returns real-time / calibrated NASA GPM IMERG satellite rainfall raster grid (GeoJSON)
    for the Beas River catchment authenticated via NASA Earthdata Login.
    """
    data = await fetch_nasa_gpm_rainfall(simulated_rain_multiplier=intensity_multiplier)
    return data
