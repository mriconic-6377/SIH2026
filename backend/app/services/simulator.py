"""
GeoResilience AI — Virtual IoT Sensor Fleet Simulator

Generates realistic time-series telemetry data for 8 sensor stations along
the Beas River (Mandi-Kullu, Himachal Pradesh). Simulates:
  - Normal dry weather baselines
  - Gradual monsoon rainfall build-up
  - Sudden cloudburst spikes (100+ mm/hr)
  - Soil saturation curves with hysteresis
  - Upstream river stage surge propagation (with time-delay per station)

Run modes:
  1. Background async task inside FastAPI (auto-streams to DB + WebSocket)
  2. Interactive spike trigger via API endpoint (/api/v1/simulate/spike)
"""

import random
import math
import asyncio
from datetime import datetime, timezone
from typing import Optional, Callable

from app.core.database import SessionLocal
from app.models.spatial_models import SensorTelemetry, Sensor


# ─────────────────── Sensor Behavior Profiles ───────────────────

SENSOR_PROFILES = {
    "SN-KULLU-001": {"type": "RIVER", "base_level": 1.8, "base_rain": 5.0, "base_moisture": 45.0},
    "SN-BHUNTAR-002": {"type": "RIVER", "base_level": 2.0, "base_rain": 6.0, "base_moisture": 48.0},
    "SN-LARJI-003": {"type": "RIVER", "base_level": 2.5, "base_rain": 7.0, "base_moisture": 50.0},
    "SN-AUT-004": {"type": "RIVER", "base_level": 2.2, "base_rain": 8.0, "base_moisture": 52.0},
    "SN-PANDOH-005": {"type": "RIVER", "base_level": 2.8, "base_rain": 6.5, "base_moisture": 47.0},
    "SN-MANDI-006": {"type": "RIVER", "base_level": 3.0, "base_rain": 5.5, "base_moisture": 44.0},
    "SN-SLOPE-007": {"type": "SOIL", "base_level": 0.0, "base_rain": 7.0, "base_moisture": 55.0},
    "SN-SLOPE-008": {"type": "SOIL", "base_level": 0.0, "base_rain": 8.0, "base_moisture": 58.0},
}


class VirtualSensorFleet:
    """
    Simulates a fleet of IoT sensors streaming realistic hydro-meteorological data.
    """

    def __init__(self):
        self.tick = 0
        self.is_spike_active = False
        self.spike_intensity = 0.0
        self.spike_start_tick = 0
        self.spike_duration_ticks = 12  # ~60 seconds at 5s intervals
        self._subscribers: list[Callable] = []

    def subscribe(self, callback: Callable):
        """Register a callback to receive each telemetry reading."""
        self._subscribers.append(callback)

    def trigger_cloudburst_spike(self, intensity: float = 1.0):
        """
        Trigger a simulated cloudburst event.

        Args:
            intensity: 0.0-1.0 scale (1.0 = catastrophic 150mm/hr event).
        """
        self.is_spike_active = True
        self.spike_intensity = min(max(intensity, 0.1), 1.0)
        self.spike_start_tick = self.tick
        print(f"[SIMULATOR] CLOUDBURST triggered! Intensity: {self.spike_intensity:.1f}")

    def _compute_spike_factor(self) -> float:
        """Compute the spike envelope (bell-curve rise and decay)."""
        if not self.is_spike_active:
            return 0.0

        elapsed = self.tick - self.spike_start_tick
        if elapsed >= self.spike_duration_ticks:
            self.is_spike_active = False
            return 0.0

        # Bell-curve envelope: peaks at duration/3, decays after
        peak_tick = self.spike_duration_ticks / 3.0
        factor = math.exp(-0.5 * ((elapsed - peak_tick) / (self.spike_duration_ticks / 4.0)) ** 2)
        return factor * self.spike_intensity

    def generate_tick(self) -> list[dict]:
        """
        Generate one tick of telemetry for all sensors.

        Returns:
            List of telemetry dictionaries (one per sensor).
        """
        self.tick += 1
        spike_factor = self._compute_spike_factor()
        readings = []

        for sensor_id, profile in SENSOR_PROFILES.items():
            now = datetime.now(timezone.utc)

            # ── Diurnal cycle (slight variation over day) ──
            diurnal = 0.1 * math.sin(self.tick * 0.02)

            # ── Rainfall ──
            base_rain = profile["base_rain"]
            noise_rain = random.gauss(0, 1.5)
            spike_rain = spike_factor * random.uniform(80, 150)
            rainfall = max(0, base_rain + noise_rain + spike_rain + diurnal * 2)

            # ── Soil Moisture (responds slowly to rainfall with hysteresis) ──
            base_moisture = profile["base_moisture"]
            moisture_rise = spike_factor * 35.0 * (1 - math.exp(-self.tick * 0.05))
            noise_moisture = random.gauss(0, 1.0)
            soil_moisture = min(100.0, max(10.0, base_moisture + moisture_rise + noise_moisture))

            # ── Water Level (river sensors only, downstream delay) ──
            water_level = None
            if profile["type"] == "RIVER":
                base_level = profile["base_level"]
                # Downstream sensors get the surge with a time delay
                sensor_index = list(SENSOR_PROFILES.keys()).index(sensor_id)
                delay_factor = max(0, spike_factor - sensor_index * 0.08)
                surge = delay_factor * random.uniform(2.5, 5.0)
                noise_level = random.gauss(0, 0.05)
                water_level = round(max(0.1, base_level + surge + noise_level + diurnal * 0.3), 3)

            # ── Pore-Water Pressure (responds to moisture saturation) ──
            pore_pressure = round(max(0, (soil_moisture / 100.0) * 65.0 + random.gauss(0, 2.0)), 2)

            # ── Battery voltage (slow drain with solar recharge cycle) ──
            battery = round(3.7 + 0.3 * math.sin(self.tick * 0.01) + random.gauss(0, 0.02), 2)

            reading = {
                "sensor_id": sensor_id,
                "timestamp": now.isoformat(),
                "water_level_m": water_level,
                "soil_moisture_pct": round(soil_moisture, 2),
                "pore_pressure_kpa": pore_pressure,
                "rainfall_rate_mm_hr": round(rainfall, 2),
                "battery_v": battery,
            }

            readings.append(reading)

        # Notify subscribers
        for callback in self._subscribers:
            try:
                callback(readings)
            except Exception:
                pass

        return readings

    def save_tick_to_db(self, readings: list[dict]):
        """Persist one tick of readings to the database."""
        db = SessionLocal()
        try:
            for r in readings:
                record = SensorTelemetry(
                    sensor_id=r["sensor_id"],
                    water_level_meters=r["water_level_m"],
                    soil_moisture_pct=r["soil_moisture_pct"],
                    pore_pressure_kpa=r["pore_pressure_kpa"],
                    rainfall_rate_mm_hr=r["rainfall_rate_mm_hr"],
                    battery_voltage=r["battery_v"],
                )
                db.add(record)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[SIMULATOR] DB write error: {e}")
        finally:
            db.close()


# ─────────────────── Global Simulator Instance ───────────────────

simulator = VirtualSensorFleet()
