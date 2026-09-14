"""
GeoResilience AI — Mohr-Coulomb Geotechnical Slope Stability Engine

Computes the real-time Factor of Safety (F_s) for infinite slope stability
using the Mohr-Coulomb failure criterion coupled with 1D Green-Ampt infiltration.

When F_s < 1.0 → slope failure is imminent.
When F_s is between 1.0 and 1.3 → slope is marginally stable (WARNING).
When F_s > 1.3 → slope is stable.

References:
  - Mohr-Coulomb Criterion: Terzaghi, K. (1943). Theoretical Soil Mechanics.
  - Green-Ampt Infiltration: Green, W. H. & Ampt, G. A. (1911).
"""

import math
from dataclasses import dataclass
from typing import Literal


# ─────────────────────── Default Himalayan Soil Parameters ───────────────────────

# Published geotechnical values for typical Himalayan colluvial/residual clay-silt soils
HIMALAYAN_SOIL_DEFAULTS = {
    "colluvial_clay": {
        "cohesion_kpa": 12.0,           # c' (effective cohesion)
        "friction_angle_deg": 28.0,      # phi' (effective friction angle)
        "unit_weight_kn_m3": 18.5,       # gamma (bulk unit weight)
        "unit_weight_water_kn_m3": 9.81, # gamma_w
        "soil_depth_m": 3.0,             # z (depth to slip plane)
        "porosity": 0.42,
        "saturated_conductivity_m_hr": 0.005,
    },
    "weathered_schist": {
        "cohesion_kpa": 18.0,
        "friction_angle_deg": 32.0,
        "unit_weight_kn_m3": 20.0,
        "unit_weight_water_kn_m3": 9.81,
        "soil_depth_m": 2.5,
        "porosity": 0.35,
        "saturated_conductivity_m_hr": 0.01,
    },
    "loose_debris": {
        "cohesion_kpa": 5.0,
        "friction_angle_deg": 24.0,
        "unit_weight_kn_m3": 16.0,
        "unit_weight_water_kn_m3": 9.81,
        "soil_depth_m": 4.0,
        "porosity": 0.50,
        "saturated_conductivity_m_hr": 0.02,
    },
}


@dataclass
class SlopeStabilityResult:
    """Result of a Mohr-Coulomb slope stability analysis."""
    factor_of_safety: float
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    slope_angle_deg: float
    water_table_ratio: float  # h_w / z (0=dry, 1=fully saturated)
    soil_type: str
    interpretation: str


def compute_factor_of_safety(
    slope_angle_deg: float,
    soil_moisture_pct: float,
    rainfall_rate_mm_hr: float = 0.0,
    cumulative_rain_24h_mm: float = 0.0,
    soil_type: str = "colluvial_clay",
) -> SlopeStabilityResult:
    """
    Compute the Mohr-Coulomb infinite slope Factor of Safety (F_s).

    The water table height ratio (h_w/z) is estimated from soil moisture percentage
    and antecedent rainfall using a simplified 1D infiltration proxy.

    Formula:
        F_s = [c' + (gamma*z - gamma_w*h_w) * cos²(beta) * tan(phi')]
              / [gamma * z * sin(beta) * cos(beta)]

    Args:
        slope_angle_deg: Slope gradient in degrees (0-90).
        soil_moisture_pct: Current volumetric soil moisture (0-100%).
        rainfall_rate_mm_hr: Current rainfall intensity (mm/hr).
        cumulative_rain_24h_mm: Total rainfall in last 24 hours (mm).
        soil_type: Key from HIMALAYAN_SOIL_DEFAULTS.

    Returns:
        SlopeStabilityResult with F_s, risk classification, and interpretation.
    """
    params = HIMALAYAN_SOIL_DEFAULTS.get(soil_type, HIMALAYAN_SOIL_DEFAULTS["colluvial_clay"])

    c_prime = params["cohesion_kpa"]
    phi_deg = params["friction_angle_deg"]
    gamma = params["unit_weight_kn_m3"]
    gamma_w = params["unit_weight_water_kn_m3"]
    z = params["soil_depth_m"]
    porosity = params["porosity"]
    k_sat = params["saturated_conductivity_m_hr"]

    beta = math.radians(slope_angle_deg)
    phi = math.radians(phi_deg)

    # ── Estimate water table ratio (h_w / z) from soil moisture & rainfall ──
    # Base saturation from soil moisture sensor
    saturation_from_moisture = min(soil_moisture_pct / 100.0, 1.0)

    # Additional saturation contribution from rainfall infiltration
    # Simplified Green-Ampt proxy: fraction of soil depth saturated by rain
    if rainfall_rate_mm_hr > 0:
        infiltration_depth_m = min(
            (rainfall_rate_mm_hr / 1000.0) / (porosity * k_sat) * 0.1,
            1.0
        )
    else:
        infiltration_depth_m = 0.0

    # Antecedent moisture contribution (prior 24h rainfall)
    antecedent_factor = min(cumulative_rain_24h_mm / 200.0, 0.3)

    # Combined water table ratio (capped at 1.0 = fully saturated)
    hw_ratio = min(saturation_from_moisture * 0.6 + infiltration_depth_m * 0.25 + antecedent_factor, 1.0)
    h_w = hw_ratio * z

    # ── Mohr-Coulomb Factor of Safety ──
    cos_beta = math.cos(beta)
    sin_beta = math.sin(beta)
    tan_phi = math.tan(phi)

    # Prevent division by zero for flat slopes
    denominator = gamma * z * sin_beta * cos_beta
    if denominator < 1e-6:
        fs = 99.0  # Flat terrain → infinitely stable
    else:
        effective_normal_stress = (gamma * z - gamma_w * h_w) * cos_beta * cos_beta
        numerator = c_prime + effective_normal_stress * tan_phi
        fs = numerator / denominator

    # ── Risk Classification ──
    if fs < 1.0:
        risk_level = "CRITICAL"
        interpretation = (
            f"SLOPE FAILURE IMMINENT (F_s={fs:.2f}). "
            f"Pore-water pressure has exceeded soil shear strength. "
            f"Immediate evacuation required."
        )
    elif fs < 1.3:
        risk_level = "HIGH"
        interpretation = (
            f"Slope is marginally stable (F_s={fs:.2f}). "
            f"Any additional rainfall may trigger failure. High alert."
        )
    elif fs < 1.8:
        risk_level = "MODERATE"
        interpretation = (
            f"Slope is conditionally stable (F_s={fs:.2f}). "
            f"Monitor closely if rainfall continues."
        )
    else:
        risk_level = "LOW"
        interpretation = f"Slope is stable (F_s={fs:.2f}). Normal monitoring."

    return SlopeStabilityResult(
        factor_of_safety=round(fs, 3),
        risk_level=risk_level,
        slope_angle_deg=slope_angle_deg,
        water_table_ratio=round(hw_ratio, 3),
        soil_type=soil_type,
        interpretation=interpretation,
    )
