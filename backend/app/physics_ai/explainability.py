"""
GeoResilience AI — SHAP-style Explainability Engine

Computes dynamic percentage contributions of each risk factor to the
overall hazard score. This provides transparent, jury-friendly attribution
similar to SHAP (SHapley Additive exPlanations) without requiring a
pre-trained ML model — works directly on physics-coupled sensor inputs.

When we integrate a trained XGBoost model later, this module can be
swapped to use actual `shap.TreeExplainer` on the model's output.
"""

import os
import joblib
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, Optional

# Load trained XGBoost model if available
_MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "flood_risk_xgboost.joblib")
_xgb_model = None
try:
    if os.path.exists(_MODEL_PATH):
        _xgb_model = joblib.load(_MODEL_PATH)
except Exception:
    _xgb_model = None


@dataclass
class ExplainabilityResult:
    """Feature attribution breakdown for a risk prediction."""
    overall_risk_score: float           # 0.0 to 1.0
    risk_level: str                     # LOW, MODERATE, HIGH, CRITICAL
    ml_probabilities: Dict[str, float]  # Probability distribution across 4 classes from XGBoost
    feature_contributions: Dict[str, float]  # Feature name → % contribution
    top_driver: str                     # Name of the dominant risk factor
    interpretation: str                 # Human-readable explanation


def compute_risk_attribution(
    rainfall_rate_mm_hr: float = 0.0,
    soil_moisture_pct: float = 50.0,
    slope_angle_deg: float = 15.0,
    upstream_water_depth_m: float = 1.0,
    cumulative_rain_24h_mm: float = 0.0,
    pore_pressure_kpa: float = 0.0,
) -> ExplainabilityResult:
    """
    Compute weighted risk attribution across all input features.

    Each feature is normalized to a 0-1 severity scale, then weighted
    to produce an overall risk score and percentage contributions.

    Args:
        rainfall_rate_mm_hr: Current rainfall intensity.
        soil_moisture_pct: Volumetric soil moisture (0-100%).
        slope_angle_deg: Terrain slope in degrees.
        upstream_water_depth_m: Upstream river gauge depth.
        cumulative_rain_24h_mm: Antecedent 24h cumulative rainfall.
        pore_pressure_kpa: Subsurface pore-water pressure.

    Returns:
        ExplainabilityResult with percentage contribution per factor.
    """
    # ── Normalize each feature to 0-1 severity ──
    rainfall_severity = min(rainfall_rate_mm_hr / 120.0, 1.0)
    moisture_severity = min(soil_moisture_pct / 100.0, 1.0)
    slope_severity = min(slope_angle_deg / 50.0, 1.0)
    water_depth_severity = min(upstream_water_depth_m / 8.0, 1.0)
    antecedent_severity = min(cumulative_rain_24h_mm / 250.0, 1.0)
    pore_severity = min(pore_pressure_kpa / 80.0, 1.0)

    # ── Feature weights (tuned for Himalayan flash flood / landslide context) ──
    weights = {
        "Rainfall Intensity": 0.25,
        "Soil Saturation": 0.20,
        "Slope Steepness": 0.15,
        "Upstream Water Surge": 0.18,
        "Antecedent Rainfall (24h)": 0.12,
        "Pore-Water Pressure": 0.10,
    }

    severities = {
        "Rainfall Intensity": rainfall_severity,
        "Soil Saturation": moisture_severity,
        "Slope Steepness": slope_severity,
        "Upstream Water Surge": water_depth_severity,
        "Antecedent Rainfall (24h)": antecedent_severity,
        "Pore-Water Pressure": pore_severity,
    }

    # ── Compute weighted risk score ──
    overall_score = sum(weights[k] * severities[k] for k in weights)
    overall_score = min(overall_score, 1.0)

    # ── Compute percentage contributions ──
    raw_contributions = {k: weights[k] * severities[k] for k in weights}
    total_raw = sum(raw_contributions.values())

    if total_raw > 0:
        pct_contributions = {
            k: round((v / total_raw) * 100.0, 1) for k, v in raw_contributions.items()
        }
    else:
        pct_contributions = {k: 0.0 for k in weights}

    # ── Risk classification ──
    if overall_score >= 0.75:
        risk_level = "CRITICAL"
    elif overall_score >= 0.50:
        risk_level = "HIGH"
    elif overall_score >= 0.25:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    # ── Top driver ──
    top_driver = max(pct_contributions, key=pct_contributions.get)

    # ── XGBoost Model Inference (if model artifact loaded) ──
    ml_probs = {"LOW": 0.25, "MODERATE": 0.25, "HIGH": 0.25, "CRITICAL": 0.25}
    if _xgb_model is not None:
        try:
            antecedent_72h = cumulative_rain_24h_mm * 1.5
            twi = 14.0 - (slope_angle_deg / 55.0) * 8.0
            velocity = np.sqrt(9.81 * max(upstream_water_depth_m, 0.1))

            feature_vector = np.array([[
                rainfall_rate_mm_hr,
                cumulative_rain_24h_mm,
                antecedent_72h,
                soil_moisture_pct,
                pore_pressure_kpa,
                slope_angle_deg,
                twi,
                upstream_water_depth_m,
                velocity,
            ]])

            probs = _xgb_model.predict_proba(feature_vector)[0]
            ml_probs = {
                "LOW": round(float(probs[0]), 3),
                "MODERATE": round(float(probs[1]), 3),
                "HIGH": round(float(probs[2]), 3),
                "CRITICAL": round(float(probs[3]), 3),
            }
        except Exception as e:
            pass

    return ExplainabilityResult(
        overall_risk_score=round(overall_score, 3),
        risk_level=risk_level,
        ml_probabilities=ml_probs,
        feature_contributions=pct_contributions,
        top_driver=top_driver,
        interpretation=interpretation,
    )
