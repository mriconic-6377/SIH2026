"""
GeoResilience AI — SQLAlchemy ORM Models
Defines all spatial and temporal entities for the disaster early warning system.
Uses plain lat/lon columns for SQLite compatibility and full PostGIS geometry when available.
"""

from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean, Index
)
from sqlalchemy.sql import func
from app.core.database import Base


# ─────────────────────────── Sensor Station ───────────────────────────

class Sensor(Base):
    """IoT sensor station deployed along the Beas River basin."""
    __tablename__ = "sensors"

    sensor_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    sensor_type = Column(String(50), nullable=False)  # RIVER_STAGE, SOIL_MOISTURE, RAIN_GAUGE
    basin_id = Column(String(50), nullable=False)
    elevation_meters = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(20), default="ACTIVE")
    last_ping = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────── Telemetry Data ───────────────────────────

class SensorTelemetry(Base):
    """Time-series telemetry readings from IoT sensor stations."""
    __tablename__ = "sensor_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(String(50), ForeignKey("sensors.sensor_id"), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    water_level_meters = Column(Float, nullable=True)
    soil_moisture_pct = Column(Float, nullable=True)
    pore_pressure_kpa = Column(Float, nullable=True)
    rainfall_rate_mm_hr = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)

    __table_args__ = (
        Index("idx_telemetry_sensor_time", "sensor_id", "recorded_at"),
    )


# ─────────────────────────── Habitation (Village) ───────────────────────────

class Habitation(Base):
    """Vulnerable village or ward in the flood/landslide zone."""
    __tablename__ = "habitations"

    habitation_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False, default="Mandi")
    state = Column(String(100), nullable=False, default="Himachal Pradesh")
    total_population = Column(Integer, nullable=False)
    elderly_children_ratio = Column(Float, default=0.25)
    kutcha_house_ratio = Column(Float, default=0.40)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_meters = Column(Float, default=800.0)
    nearest_shelter_id = Column(String(50), nullable=True)


# ─────────────────────────── Critical Infrastructure ───────────────────────────

class Bridge(Base):
    """Highway bridge or culvert that may be submerged during floods."""
    __tablename__ = "bridges"

    bridge_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    highway = Column(String(50), nullable=False)  # e.g. NH-21, NH-154
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    deck_elevation_meters = Column(Float, nullable=False)  # Height above river bed
    span_meters = Column(Float, default=50.0)
    is_submerged = Column(Boolean, default=False)


# ─────────────────────────── Safe Shelter / Green Zone ───────────────────────────

class Shelter(Base):
    """Safe relocation center / green zone for evacuated populations."""
    __tablename__ = "shelters"

    shelter_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    shelter_type = Column(String(50), default="COMMUNITY_HALL")  # SCHOOL, HELIPAD, COMMUNITY_HALL
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_meters = Column(Float, nullable=False)
    capacity_persons = Column(Integer, nullable=False)
    has_road_access = Column(Boolean, default=True)
    has_water_supply = Column(Boolean, default=True)


# ─────────────────────────── Dynamic Hazard Zone ───────────────────────────

class HazardZone(Base):
    """Dynamically computed risk zone (Red / Orange / Green classification)."""
    __tablename__ = "hazard_zones"

    zone_id = Column(Integer, primary_key=True, autoincrement=True)
    hazard_type = Column(String(50), nullable=False)  # FLASH_FLOOD, LANDSLIDE
    risk_level = Column(String(20), nullable=False)    # LOW, MODERATE, HIGH, CRITICAL
    risk_probability = Column(Float, nullable=True)
    factor_of_safety = Column(Float, nullable=True)
    flood_depth_estimated_m = Column(Float, nullable=True)
    evacuation_lead_time_mins = Column(Integer, nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    radius_km = Column(Float, default=2.0)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)


# ─────────────────────────── Alert Record ───────────────────────────

class AlertRecord(Base):
    """Log of all warnings and alerts dispatched by the system."""
    __tablename__ = "alert_records"

    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    alert_type = Column(String(50), nullable=False)  # SIREN, SMS, CAP, DASHBOARD
    severity = Column(String(20), nullable=False)     # WARNING, CRITICAL, EXTREME
    target_habitation_id = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    dispatched_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged = Column(Boolean, default=False)
