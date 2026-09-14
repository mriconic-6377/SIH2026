"""
GeoResilience AI — Prediction & Physics Engine API

Endpoints:
  POST /api/v1/predict/slope-stability   — Mohr-Coulomb Factor of Safety
  POST /api/v1/predict/lead-time         — Basin-wide evacuation lead times
  POST /api/v1/predict/risk-attribution  — SHAP-style feature attribution
  POST /api/v1/predict/full-assessment   — Combined unified risk assessment
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from dataclasses import asdict

from app.physics_ai.mohr_coulomb import compute_factor_of_safety
from app.physics_ai.wave_routing import compute_basin_lead_times, compute_manning_discharge
from app.physics_ai.explainability import compute_risk_attribution

router = APIRouter(prefix="/api/v1/predict", tags=["Prediction & Physics"])


# ─────────────── Request / Response Schemas ───────────────

class SlopeStabilityRequest(BaseModel):
    slope_angle_deg: float = Field(..., ge=0, le=90, description="Slope gradient in degrees")
    soil_moisture_pct: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    rainfall_rate_mm_hr: float = Field(0.0, ge=0, description="Current rainfall intensity")
    cumulative_rain_24h_mm: float = Field(0.0, ge=0, description="24h cumulative rainfall")
    soil_type: str = Field("colluvial_clay", description="Soil type key")


class LeadTimeRequest(BaseModel):
    basin_id: str = Field("BEAS-MANDI", description="River basin identifier")
    upstream_sensor_id: str = Field("SN-KULLU-001", description="Upstream sensor ID")
    upstream_water_depth_m: float = Field(..., ge=0, description="Current upstream water depth")


class RiskAttributionRequest(BaseModel):
    rainfall_rate_mm_hr: float = Field(0.0, ge=0)
    soil_moisture_pct: float = Field(50.0, ge=0, le=100)
    slope_angle_deg: float = Field(15.0, ge=0, le=90)
    upstream_water_depth_m: float = Field(1.0, ge=0)
    cumulative_rain_24h_mm: float = Field(0.0, ge=0)
    pore_pressure_kpa: float = Field(0.0, ge=0)


class FullAssessmentRequest(BaseModel):
    """Combined request for a unified risk assessment at a specific location."""
    slope_angle_deg: float = Field(25.0, ge=0, le=90)
    soil_moisture_pct: float = Field(60.0, ge=0, le=100)
    rainfall_rate_mm_hr: float = Field(20.0, ge=0)
    cumulative_rain_24h_mm: float = Field(50.0, ge=0)
    upstream_water_depth_m: float = Field(3.0, ge=0)
    pore_pressure_kpa: float = Field(20.0, ge=0)
    soil_type: str = Field("colluvial_clay")
    basin_id: str = Field("BEAS-MANDI")
    upstream_sensor_id: str = Field("SN-KULLU-001")


# ─────────────── Endpoints ───────────────

@router.post("/slope-stability")
def predict_slope_stability(req: SlopeStabilityRequest):
    """Compute Mohr-Coulomb Factor of Safety for slope stability analysis."""
    result = compute_factor_of_safety(
        slope_angle_deg=req.slope_angle_deg,
        soil_moisture_pct=req.soil_moisture_pct,
        rainfall_rate_mm_hr=req.rainfall_rate_mm_hr,
        cumulative_rain_24h_mm=req.cumulative_rain_24h_mm,
        soil_type=req.soil_type,
    )
    return asdict(result)


@router.post("/lead-time")
def predict_lead_time(req: LeadTimeRequest):
    """Compute evacuation lead-time for all downstream habitations in a basin."""
    report = compute_basin_lead_times(
        basin_id=req.basin_id,
        upstream_sensor_id=req.upstream_sensor_id,
        upstream_water_depth_m=req.upstream_water_depth_m,
    )

    return {
        "basin_id": report.basin_id,
        "upstream_sensor_id": report.upstream_sensor_id,
        "current_water_depth_m": report.current_water_depth_m,
        "surge_wave_speed_m_s": report.surge_wave_speed_m_s,
        "overall_urgency": report.overall_urgency,
        "discharge_m3_s": compute_manning_discharge(report.current_water_depth_m),
        "habitations": [asdict(h) for h in report.habitation_results],
    }


@router.post("/risk-attribution")
def predict_risk_attribution(req: RiskAttributionRequest):
    """Compute SHAP-style feature attribution for risk explanation."""
    result = compute_risk_attribution(
        rainfall_rate_mm_hr=req.rainfall_rate_mm_hr,
        soil_moisture_pct=req.soil_moisture_pct,
        slope_angle_deg=req.slope_angle_deg,
        upstream_water_depth_m=req.upstream_water_depth_m,
        cumulative_rain_24h_mm=req.cumulative_rain_24h_mm,
        pore_pressure_kpa=req.pore_pressure_kpa,
    )
    return asdict(result)


@router.post("/full-assessment")
def full_risk_assessment(req: FullAssessmentRequest):
    """
    Unified risk assessment combining all physics engines:
    Mohr-Coulomb slope stability + Lead-time routing + SHAP attribution.
    """
    # 1. Slope stability
    slope_result = compute_factor_of_safety(
        slope_angle_deg=req.slope_angle_deg,
        soil_moisture_pct=req.soil_moisture_pct,
        rainfall_rate_mm_hr=req.rainfall_rate_mm_hr,
        cumulative_rain_24h_mm=req.cumulative_rain_24h_mm,
        soil_type=req.soil_type,
    )

    # 2. Lead-time routing
    lead_report = compute_basin_lead_times(
        basin_id=req.basin_id,
        upstream_sensor_id=req.upstream_sensor_id,
        upstream_water_depth_m=req.upstream_water_depth_m,
    )

    # 3. Explainability
    explain_result = compute_risk_attribution(
        rainfall_rate_mm_hr=req.rainfall_rate_mm_hr,
        soil_moisture_pct=req.soil_moisture_pct,
        slope_angle_deg=req.slope_angle_deg,
        upstream_water_depth_m=req.upstream_water_depth_m,
        cumulative_rain_24h_mm=req.cumulative_rain_24h_mm,
        pore_pressure_kpa=req.pore_pressure_kpa,
    )

    # 4. Derive the worst-case overall risk
    risk_levels = [slope_result.risk_level, lead_report.overall_urgency, explain_result.risk_level]
    severity_order = {"LOW": 0, "ADEQUATE": 0, "MODERATE": 1, "TIGHT": 2, "HIGH": 2, "CRITICAL": 3, "INSUFFICIENT": 3}
    worst_risk = max(risk_levels, key=lambda r: severity_order.get(r, 0))

    return {
        "overall_risk_level": worst_risk,
        "slope_stability": asdict(slope_result),
        "lead_time": {
            "basin_id": lead_report.basin_id,
            "surge_wave_speed_m_s": lead_report.surge_wave_speed_m_s,
            "discharge_m3_s": compute_manning_discharge(lead_report.current_water_depth_m),
            "overall_urgency": lead_report.overall_urgency,
            "habitations": [asdict(h) for h in lead_report.habitation_results],
        },
        "explainability": asdict(explain_result),
    }


# ─────────────── Rigorous Mathematical Proof & Validation ───────────────

@router.get("/math-validation")
def get_mathematical_validation(
    rainfall_rate_mm_hr: float = 35.0,
    duration_hrs: float = 2.0,
    slope_angle_deg: float = 37.7,
    upstream_water_depth_m: float = 3.5,
):
    """
    Returns step-by-step rigorous mathematical validation of physical laws:
      1. Green-Ampt Cumulative Infiltration & Transient Pore-Water Pressure (kPa)
      2. Mohr-Coulomb Factor of Safety (Fs) with Cartosat DEM Slope
      3. St. Venant 1D Hydrodynamic Surge Routing & Evacuation Lead Time
    """
    from app.physics_ai.math_engine import run_full_mathematical_validation
    report = run_full_mathematical_validation(
        rainfall_rate_mm_hr=rainfall_rate_mm_hr,
        duration_hrs=duration_hrs,
        slope_angle_deg=slope_angle_deg,
        upstream_water_depth_m=upstream_water_depth_m,
    )
    return asdict(report)


# ─────────────── 6 Villages & 4 Bridges Physical Status & Impact Prediction ───────────────

@router.get("/infrastructure-status")
def get_infrastructure_status(
    rainfall_rate_mm_hr: float = 25.0,
    upstream_water_depth_m: float = 2.2,
    soil_moisture_pct: float = 55.0,
):
    """
    Computes rigorous physical condition, risk level, structural freeboard,
    scour velocity, and evacuation recommendations for:
      - 6 Habitations (Bhuntar, Larji, Aut, Thalot, Pandoh, Mandi Town)
      - 4 Critical Bridges (Bhuntar Beas Bridge, Larji Dam Bridge, Aut Tunnel Bridge, Pandoh Crossing)
    """
    import math

    # Physical parameters
    pore_pressure_kpa = (soil_moisture_pct / 100.0) * 55.0 + (rainfall_rate_mm_hr * 0.25)
    wave_speed = math.sqrt(max(9.81 * upstream_water_depth_m, 1.0))
    discharge_m3_s = compute_manning_discharge(upstream_water_depth_m)

    # 1. 6 Habitations Prediction (Ordered from Upstream to Downstream along Beas River)
    habitations_meta = [
        {
            "id": "HAB-BHUNTAR",
            "name": "Bhuntar",
            "district": "Kullu",
            "population": 8500,
            "elevation_m": 1096,
            "slope_deg": 19.5,
            "distance_km": 11.5,
            "channel_bank_height_m": 4.8,
            "nearest_shelter": "Bhuntar Airport Staging Area (1110m Elev)",
            "shelter_id": "SHL-BHUNTAR-AIRPORT",
            "vulnerable_ratio": 0.24,
            "kutcha_ratio": 0.20,
        },
        {
            "id": "HAB-LARJI",
            "name": "Larji",
            "district": "Mandi",
            "population": 1800,
            "elevation_m": 900,
            "slope_deg": 36.0,
            "distance_km": 23.5,
            "channel_bank_height_m": 3.2,
            "nearest_shelter": "Aut Government High School (920m Elev)",
            "shelter_id": "SHL-AUT-SCHOOL",
            "vulnerable_ratio": 0.30,
            "kutcha_ratio": 0.45,
        },
        {
            "id": "HAB-AUT",
            "name": "Aut",
            "district": "Mandi",
            "population": 2800,
            "elevation_m": 850,
            "slope_deg": 32.5,
            "distance_km": 27.0,
            "channel_bank_height_m": 4.2,
            "nearest_shelter": "Aut Government High School (920m Elev)",
            "shelter_id": "SHL-AUT-SCHOOL",
            "vulnerable_ratio": 0.28,
            "kutcha_ratio": 0.35,
        },
        {
            "id": "HAB-THALOT",
            "name": "Thalot",
            "district": "Mandi",
            "population": 1200,
            "elevation_m": 750,
            "slope_deg": 38.5,
            "distance_km": 36.0,
            "channel_bank_height_m": 3.0,
            "nearest_shelter": "Pandoh Community Center (830m Elev)",
            "shelter_id": "SHL-PANDOH-HALL",
            "vulnerable_ratio": 0.32,
            "kutcha_ratio": 0.55,
        },
        {
            "id": "HAB-PANDOH",
            "name": "Pandoh",
            "district": "Mandi",
            "population": 3500,
            "elevation_m": 780,
            "slope_deg": 28.0,
            "distance_km": 44.5,
            "channel_bank_height_m": 4.5,
            "nearest_shelter": "Pandoh Community Center (830m Elev)",
            "shelter_id": "SHL-PANDOH-HALL",
            "vulnerable_ratio": 0.22,
            "kutcha_ratio": 0.30,
        },
        {
            "id": "HAB-MANDI",
            "name": "Mandi Town",
            "district": "Mandi",
            "population": 26422,
            "elevation_m": 710,
            "slope_deg": 22.0,
            "distance_km": 62.0,
            "channel_bank_height_m": 5.5,
            "nearest_shelter": "Mandi District Relief Hub (760m Elev)",
            "shelter_id": "SHL-MANDI-RELIEF",
            "vulnerable_ratio": 0.20,
            "kutcha_ratio": 0.15,
        },
    ]

    villages_results = []
    for h in habitations_meta:
        # 1. Slope stability for this village
        slope_res = compute_factor_of_safety(
            slope_angle_deg=h["slope_deg"],
            soil_moisture_pct=soil_moisture_pct,
            rainfall_rate_mm_hr=rainfall_rate_mm_hr,
            cumulative_rain_24h_mm=rainfall_rate_mm_hr * 1.5,
            soil_type="colluvial_clay",
        )

        # 2. Inundation calculation
        overtop_margin_m = h["channel_bank_height_m"] - upstream_water_depth_m
        if overtop_margin_m <= 0:
            inundation_risk_pct = min(100.0, 85.0 + abs(overtop_margin_m) * 10.0)
        elif overtop_margin_m < 1.2:
            inundation_risk_pct = 50.0 + (1.2 - overtop_margin_m) * 30.0
        else:
            inundation_risk_pct = max(5.0, 40.0 - overtop_margin_m * 10.0)

        # 3. Lead time calculation
        dist_m = h["distance_km"] * 1000.0
        travel_mins = (dist_m / wave_speed) / 60.0
        lead_mins = max(travel_mins - 3.0, 0.0)

        # 4. Determine overall village status
        fs = slope_res.factor_of_safety
        if fs < 1.0 or inundation_risk_pct > 80.0:
            status = "EVACUATE_NOW"
            status_color = "#ef4444"
            status_label = "🚨 EVACUATE NOW"
            advisory = f"High probability of inundation/landslide. Evacuate {h['population']} residents to {h['nearest_shelter']}."
        elif fs < 1.3 or inundation_risk_pct > 55.0:
            status = "HIGH_ALERT"
            status_color = "#f97316"
            status_label = "⚠️ HIGH ALERT"
            advisory = f"Severe threat developing. Stage evacuation teams and alert vulnerable households ({int(h['population'] * h['vulnerable_ratio'])} elderly/children)."
        elif fs < 1.5 or inundation_risk_pct > 35.0:
            status = "MONITORING"
            status_color = "#eab308"
            status_label = "🟡 MONITORING"
            advisory = "River stage rising. Continuous IoT water level monitoring active."
        else:
            status = "SAFE"
            status_color = "#34d399"
            status_label = "✅ SAFE / NORMAL"
            advisory = "Slope and water levels within normal safety envelope."

        villages_results.append({
            "id": h["id"],
            "name": h["name"],
            "district": h["district"],
            "population": h["population"],
            "vulnerable_count": int(h["population"] * h["vulnerable_ratio"]),
            "kutcha_houses_count": int(h["population"] * h["kutcha_ratio"]),
            "elevation_m": h["elevation_m"],
            "slope_angle_deg": h["slope_deg"],
            "factor_of_safety": round(fs, 2),
            "inundation_risk_pct": round(inundation_risk_pct, 1),
            "freeboard_margin_m": round(overtop_margin_m, 2),
            "lead_time_mins": round(lead_mins, 1),
            "distance_km": h["distance_km"],
            "status": status,
            "status_label": status_label,
            "status_color": status_color,
            "nearest_shelter": h["nearest_shelter"],
            "advisory": advisory,
        })

    # 2. 4 Critical Bridges Prediction
    bridges_meta = [
        {
            "id": "BR-BHUNTAR-01",
            "name": "Bhuntar Beas Bridge",
            "highway": "NH-21",
            "deck_elevation_m": 1100.0,
            "river_bed_m": 1093.0,
            "clearance_height_m": 7.0,
            "span_m": 65,
            "distance_km": 11.5,
            "choke_point_importance": "HIGH (Kullu Valley Lifeline)",
        },
        {
            "id": "BR-LARJI-02",
            "name": "Larji Dam Access Bridge",
            "highway": "NH-21",
            "deck_elevation_m": 905.0,
            "river_bed_m": 898.5,
            "clearance_height_m": 6.5,
            "span_m": 45,
            "distance_km": 23.5,
            "choke_point_importance": "CRITICAL (Hydro Intake Access)",
        },
        {
            "id": "BR-AUT-03",
            "name": "Aut Tunnel Approach Bridge",
            "highway": "NH-21",
            "deck_elevation_m": 855.0,
            "river_bed_m": 849.5,
            "clearance_height_m": 5.5,
            "span_m": 40,
            "distance_km": 27.0,
            "choke_point_importance": "VITAL CHOKE POINT (Aut Gorge Bottleneck)",
        },
        {
            "id": "BR-PANDOH-04",
            "name": "Pandoh Lake Crossing",
            "highway": "NH-21",
            "deck_elevation_m": 785.0,
            "river_bed_m": 778.0,
            "clearance_height_m": 7.0,
            "span_m": 70,
            "distance_km": 44.5,
            "choke_point_importance": "STRATEGIC (Mandi-Kullu Highway)",
        },
    ]

    bridges_results = []
    for b in bridges_meta:
        water_level_above_bed = upstream_water_depth_m
        freeboard_m = b["clearance_height_m"] - water_level_above_bed
        scour_velocity_m_s = round(wave_speed * 1.15, 2)
        pier_hydro_thrust_kn = round(0.5 * 1000 * (scour_velocity_m_s ** 2) * 2.5 * upstream_water_depth_m / 1000.0, 1)

        if freeboard_m <= 0.3:
            bridge_status = "SUBMERGED_CLOSED"
            bridge_color = "#ef4444"
            bridge_label = "⛔ DECK SUBMERGED - CLOSED"
            traffic_action = "HALT ALL TRAFFIC IMMEDIATELY. BRO 70 RCC Deployment Initiated."
            submergence_risk_pct = 98.0
        elif freeboard_m <= 1.2:
            bridge_status = "CRITICAL_SCOUR_WARNING"
            bridge_color = "#f97316"
            bridge_label = "⚠️ CRITICAL SCOUR RISK"
            traffic_action = "HEAVY VEHICLES RESTRICTED. Pre-position JCBs at approaches."
            submergence_risk_pct = 72.0
        elif freeboard_m <= 2.5:
            bridge_status = "CAUTION_MONITORING"
            bridge_color = "#eab308"
            bridge_label = "🟡 HIGH DISCHARGE CAUTION"
            traffic_action = "Monitor pier scour sensors. Speed restricted to 20 km/h."
            submergence_risk_pct = 35.0
        else:
            bridge_status = "OPERATIONAL_OPEN"
            bridge_color = "#34d399"
            bridge_label = "✅ OPEN TO ALL TRAFFIC"
            traffic_action = "Normal highway traffic operating without restrictions."
            submergence_risk_pct = 5.0

        bridges_results.append({
            "id": b["id"],
            "name": b["name"],
            "highway": b["highway"],
            "span_m": b["span_m"],
            "deck_elevation_m": b["deck_elevation_m"],
            "freeboard_clearance_m": round(freeboard_m, 2),
            "scour_velocity_m_s": scour_velocity_m_s,
            "pier_hydrodynamic_thrust_kn": pier_hydro_thrust_kn,
            "submergence_risk_pct": submergence_risk_pct,
            "status": bridge_status,
            "status_label": bridge_label,
            "status_color": bridge_color,
            "traffic_action": traffic_action,
            "choke_point_importance": b["choke_point_importance"],
        })

    return {
        "timestamp": "Live",
        "inputs": {
            "rainfall_rate_mm_hr": rainfall_rate_mm_hr,
            "upstream_water_depth_m": upstream_water_depth_m,
            "soil_moisture_pct": soil_moisture_pct,
            "discharge_m3_s": discharge_m3_s,
            "surge_wave_speed_m_s": round(wave_speed, 2),
        },
        "habitations": villages_results,
        "bridges": bridges_results,
    }

