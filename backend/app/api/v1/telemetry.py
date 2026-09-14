"""
GeoResilience AI — Telemetry Ingestion & Live Stream API

Endpoints:
  POST /api/v1/telemetry/ingest     — Ingest a single sensor reading
  GET  /api/v1/telemetry/latest     — Get latest readings for all sensors
  GET  /api/v1/telemetry/history    — Get time-series history for a sensor
  WS   /ws/telemetry                — WebSocket live telemetry stream
"""

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone
from typing import Optional

from app.core.database import get_db
from app.models.spatial_models import SensorTelemetry, Sensor

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])


# ─────────────── WebSocket Connection Manager ───────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                pass


ws_manager = ConnectionManager()


# ─────────────── REST Endpoints ───────────────

@router.post("/ingest")
def ingest_telemetry(payload: dict, db: Session = Depends(get_db)):
    """Ingest a single sensor telemetry reading."""
    record = SensorTelemetry(
        sensor_id=payload.get("sensor_id"),
        water_level_meters=payload.get("water_level_m"),
        soil_moisture_pct=payload.get("soil_moisture_pct"),
        pore_pressure_kpa=payload.get("pore_pressure_kpa"),
        rainfall_rate_mm_hr=payload.get("rainfall_rate_mm_hr"),
        battery_voltage=payload.get("battery_v"),
    )
    db.add(record)
    db.commit()

    return {
        "status": "ACCEPTED",
        "sensor_id": payload.get("sensor_id"),
        "processed_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/latest")
def get_latest_readings(db: Session = Depends(get_db)):
    """Get the most recent telemetry reading for each sensor."""
    sensors = db.query(Sensor).filter(Sensor.status == "ACTIVE").all()
    results = []

    for sensor in sensors:
        latest = (
            db.query(SensorTelemetry)
            .filter(SensorTelemetry.sensor_id == sensor.sensor_id)
            .order_by(desc(SensorTelemetry.recorded_at))
            .first()
        )

        results.append({
            "sensor_id": sensor.sensor_id,
            "name": sensor.name,
            "type": sensor.sensor_type,
            "lat": sensor.latitude,
            "lon": sensor.longitude,
            "elevation": sensor.elevation_meters,
            "status": sensor.status,
            "latest": {
                "water_level_m": latest.water_level_meters if latest else None,
                "soil_moisture_pct": latest.soil_moisture_pct if latest else None,
                "pore_pressure_kpa": latest.pore_pressure_kpa if latest else None,
                "rainfall_mm_hr": latest.rainfall_rate_mm_hr if latest else None,
                "battery_v": latest.battery_voltage if latest else None,
                "recorded_at": latest.recorded_at.isoformat() if latest else None,
            } if latest else None,
        })

    return {"sensors": results, "count": len(results)}


@router.get("/history")
def get_sensor_history(
    sensor_id: str = Query(..., description="Sensor ID to query"),
    limit: int = Query(100, ge=1, le=1000, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """Get time-series telemetry history for a specific sensor."""
    records = (
        db.query(SensorTelemetry)
        .filter(SensorTelemetry.sensor_id == sensor_id)
        .order_by(desc(SensorTelemetry.recorded_at))
        .limit(limit)
        .all()
    )

    return {
        "sensor_id": sensor_id,
        "count": len(records),
        "data": [
            {
                "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None,
                "water_level_m": r.water_level_meters,
                "soil_moisture_pct": r.soil_moisture_pct,
                "pore_pressure_kpa": r.pore_pressure_kpa,
                "rainfall_mm_hr": r.rainfall_rate_mm_hr,
                "battery_v": r.battery_voltage,
            }
            for r in records
        ],
    }
