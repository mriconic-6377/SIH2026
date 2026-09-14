# ⚙️ System Requirements & Technical Specification (SRS)
## 🛡️ GeoResilience AI Platform Specifications

> **Document Type:** Software & Hardware Requirements Specification (SRS)  
> **Version:** 1.0.0  
> **Tech Stack Core:** FastAPI (Python 3.11) + PostgreSQL 16 / PostGIS + Next.js 14 + Leaflet/CesiumJS + ESP32 LoRa

---

## 1. System Architecture & Component Interactions

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    END-TO-END DATA FLOW MATRIX                                  │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────────────┤
│ Component                │ Protocols / Formats      │ Responsibilities                          │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────────────┤
│ **Edge Sensor Node**     │ LoRa P2P (868 MHz) / C++ │ Reads ADC sensors, evaluates threshold    │
│ **Valley Base Gateway**  │ LoRa RX + 4G LTE / MQTT  │ Relays local siren trigger & pushes JSON  │
│ **FastAPI Backend**      │ REST / WebSocket / JSON  │ Ingestion, GIS queries, AI inference      │
│ **PostGIS Database**     │ SQL / GeoJSON / WKT      │ Spatial indexing, spatial intersections   │
│ **Next.js 3D Dashboard** │ WebGL / CesiumJS / REST  │ Renders 3D terrain, SHAP cards, sliders   │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────────────┘
```

---

## 2. Database Schema (PostgreSQL + PostGIS Spatial Entities)

### 2.1 Table: `sensors` (IoT Telemetry Stations)
```sql
CREATE TABLE sensors (
    sensor_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL, -- 'RIVER_STAGE', 'SOIL_MOISTURE', 'GEOPHONE_ACOUSTIC'
    basin_id VARCHAR(50) NOT NULL,
    elevation_meters DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL, -- PostGIS WGS84 Point
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sensors_location ON sensors USING GIST(location);
```

### 2.2 Table: `sensor_telemetry` (Time-Series Data Stream)
```sql
CREATE TABLE sensor_telemetry (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) REFERENCES sensors(sensor_id),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    water_level_meters DOUBLE PRECISION,
    soil_moisture_percentage DOUBLE PRECISION,
    pore_water_pressure_kpa DOUBLE PRECISION,
    rainfall_rate_mm_hr DOUBLE PRECISION,
    battery_voltage DOUBLE PRECISION
);
CREATE INDEX idx_telemetry_time ON sensor_telemetry(sensor_id, recorded_at DESC);
```

### 2.3 Table: `habitations` (Vulnerable Villages & Wards)
```sql
CREATE TABLE habitations (
    habitation_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    total_population INT NOT NULL,
    elderly_children_ratio DOUBLE PRECISION DEFAULT 0.25,
    kutcha_house_ratio DOUBLE PRECISION DEFAULT 0.40,
    safe_relocation_center_id VARCHAR(50),
    boundary_geom GEOMETRY(Polygon, 4326) NOT NULL
);
CREATE INDEX idx_habitations_geom ON habitations USING GIST(boundary_geom);
```

### 2.4 Table: `hazard_zones` (Dynamic Red / Orange / Green Classifications)
```sql
CREATE TABLE hazard_zones (
    zone_id BIGSERIAL PRIMARY KEY,
    hazard_type VARCHAR(50) NOT NULL, -- 'FLASH_FLOOD', 'LANDSLIDE'
    risk_level VARCHAR(20) NOT NULL,  -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    factor_of_safety DOUBLE PRECISION,
    flood_depth_estimated_m DOUBLE PRECISION,
    evacuation_lead_time_mins INT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    zone_polygon GEOMETRY(Polygon, 4326) NOT NULL
);
CREATE INDEX idx_hazard_zones_poly ON hazard_zones USING GIST(zone_polygon);
```

---

## 3. REST API Contracts & Data Payloads

### 3.1 Endpoint: Telemetry Stream Ingestion
* **Route:** `POST /api/v1/telemetry/ingest`
* **Request Payload:**
```json
{
  "sensor_id": "SN-HIMALAYA-001",
  "timestamp": "2026-08-26T20:30:00Z",
  "water_level_m": 4.85,
  "soil_moisture_pct": 92.4,
  "pore_pressure_kpa": 48.2,
  "rainfall_rate_mm_hr": 85.0,
  "battery_v": 3.92
}
```
* **Response (200 OK):**
```json
{
  "status": "ACCEPTED",
  "processed_at": "2026-08-26T20:30:00.120Z",
  "local_alert_triggered": true,
  "risk_classification": "CRITICAL"
}
```

---

### 3.2 Endpoint: Real-Time Dynamic Risk & Lead-Time Prediction
* **Route:** `POST /api/v1/predict/lead-time`
* **Request Payload:**
```json
{
  "basin_id": "MANDI-VALLEY-B3",
  "current_rainfall_mm_hr": 110.0,
  "upstream_water_stage_m": 6.20,
  "soil_saturation_index": 0.94
}
```
* **Response Payload (GeoJSON + Risk Summary):**
```json
{
  "basin_id": "MANDI-VALLEY-B3",
  "risk_summary": {
    "risk_level": "CRITICAL",
    "risk_probability": 0.88,
    "factor_of_safety": 0.82,
    "time_to_peak_surge_mins": 38,
    "safe_evacuation_window_mins": 25
  },
  "explainability_shap": {
    "rainfall_intensity_pct": 42.0,
    "soil_saturation_pct": 28.0,
    "steep_slope_pct": 18.0,
    "upstream_wave_speed_pct": 12.0
  },
  "affected_infrastructure": {
    "villages_threatened": ["Rampur", "Dharampur"],
    "submerged_bridges": ["Bridge #4 (NH-58)"],
    "recommended_shelter": "Green Zone Community Hall B (2.4 km)"
  }
}
```

---

## 4. Hardware Specifications & Edge Circuit Pinouts

```
  ┌────────────────────────────────────────────────────────┐
  │                 ESP32-S3 MICROCONTROLLER               │
  │                                                        │
  │  [ADC Pin GPIO34] ◄─── Capacitive Soil Moisture Sensor │
  │  [ADC Pin GPIO35] ◄─── Piezoelectric Geophone Probe    │
  │  [UART / Trig GPIO4/5]◄── JSN-SR04T Ultrasonic Sensor  │
  │                                                        │
  │  [SPI Pins (18,19,23)]◄── Semtech SX1262 LoRa Module   │
  │  [Digital Pin GPIO12] ───► Relay Module (110dB Siren)  │
  └────────────────────────────────────────────────────────┘
```

* **LoRa Frequency Band:** 868.0 MHz (IN865-867 Licensed Free Band in India) / 433.0 MHz.
* **Firmware Framework:** C++ using PlatformIO / Arduino Core with `RadioLib` & `EdgeImpulse / TFLite-Micro`.
* **Sleep Cycle:** 90% Deep Sleep duty cycle during dry periods; wakes up immediately via hardware threshold interrupt during sudden rainfall / water surge.
