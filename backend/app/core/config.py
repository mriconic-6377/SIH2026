"""
GeoResilience AI — Application Configuration
Loads settings from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    app_name: str = "GeoResilience AI"
    app_version: str = "1.0.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite:///./georesilience.db"

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Simulator
    simulator_interval_seconds: float = 5.0
    simulator_num_sensors: int = 8

    # NASA Earthdata / GPM IMERG Token
    nasa_earthdata_token: Optional[str] = None

    # OpenWeatherMap API Key
    openweathermap_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
