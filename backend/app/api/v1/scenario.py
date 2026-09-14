"""
GeoResilience AI — Manual Scenario Bridge API

Acts as shared memory between:
  - Web App 2 (Manual Control Panel, Port 5174): WRITES scenario params
  - Web App 1 (Main Dashboard, Port 5173): READS scenario params when connected

Endpoints:
  GET    /api/v1/scenario/manual  — App 1 polls this to get latest manual scenario
  POST   /api/v1/scenario/manual  — App 2 pushes manual params here
  DELETE /api/v1/scenario/manual  — App 1 calls this to disconnect / reset
  GET    /api/v1/scenario/status  — Returns current connection status
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/api/v1/scenario", tags=["Scenario Bridge"])


# ─── In-Memory Scenario Store (single shared state) ───
_manual_scenario: Optional[dict] = None
_is_manual_active: bool = False
_last_pushed_at: Optional[str] = None
_last_connected_at: Optional[str] = None


# ─── Request Schema ───

class ManualScenarioRequest(BaseModel):
    rainfall_rate_mm_hr: float = Field(..., ge=0.0, le=160.0,
                                       description="Rainfall intensity in mm/hr (0-160)")
    soil_moisture_pct: float = Field(..., ge=0.0, le=100.0,
                                     description="Soil saturation percentage (0-100)")
    slope_angle_deg: float = Field(..., ge=0.0, le=60.0,
                                   description="Slope angle in degrees (0-60)")
    upstream_depth_m: float = Field(..., ge=0.0, le=8.5,
                                    description="Upstream river stage depth in meters (0-8.5)")
    scenario_name: str = Field("Custom Scenario", description="Human-readable scenario label")
    pushed_by: str = Field("Manual Control Panel", description="Source identifier")


# ─── Endpoints ───

@router.post("/manual")
def push_manual_scenario(req: ManualScenarioRequest):
    """
    Web App 2 calls this to push manual scenario parameters.
    Immediately available for Web App 1 to read.
    """
    global _manual_scenario, _is_manual_active, _last_pushed_at

    _last_pushed_at = datetime.now(timezone.utc).isoformat()
    _is_manual_active = True
    _manual_scenario = {
        "rainfall_rate_mm_hr": req.rainfall_rate_mm_hr,
        "soil_moisture_pct": req.soil_moisture_pct,
        "slope_angle_deg": req.slope_angle_deg,
        "upstream_depth_m": req.upstream_depth_m,
        "scenario_name": req.scenario_name,
        "pushed_by": req.pushed_by,
        "pushed_at": _last_pushed_at,
    }

    return {
        "status": "ok",
        "message": f"Scenario '{req.scenario_name}' pushed. Main Dashboard will pick it up on next poll.",
        "scenario": _manual_scenario,
    }


@router.get("/manual")
def get_manual_scenario():
    """
    Web App 1 polls this every 5 seconds.
    Returns current manual scenario if active, else 404.
    """
    global _last_connected_at

    if not _is_manual_active or _manual_scenario is None:
        return JSONResponse(status_code=404, content={
            "status": "no_active_scenario",
            "message": "No manual scenario is currently active. Dashboard uses live data.",
        })

    _last_connected_at = datetime.now(timezone.utc).isoformat()
    return {
        "status": "active",
        "scenario": _manual_scenario,
    }


@router.delete("/manual")
def reset_manual_scenario():
    """
    Web App 1 calls this when user clicks 'Back to Live Data'.
    Clears the manual scenario and returns to real-time mode.
    """
    global _manual_scenario, _is_manual_active, _last_pushed_at, _last_connected_at

    _manual_scenario = None
    _is_manual_active = False
    _last_pushed_at = None
    _last_connected_at = None

    return {
        "status": "ok",
        "message": "Manual scenario cleared. Main Dashboard reverted to live real-time data.",
    }


@router.get("/status")
def get_scenario_status():
    """
    Both apps can query this to display connection state.
    """
    return {
        "is_manual_active": _is_manual_active,
        "last_pushed_at": _last_pushed_at,
        "last_connected_at": _last_connected_at,
        "scenario_name": _manual_scenario.get("scenario_name") if _manual_scenario else None,
        "scenario_params": _manual_scenario if _manual_scenario else {},
    }
