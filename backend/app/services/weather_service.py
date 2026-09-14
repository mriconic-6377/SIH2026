"""
GeoResilience AI — OpenWeatherMap Real-Time Meteorological Service

Fetches live real-world weather conditions (Temperature, Humidity, Pressure, Wind, Rainfall)
for Mandi and Kullu district monitoring stations in Himachal Pradesh via OpenWeatherMap API.

API: https://api.openweathermap.org/data/2.5/weather?q={city},IN&units=metric&appid={key}
"""

import httpx
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.core.config import settings

CITIES = [
    {"city": "Mandi", "state": "Himachal Pradesh", "country": "IN", "lat": 31.7152, "lon": 76.9320},
    {"city": "Kullu", "state": "Himachal Pradesh", "country": "IN", "lat": 31.9580, "lon": 77.1025},
]


async def fetch_live_city_weather(city_name: str) -> Dict:
    """Fetch live meteorological telemetry for a single Himalayan city from OpenWeatherMap."""
    api_key = settings.openweathermap_api_key
    now_utc = datetime.now(timezone.utc).isoformat()

    if not api_key:
        return {
            "city": city_name,
            "status": "API_KEY_MISSING",
            "temperature_c": 22.5,
            "humidity_pct": 65,
            "pressure_hpa": 1012,
            "wind_speed_m_s": 2.1,
            "weather_condition": "Clear",
            "rain_1h_mm": 0.0,
            "timestamp": now_utc,
        }

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city_name},IN&units=metric&appid={api_key}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                main = data.get("main", {})
                wind = data.get("wind", {})
                weather = data.get("weather", [{}])[0]
                rain = data.get("rain", {})

                return {
                    "city": data.get("name", city_name),
                    "status": "LIVE_API_OK",
                    "temperature_c": round(main.get("temp", 22.0), 1),
                    "feels_like_c": round(main.get("feels_like", 22.0), 1),
                    "humidity_pct": main.get("humidity", 60),
                    "pressure_hpa": main.get("pressure", 1013),
                    "wind_speed_m_s": round(wind.get("speed", 2.0), 1),
                    "wind_deg": wind.get("deg", 0),
                    "weather_condition": weather.get("main", "Clouds"),
                    "weather_description": weather.get("description", "scattered clouds").title(),
                    "weather_icon": weather.get("icon", "03d"),
                    "rain_1h_mm": rain.get("1h", 0.0),
                    "cloudiness_pct": data.get("clouds", {}).get("all", 40),
                    "timestamp": now_utc,
                }
            else:
                return {
                    "city": city_name,
                    "status": f"HTTP_{resp.status_code}",
                    "temperature_c": 22.0,
                    "humidity_pct": 65,
                    "pressure_hpa": 1012,
                    "wind_speed_m_s": 2.5,
                    "weather_condition": "Partly Cloudy",
                    "rain_1h_mm": 0.0,
                    "timestamp": now_utc,
                }
    except Exception as e:
        return {
            "city": city_name,
            "status": f"ERROR_{str(e)}",
            "temperature_c": 22.0,
            "humidity_pct": 65,
            "pressure_hpa": 1012,
            "wind_speed_m_s": 2.5,
            "weather_condition": "Partly Cloudy",
            "rain_1h_mm": 0.0,
            "timestamp": now_utc,
        }


async def fetch_all_valley_weather() -> Dict:
    """Fetch live meteorological observations across all stations in the Beas Valley."""
    results = []
    for c in CITIES:
        data = await fetch_live_city_weather(c["city"])
        data["lat"] = c["lat"]
        data["lon"] = c["lon"]
        results.append(data)

    return {
        "provider": "OpenWeatherMap API (data/2.5/weather)",
        "stations_count": len(results),
        "stations": results,
    }
