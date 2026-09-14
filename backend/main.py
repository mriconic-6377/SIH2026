"""
GeoResilience AI — FastAPI Application Entry Point

Starts the multi-hazard disaster early warning backend server with:
  - REST API routes (Telemetry, Prediction, GIS Layers)
  - WebSocket live telemetry stream
  - Background virtual sensor fleet simulator
  - Automatic database initialization & seed data loading
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.services.seed_data import seed_beas_valley_data
from app.services.simulator import simulator
from app.api.v1.telemetry import router as telemetry_router, ws_manager
from app.api.v1.predict import router as predict_router
from app.api.v1.gis import router as gis_router
from app.api.v1.logistics import router as logistics_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.satellite import router as satellite_router
from app.api.v1.weather import router as weather_router
from app.api.v1.scenario import router as scenario_router
from app.api.v1.mobile_siren import router as mobile_siren_router


# ─────────────── Background Simulator Task ───────────────

async def run_simulator_loop():
    """Background async loop that generates sensor telemetry every N seconds."""
    print(f"[SIMULATOR] Virtual sensor fleet started (interval: {settings.simulator_interval_seconds}s)")
    while True:
        try:
            readings = simulator.generate_tick()
            simulator.save_tick_to_db(readings)

            # Broadcast to all connected WebSocket clients
            for reading in readings:
                await ws_manager.broadcast(reading)

        except Exception as e:
            print(f"[SIMULATOR] Error in tick: {e}")

        await asyncio.sleep(settings.simulator_interval_seconds)


# ─────────────── Application Lifespan ───────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB, seed data, start simulator. Shutdown: cleanup."""
    # Startup
    print(f"\n{'='*60}")
    print(f"  [GeoResilience AI] {settings.app_name} v{settings.app_version}")
    print(f"  [Platform] Multi-Hazard Disaster Early Warning")
    db_display = settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url
    print(f"  [Database] {db_display}")
    print(f"{'='*60}\n")

    init_db()
    seed_beas_valley_data()

    # Start background simulator
    simulator_task = asyncio.create_task(run_simulator_loop())

    yield

    # Shutdown
    simulator_task.cancel()
    print("[APP] Shutting down GeoResilience AI.")


# ─────────────── FastAPI Application ───────────────

app = FastAPI(
    title=settings.app_name,
    description=(
        "Multi-Hazard Disaster Early Warning & Evacuation Intelligence Platform. "
        "Combines Mohr-Coulomb geotechnical physics, shallow-water wave routing, "
        "and SHAP-style explainability for flash flood & landslide prediction in "
        "the Beas River Valley (Mandi-Kullu, Himachal Pradesh)."
    ),
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────── Register API Routers ───────────────

app.include_router(telemetry_router)
app.include_router(predict_router)
app.include_router(gis_router)
app.include_router(logistics_router)
app.include_router(alerts_router)
app.include_router(satellite_router)
app.include_router(weather_router)
app.include_router(scenario_router)
app.include_router(mobile_siren_router, prefix="/api/v1/alerts/mobile-siren", tags=["Mobile Citizen Siren"])


# ─────────────── WebSocket Endpoint ───────────────

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """Real-time WebSocket feed for live sensor telemetry streaming."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; data is pushed from simulator loop
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# ─────────────── Simulator Control Endpoints ───────────────

@app.post("/api/v1/simulate/spike", tags=["Simulator Control"])
def trigger_cloudburst(intensity: float = 0.8):
    """
    Trigger a simulated cloudburst event for demo purposes.
    Intensity: 0.0 (mild rain) to 1.0 (catastrophic 150mm/hr cloudburst).
    """
    simulator.trigger_cloudburst_spike(intensity=intensity)
    return {
        "status": "SPIKE_TRIGGERED",
        "intensity": intensity,
        "message": f"[ALERT] Cloudburst spike triggered at intensity {intensity:.1f}. "
                   f"Watch the dashboard for real-time surge propagation.",
    }


# ─────────────── Health Check ───────────────

@app.get("/", tags=["Health"])
def health_check():
    """Root health check endpoint."""
    return {
        "status": "OPERATIONAL",
        "app": settings.app_name,
        "version": settings.app_version,
        "message": "GeoResilience AI — Multi-Hazard Disaster Early Warning Platform is running.",
    }


# ─────────────── Run with Uvicorn ───────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
