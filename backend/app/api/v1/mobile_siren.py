import time
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.v1.telemetry import ws_manager

router = APIRouter()

# ─── In-Memory Emergency Siren State ───
active_siren_state: Dict[str, Any] = {
    "is_active": False,
    "dispatched_at": None,
    "alert_id": None,
    "target_village": "ALL_VALLEY",
    "severity": "CRITICAL_EVACUATION",
    "title": "🚨 FLASH FLOOD EMERGENCY — EVACUATE NOW",
    "message": "Beas river surge wave crossing high danger mark. Evacuate immediately to designated high-elevation shelter.",
    "nearest_shelter": "Bhuntar Airport Staging Ground (1110m Elev)",
    "lead_time_mins": 18,
    "acknowledged_count": 0,
    "acknowledged_citizens": [],
}


class BroadcastSirenRequest(BaseModel):
    target_village: str = "ALL_VALLEY"
    severity: str = "CRITICAL_EVACUATION"
    title: str = "🚨 FLASH FLOOD EMERGENCY — EVACUATE NOW"
    message: str = "Beas river surge wave crossing high danger mark. Evacuate immediately to designated high-elevation shelter."
    nearest_shelter: str = "Designated Elevated Disaster Shelter"
    lead_time_mins: int = 15


class AcknowledgeRequest(BaseModel):
    citizen_id: Optional[str] = None
    village: Optional[str] = None


@router.get("/status")
def get_siren_status():
    """Returns the current live emergency siren state and citizen acknowledgement head-count."""
    return active_siren_state


@router.post("/broadcast")
async def broadcast_mobile_siren(req: BroadcastSirenRequest):
    """
    Dispatches a high-priority zero-touch emergency siren broadcast to all connected citizen devices via WebSocket.
    """
    global active_siren_state
    active_siren_state["is_active"] = True
    active_siren_state["dispatched_at"] = time.time()
    active_siren_state["alert_id"] = f"EMERG-SIREN-{int(time.time())}"
    active_siren_state["target_village"] = req.target_village
    active_siren_state["severity"] = req.severity
    active_siren_state["title"] = req.title
    active_siren_state["message"] = req.message
    active_siren_state["nearest_shelter"] = req.nearest_shelter
    active_siren_state["lead_time_mins"] = req.lead_time_mins
    active_siren_state["acknowledged_count"] = 0
    active_siren_state["acknowledged_citizens"] = []

    # Instant sub-millisecond WebSocket broadcast to all citizen phones & command consoles
    try:
        await ws_manager.broadcast({
            "event_type": "MOBILE_SIREN_TRIGGER",
            "siren_payload": active_siren_state,
        })
    except Exception as e:
        print(f"[SIREN] WS broadcast notice: {e}")

    return {
        "status": "DISPATCHED",
        "message": f"High-priority emergency siren broadcasted for {req.target_village}.",
        "alert_id": active_siren_state["alert_id"],
        "payload": active_siren_state,
    }


@router.post("/ack")
async def acknowledge_evacuation(req: AcknowledgeRequest):
    """
    Registers a citizen acknowledgement ("I AM EVACUATING") from their mobile device.
    """
    global active_siren_state
    if not active_siren_state["is_active"]:
        return {"status": "INACTIVE", "message": "No active emergency."}

    citizen_id = req.citizen_id or f"CITIZEN-{int(time.time() * 1000) % 100000}"
    if citizen_id not in active_siren_state["acknowledged_citizens"]:
        active_siren_state["acknowledged_citizens"].append(citizen_id)
        active_siren_state["acknowledged_count"] = len(active_siren_state["acknowledged_citizens"])

    # Broadcast updated ACK count to all Command Centers
    try:
        await ws_manager.broadcast({
            "event_type": "MOBILE_SIREN_ACK_UPDATE",
            "acknowledged_count": active_siren_state["acknowledged_count"],
        })
    except Exception as e:
        pass

    return {
        "status": "ACKNOWLEDGED",
        "acknowledged_count": active_siren_state["acknowledged_count"],
        "nearest_shelter": active_siren_state["nearest_shelter"],
    }


@router.post("/cancel")
async def cancel_mobile_siren():
    """
    Stands down the emergency siren and silences all citizen devices.
    """
    global active_siren_state
    active_siren_state["is_active"] = False

    try:
        await ws_manager.broadcast({
            "event_type": "MOBILE_SIREN_CANCEL",
            "siren_payload": active_siren_state,
        })
    except Exception as e:
        pass

    return {
        "status": "CANCELLED",
        "message": "Emergency siren stood down. All citizen devices returned to standby monitoring.",
    }
