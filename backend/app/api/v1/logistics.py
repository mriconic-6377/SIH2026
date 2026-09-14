"""
GeoResilience AI — BRO Logistics & Lifeline Resilience API

Endpoints:
  GET  /api/v1/logistics/bro-plan  — Evaluates highway graph and returns JCB staging orders + bypass routes
"""

from fastapi import APIRouter, Query
from dataclasses import asdict
from app.services.bro_logistics import evaluate_bro_logistics

router = APIRouter(prefix="/api/v1/logistics", tags=["BRO Logistics & Lifelines"])


@router.get("/bro-plan")
def get_bro_logistics_plan(
    threat_level: str = Query("LOW", description="Overall disaster threat level: LOW, MODERATE, HIGH, CRITICAL"),
    rainfall_rate_mm_hr: float = Query(20.0, ge=0, description="Current or simulated rainfall intensity"),
    upstream_water_depth_m: float = Query(2.0, ge=0, description="Current or simulated river stage depth"),
):
    """
    Evaluates Himalayan highway network (NH-21 / NH-154) resilience and returns:
      - Active Choke Points (e.g. Aut Tunnel, Larji Pass)
      - Heavy Machinery Pre-Positioning Orders (JCB / Excavators from nearest depots)
      - Emergency Convoy Bypass Reroute Plans
      - Road Network Vulnerability Index
    """
    report = evaluate_bro_logistics(
        flood_threat_level=threat_level,
        rainfall_rate_mm_hr=rainfall_rate_mm_hr,
        upstream_water_depth_m=upstream_water_depth_m,
    )
    return asdict(report)
