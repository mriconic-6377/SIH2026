# 🛰️ GeoResilience AI — Smart India Hackathon 2026 (SIH-26192)

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://sih.gov.in/)
[![Theme: Disaster Management](https://img.shields.io/badge/Theme-Disaster%20Management-red.svg)](https://sih.gov.in/)
[![Team: RUNTIME TERROR](https://img.shields.io/badge/Team-RUNTIME%20TERROR-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TypeScript-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Physics-Informed Multi-Hazard Early Warning, Hydraulic Scour Defense & Autonomous Citizen Evacuation Network for Himalayan River Basins**  
> *Developed for Smart India Hackathon 2026 | Problem Statement ID: SIH-26192*

---

## 📌 Problem Statement

In mountainous terrains such as the **Beas River Valley (Himachal Pradesh)**, cloudbursts, landslide dam breach flash floods, and debris flows strike with minimal warning. Conventional warning systems suffer from **four fatal failure modes**:
1. **Cloud-Blind Optical Satellites**: Dense monsoon cloudburst storm clouds 100% block optical imagery (Landsat/MODIS).
2. **Cellular Infrastructure Washout**: Riverbank telecom towers collapse within the first 8 minutes of flooding.
3. **Statistical AI Hallucinations & False Alarms**: Unconstrained black-box ML models erode public trust with false alarms.
4. **Delayed Manual Siren Chains**: Multi-hop human dispatch takes 20–45 minutes, losing the critical 15-minute survival window.

---

## 🛡️ The GeoResilience AI Solution

GeoResilience AI replaces fragile infrastructure with a **4-pillar defense-in-depth architecture**:

```
                                 [ Space Radar: Sentinel-1 SAR + NASA GPM ]
                                                      │
                                                      ▼
[ 8x IoT Piezometer/Hydro Mesh ] ──▶ [ PINN Physics-AI Core (Mohr-Coulomb + St-Venant) ]
                                                      │
                                                      ▼
                                       [ FastAPI Telemetry Engine ]
                                                      │
                ┌─────────────────────────────────────┼─────────────────────────────────────┐
                ▼                                     ▼                                     ▼
   [ 3D GIS Command Console ]           [ Zero-Touch Citizen Siren PWA ]            [ NDMA CAP v1.2 XML ]
  (Live Leaflet + Cartosat DEM)       (Wake-on-Disaster + Hindi Directives)        (Sachet System Feeds)
```

1. **Space-to-Ground Radar Fusion**: Dual Sentinel-1 C-Band SAR (penetrates 100% cloud cover) fused with NASA GPM IMERG satellite precipitation and ISRO Cartosat-1 10m DEM.
2. **Physics-Informed AI (PINN) Core**: Governed by Mohr-Coulomb geotechnical slope stability and 1D Saint-Venant shallow water wave kinetics ($R^2 = 0.99$), eliminating unphysical false hallucinations.
3. **SHAP AI Explainability**: Quantifies exact geomorphic and meteorological feature contributions so District Collectors understand the root cause of every alert.
4. **Autonomous Citizen Siren PWA**: Wake-on-Disaster web app that triggers full-volume 120dB danger sirens, bypasses silent/DND modes, delivers vernacular Hindi audio directives, and collects instantaneous evacuation acknowledgments.
5. **Bridge Pier Scour Protection (FHWA HEC-18)**: Predicts hydrodynamic velocity spikes ($v > 5\text{ m/s}$) to trigger automated road closures on critical defense corridors (NH-21).
6. **AI Permanent Relocation Matrix (MCDA 0–100)**: Multi-Criteria Decision Analysis ranking habitations based on cumulative geohazard exposure for long-term safe rehabilitation.

---

## 🏗️ System Architecture & Tech Stack

### 🚀 Backend Engine (`/backend`)
- **FastAPI & Python 3.11+**: Asynchronous event-driven REST API and real-time WebSocket bus.
- **Physics Core**: Custom implementations of Green-Ampt infiltration, Mohr-Coulomb Factor of Safety ($F_s$), and 1D Saint-Venant wave routing.
- **SQLAlchemy & SQLite/PostGIS**: Time-series telemetry storage for 8 valley monitoring stations.
- **Telemetry Simulator**: Autonomous background loop streaming realistic sensor jitter and cloudburst spike scenarios.

### 💻 Operational Command Console (`/frontend`)
- **React 19, TypeScript, Vite**: Real-time high-density command console.
- **Leaflet & Cartosat DEM Profile**: Dynamic Red-Zone hazard mapping, 6 valley habitations, and 4 critical NH-21 bridges.
- **Lucide Icons & Modern Dark Aesthetic**: Engineered for 24/7 disaster management control rooms.

### 📱 Zero-Touch Citizen Siren PWA (`/#citizen-siren`)
- **Failsafe Audio Engine**: High-decibel looping danger siren audio (`/siren.mp3`) with Web Audio API dual-tone synthesized fallback (960Hz / 770Hz).
- **Wake-on-Disaster (WoD)**: Screen WakeLock API integration keeping phone screens active during emergencies.
- **Vernacular Audio**: Native Web Speech API synthesis delivering Hindi voice evacuation routes.
- **Real-Time ACK**: Instant sync back to command center upon citizen tapping *"I AM EVACUATING"*.

### 🕹️ Tactical Disaster Simulator (`/manual-control`)
- Standalone control panel on port `5174` enabling judges and operators to inject custom rainfall rates, upstream depths, and slope angles to test real-time system responses.

---

## 📂 Project Structure

```
SIH2026/
├── backend/                  # FastAPI backend and physics engines
│   ├── app/
│   │   ├── api/v1/           # Telemetry, GIS, Alerts, Mobile Siren endpoints
│   │   ├── core/             # Configuration and settings
│   │   ├── db/               # Database sessions and models
│   │   └── services/         # Physics PINN, Scour, Relocation, SHAP engines
│   ├── main.py               # Application entry point & simulator loop
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 19 operational command console & citizen PWA
│   ├── src/
│   │   ├── components/       # GIS Map, Gauge, Siren Modal, Citizen Siren App
│   │   ├── utils/            # Failsafe siren audio engine
│   │   └── App.tsx           # Multi-view router and state coordinator
│   └── package.json
├── manual-control/           # Tactical simulation console (Port 5174)
├── docs/                     # Pitch scripts, viva guides, and sensor blueprints
├── start_shareable_tunnel.ps1 # 1-click launcher for backend, frontend & Cloudflare
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/mriconic-6377/SIH2026.git
cd SIH2026
```

### 2. Run Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Accessible at `http://localhost:5173` (Command Console) and `http://localhost:5173/#citizen-siren` (Citizen Siren PWA).*

### 4. Run Tactical Simulator (Optional)
```bash
cd ../manual-control
npm install
npm run dev
```
*Accessible at `http://localhost:5174`.*

---

## 👥 Team RUNTIME TERROR (Team ID: 159)
* **Institution**: JECRC University, Jaipur
* **Theme**: Disaster Management
* **Hackathon**: Smart India Hackathon 2026
