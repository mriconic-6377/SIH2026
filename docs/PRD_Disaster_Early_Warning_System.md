# 📋 Product Requirements Document (PRD)
## 🛡️ GeoResilience AI: Flash Flood & Landslide Multi-Hazard Early Warning Platform

> **Project Code:** SIH 2026 | Disaster Management Track (NDRF / MDoNER / MHA)  
> **Version:** 1.0.0 (Foundation Draft)  
> **Document Owner:** Lead Product & Systems Engineering Team  
> **Architecture Model:** Cloud-First WebGIS Platform + Autonomous Offline LoRa Siren Fallback

---

## 1. Product Vision & Problem Definition

### 1.1 Problem Statement
In hilly terrains of India (Himalayas, North-East, and Western Ghats), sudden cloudbursts, flash floods, and landslides occur with extremely short lead times. Existing warning mechanisms suffer from three critical bottlenecks:
1. **Coarse Resolution & High False Alarms:** Weather warnings are issued at the district level without accounting for micro-catchment topography or soil mechanics.
2. **Post-Disaster Latency:** Current disaster relief is mostly reactive rather than proactive.
3. **Single Point of Failure (Telecommunication Blackouts):** Cellular towers and power grids collapse during heavy rain, preventing online warnings from reaching vulnerable communities.

### 1.2 Product Vision
**GeoResilience AI** is an end-to-end, intelligent decision-support and early warning system that:
* Ingests multi-source satellite radar (Sentinel-1 SAR), Doppler radar (IMD), and in-situ IoT telemetry.
* Employs **Physics-Coupled AI** (Mohr-Coulomb soil failure + Spatio-Temporal river wave propagation) to issue hyper-local (village-level) warnings with a minimum **30–90 minute evacuation lead-time**.
* Provides a **3D WebGIS Digital Twin** for SDMA/NDRF authorities with automated Explainable AI (SHAP) and infrastructure cut-off simulation.
* Operates a **Zero-Internet Local Hardware Fallback**: A solar-powered hillside sensor communicating via LoRa to trigger local village sirens in $<1.5\text{ seconds}$ even if cell towers collapse.

---

## 2. Target Personas & Stakeholders

| Persona | Role & Organization | Primary Needs & Jobs to Be Done |
| :--- | :--- | :--- |
| **Dr. Rajesh (District Magistrate / SDMA Officer)** | District Administration & Disaster Operations | Needs an intuitive 2D/3D map showing which villages/bridges are at risk, clear XAI explanations (why is risk high), and one-click evacuation orders. |
| **Inspector Vikram (NDRF Unit Commander)** | Quick Response & Rescue Logistics | Needs exact coordinates of affected habitations, dynamic lead-time before water surge arrives, and safe alternate evacuation corridors bypassing submerged bridges. |
| **Er. Sharma (Border Roads Organisation - BRO)** | Mountain Highway & Pass Maintenance | Needs advance warning on which road passes/culverts will face debris flow to pre-position excavators and JCBs. |
| **Suresh (Village Sarpanch / Local Resident)** | High-Risk Habitation Inhabitant | Needs instant, unambiguous, local audio/siren warnings with zero dependency on internet or smartphones when a surge begins upstream. |

---

## 3. Core Feature Specifications

### 🔹 Module 1: Multi-Source Data Ingestion Pipeline
* **F-1.1:** Real-time ingestion of in-situ sensor telemetry (Ultrasonic River Stage, Capacitive Soil Moisture, Subsurface Pore Pressure) via MQTT / REST.
* **F-1.2:** Ingestion of gridded rainfall and Doppler Weather Radar (IMD) reflectivity rasters.
* **F-1.3:** Integration of Cartosat 10m Digital Elevation Model (DEM) for Topographic Wetness Index (TWI) and slope calculations.
* **F-1.4:** Sentinel-1 SAR interferometric displacement metadata ingestion (mm/week pre-failure creep).

### 🔹 Module 2: Physics-Coupled AI Prediction Core
* **F-2.1 Dynamic Hydrograph Estimation:** Predicts upstream-to-downstream water stage discharge $Q(t)$ for the next 30 to 120 minutes using Spatio-Temporal Graph routing.
* **F-2.2 Slope Stability (Factor of Safety):** Evaluates real-time $F_s$ using Mohr-Coulomb soil mechanics:
  $$F_s = \frac{c' + (\gamma \cdot z - \gamma_w \cdot h_w) \cos^2\beta \cdot \tan\phi'}{\gamma \cdot z \cdot \sin\beta \cdot \cos\beta}$$
  Flagging imminent slope failure when $F_s < 1.0$.
* **F-2.3 Dynamic Evacuation Lead-Time Window ($\mathbf{T_{\text{lead}}}$):** Automatically calculates exact arrival time of peak water surge per habitation:
  $$T_{\text{lead}} = \frac{\text{Distance}}{\text{Surge Velocity}} - \Delta t_{\text{processing}}$$

### 🔹 Module 3: 2D/3D GIS Impact Digital Twin
* **F-3.1 2D Inundation Overlay:** Dynamic water spreading simulation draped over the DEM elevation raster.
* **F-3.2 Infrastructure Vulnerability Mapping:** Real-time status of critical infrastructure (Villages, Primary Schools, Bridges, Highway Passes). Flags submerged bridges and cut-off roads.
* **F-3.3 Safe Relocation & Evacuation Routing:** Computes the shortest safe evacuation path to green-zone shelters, dynamically avoiding cut-off road segments.

### 🔹 Module 4: Explainable AI (XAI) & Transparency
* **F-4.1 SHAP Attribution Card:** Visual breakdown of risk factors (e.g., Rainfall Rate 38%, Soil Saturation 26%, Steep Slope 18%, Upstream Surge 18%).
* **F-4.2 Geotechnical Diagnostic Metric:** Displays live physical drivers (Pore pressure $u$, Antecedent Precipitation Index) so engineers understand the root cause.

### 🔹 Module 5: Fail-Safe Multi-Tier Alerting
* **F-5.1 Tier 1 (Offline Hardware Fallback):** Direct LoRa radio pulse from hillside sensor node to village base pole to sound a 110dB solar siren and flash LED warning sign in $<1.5\text{s}$ (Zero Internet).
* **F-5.2 Tier 2 (Cloud Broadcast):** Common Alerting Protocol (CAP) compliant SMS, WhatsApp webhook, and audio IVR calls to registered village contacts.
* **F-5.3 Tier 3 (Tactical BRO Logistics Order):** Generates actionable advisory for pre-positioning earth-moving machinery (JCBs) at high-risk highway choke points.

---

## 4. Non-Functional Requirements (NFRs)

* **Performance & Latency:**
  * Telemetry API response time $< 150\text{ms}$.
  * Dynamic flood risk & lead-time inference cycle completed within $< 3\text{ seconds}$.
  * Offline LoRa emergency siren trigger latency $< 1.5\text{ seconds}$.
* **Availability & Reliability:**
  * Cloud platform uptime $\ge 99.9\%$.
  * Offline hardware node battery buffer $\ge 7\text{ days}$ during zero-sunlight monsoon periods.
* **Scalability:**
  * System architecture must scale to support 1,000+ distributed IoT sensor nodes and 50+ concurrent SDMA control rooms.
* **Security & Role-Based Access Control (RBAC):**
  * Strict separation between Public View (general alert status) and Disaster Authority Admin (triggering emergency broadcasts and viewing confidential cadastral data).

---

## 5. Success Metrics & Key Performance Indicators (KPIs)

| Metric | Baseline (Existing Systems) | Target for GeoResilience AI |
| :--- | :--- | :--- |
| **Evacuation Lead Time** | $< 10\text{ minutes}$ (Often 0 min) | **$30\text{ to }90\text{ minutes}$** |
| **False Alarm Rate** | $\approx 45-60\%$ (Generic Rainfall Thresholds) | **$\le 15\%$** (Physics-coupled verification) |
| **Siren Trigger Latency in Outages** | System Fails completely | **$< 1.5\text{ seconds}$** (Local LoRa link) |
| **Spatial Warning Granularity** | District Level ($\approx 1000\text{ km}^2$) | **Village / Ward Level ($\approx 1-5\text{ km}^2$)** |
| **Jury Demo Readiness** | Theory-only slide deck | **Working 3D WebGIS + Real-Time Sensor Simulator** |
