"""
GeoResilience AI — Real-Time Meteorological API

Endpoints:
  GET  /api/v1/weather/live  — Fetches live weather for Mandi and Kullu monitoring stations via OpenWeatherMap
"""

from fastapi import APIRouter
from app.services.weather_service import fetch_all_valley_weather

router = APIRouter(prefix="/api/v1/weather", tags=["Meteorological Weather"])


@router.get("/live")
async def get_live_weather():
    """
    Returns live meteorological observations (Temperature, Humidity, Pressure, Wind, Rainfall)
    from OpenWeatherMap API for Mandi & Kullu monitoring stations in Himachal Pradesh.
    """
    data = await fetch_all_valley_weather()
    return data
