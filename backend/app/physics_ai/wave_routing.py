"""
GeoResilience AI — Flash Flood Wave Routing & Dynamic Lead-Time Engine

Computes the evacuation lead-time (T_lead) for downstream habitations
based on upstream water surge velocity using shallow-water wave celerity.

Formula:
    Wave Speed:  v = sqrt(g * y)   (shallow water wave celerity)
    Lead Time:   T_lead = Distance / v  -  processing_delay

Where:
    g = 9.81 m/s²
    y = current upstream water depth (meters)
    Distance = river-channel distance from upstream surge point to habitation

Also computes a simplified discharge estimate using Manning's equation:
    Q = (1/n) * A * R^(2/3) * S^(1/2)
"""

import math
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class LeadTimeResult:
    """Evacuation lead-time prediction for a single habitation."""
    habitation_name: str
    distance_km: float
    upstream_water_depth_m: float
    wave_speed_m_per_s: float
    raw_travel_time_mins: float
    processing_delay_mins: float
    net_lead_time_mins: float
    urgency: str  # ADEQUATE, TIGHT, INSUFFICIENT


@dataclass
class BasinLeadTimeReport:
    """Complete lead-time report for all habitations in a river basin."""
    basin_id: str
    upstream_sensor_id: str
    current_water_depth_m: float
    surge_wave_speed_m_s: float
    habitation_results: List[LeadTimeResult]
    overall_urgency: str


# ─────────────────── River Network Topology (Beas Valley Pilot) ───────────────────

# River-channel distances from upstream sensor point to each habitation (km)
# These are approximate distances along the Beas River channel for Mandi-Kullu stretch
BEAS_VALLEY_DISTANCES = {
    "AUT": {"distance_km": 3.2, "bank_elevation_m": 820.0},
    "PANDOH": {"distance_km": 8.5, "bank_elevation_m": 780.0},
    "THALOT": {"distance_km": 14.0, "bank_elevation_m": 750.0},
    "MANDI_TOWN": {"distance_km": 22.0, "bank_elevation_m": 710.0},
    "LARJI": {"distance_km": 6.5, "bank_elevation_m": 800.0},
    "BHUNTAR": {"distance_km": 12.0, "bank_elevation_m": 770.0},
}


def compute_wave_speed(water_depth_m: float) -> float:
    """
    Compute shallow-water wave celerity (speed).
    v = sqrt(g * y) where g = 9.81 m/s² and y = water depth.
    """
    if water_depth_m <= 0:
        return 0.0
    return math.sqrt(9.81 * water_depth_m)


def compute_lead_time(
    upstream_water_depth_m: float,
    distance_km: float,
    processing_delay_mins: float = 2.0,
) -> float:
    """
    Compute net evacuation lead-time in minutes.

    Args:
        upstream_water_depth_m: Current water depth at upstream gauge (m).
        distance_km: River-channel distance to downstream habitation (km).
        processing_delay_mins: System processing and alert dispatch latency (mins).

    Returns:
        Net lead time in minutes. Negative means insufficient warning.
    """
    v = compute_wave_speed(upstream_water_depth_m)
    if v < 0.01:
        return 999.0  # No surge, effectively infinite lead time

    distance_m = distance_km * 1000.0
    travel_time_seconds = distance_m / v
    travel_time_mins = travel_time_seconds / 60.0

    return travel_time_mins - processing_delay_mins


def compute_basin_lead_times(
    basin_id: str,
    upstream_sensor_id: str,
    upstream_water_depth_m: float,
    processing_delay_mins: float = 2.0,
    habitation_distances: Optional[dict] = None,
) -> BasinLeadTimeReport:
    """
    Compute lead-time estimates for ALL habitations in a river basin.

    Args:
        basin_id: Identifier for the river basin.
        upstream_sensor_id: ID of the upstream sensor reporting the surge.
        upstream_water_depth_m: Current water depth reading (m).
        processing_delay_mins: System processing latency.
        habitation_distances: Override dict of {name: {distance_km, bank_elevation_m}}.

    Returns:
        BasinLeadTimeReport with per-habitation lead times and urgency levels.
    """
    distances = habitation_distances or BEAS_VALLEY_DISTANCES
    wave_speed = compute_wave_speed(upstream_water_depth_m)

    results: List[LeadTimeResult] = []
    worst_urgency = "ADEQUATE"

    for hab_name, hab_info in distances.items():
        dist_km = hab_info["distance_km"]
        net_lead = compute_lead_time(upstream_water_depth_m, dist_km, processing_delay_mins)

        if upstream_water_depth_m <= 0.1:
            raw_travel = 999.0
        else:
            raw_travel = (dist_km * 1000.0 / wave_speed) / 60.0

        # Classify urgency
        if net_lead < 10:
            urgency = "INSUFFICIENT"
            worst_urgency = "INSUFFICIENT"
        elif net_lead < 30:
            urgency = "TIGHT"
            if worst_urgency != "INSUFFICIENT":
                worst_urgency = "TIGHT"
        else:
            urgency = "ADEQUATE"

        results.append(LeadTimeResult(
            habitation_name=hab_name,
            distance_km=dist_km,
            upstream_water_depth_m=upstream_water_depth_m,
            wave_speed_m_per_s=round(wave_speed, 2),
            raw_travel_time_mins=round(raw_travel, 1),
            processing_delay_mins=processing_delay_mins,
            net_lead_time_mins=round(net_lead, 1),
            urgency=urgency,
        ))

    # Sort by shortest lead time (most urgent first)
    results.sort(key=lambda r: r.net_lead_time_mins)

    return BasinLeadTimeReport(
        basin_id=basin_id,
        upstream_sensor_id=upstream_sensor_id,
        current_water_depth_m=upstream_water_depth_m,
        surge_wave_speed_m_s=round(wave_speed, 2),
        habitation_results=results,
        overall_urgency=worst_urgency,
    )


def compute_manning_discharge(
    water_depth_m: float,
    channel_width_m: float = 30.0,
    slope: float = 0.005,
    roughness_n: float = 0.035,
) -> float:
    """
    Estimate river discharge Q using Manning's equation.
    Q = (1/n) * A * R^(2/3) * S^(1/2)

    Assumes a simplified rectangular cross-section.

    Args:
        water_depth_m: Flow depth in the channel (m).
        channel_width_m: Width of the river channel (m).
        slope: Channel bed slope (m/m).
        roughness_n: Manning's roughness coefficient.

    Returns:
        Discharge Q in m³/s.
    """
    if water_depth_m <= 0:
        return 0.0

    area = channel_width_m * water_depth_m
    wetted_perimeter = channel_width_m + 2 * water_depth_m
    hydraulic_radius = area / wetted_perimeter

    q = (1.0 / roughness_n) * area * (hydraulic_radius ** (2.0 / 3.0)) * math.sqrt(slope)
    return round(q, 2)
