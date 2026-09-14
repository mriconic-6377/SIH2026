import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MapDashboard } from './components/MapDashboard';
import { PhysicsGauge } from './components/PhysicsGauge';
import { ShapAttributionCard } from './components/ShapAttributionCard';
import { LeadTimePanel } from './components/LeadTimePanel';
import { LiveHydrograph } from './components/LiveHydrograph';
import { DemElevationProfile } from './components/DemElevationProfile';
import { BroLogisticsPanel } from './components/BroLogisticsPanel';
import { MathPhysicsValidation } from './components/MathPhysicsValidation';
import { InfrastructureStatusPanel } from './components/InfrastructureStatusPanel';
import { DisasterCommandSidebar } from './components/DisasterCommandSidebar';
import { SirenModal } from './components/SirenModal';
import { CapAlertPanel } from './components/CapAlertPanel';
import { PlatformGuideModal } from './components/PlatformGuideModal';
import { MobileCitizenSirenApp } from './components/MobileCitizenSirenApp';
import { MobileSirenBroadcastModal } from './components/MobileSirenBroadcastModal';
import { CascadingChainTracker } from './components/CascadingChainTracker';
import { RelocationMatrixModal } from './components/RelocationMatrixModal';
import type {
  SensorStation,
  Habitation,
  Bridge,
  Shelter,
  FullAssessmentResult,
} from './types';
import {
  fetchLatestSensors,
  fetchGISLayers,
  fetchFullAssessment,
  createTelemetryWebSocket,
} from './services/api';

const BACKEND = '';

// ── Manual Scenario type (from App 2) ──
interface ManualScenario {
  rainfall_rate_mm_hr: number;
  soil_moisture_pct: number;
  slope_angle_deg: number;
  upstream_depth_m: number;
  scenario_name: string;
  pushed_at: string;
}

export function App() {
  // GIS & sensor state
  const [sensors, setSensors] = useState<SensorStation[]>([]);
  const [habitations, setHabitations] = useState<Habitation[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [assessment, setAssessment] = useState<FullAssessmentResult | null>(null);

  // UI state
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isSirenModalOpen, setIsSirenModalOpen] = useState(false);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isMobileSirenModalOpen, setIsMobileSirenModalOpen] = useState(false);
  const [isRelocationModalOpen, setIsRelocationModalOpen] = useState(false);

  // Citizen PWA Mobile View Detection
  const [isCitizenView, setIsCitizenView] = useState(
    window.location.hash.includes('citizen-siren') || window.location.pathname.includes('citizen-siren')
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsCitizenView(window.location.hash.includes('citizen-siren') || window.location.pathname.includes('citizen-siren'));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ── Manual Control Connection ──
  const [isManualConnected, setIsManualConnected] = useState(false);
  const [manualScenario, setManualScenario] = useState<ManualScenario | null>(null);

  // Live derived params (used when NOT in manual mode)
  const [liveRainfall, setLiveRainfall] = useState(8);
  const [liveMoisture, setLiveMoisture] = useState(45);
  const [liveSlope] = useState(28);
  const [liveDepth, setLiveDepth] = useState(2.0);

  // Active params — either live or manual
  const activeRainfall = isManualConnected && manualScenario ? manualScenario.rainfall_rate_mm_hr : liveRainfall;
  const activeMoisture = isManualConnected && manualScenario ? manualScenario.soil_moisture_pct : liveMoisture;
  const activeSlope = isManualConnected && manualScenario ? manualScenario.slope_angle_deg : liveSlope;
  const activeDepth = isManualConnected && manualScenario ? manualScenario.upstream_depth_m : liveDepth;

  // 1. Initial Load: GIS Layers and Sensors
  useEffect(() => {
    async function loadData() {
      try {
        const layers = await fetchGISLayers();
        if (layers.habitations?.features) {
          setHabitations(
            layers.habitations.features.map((f: any) => ({
              ...f.properties,
              lon: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1],
            }))
          );
        }
        if (layers.bridges?.features) {
          setBridges(
            layers.bridges.features.map((f: any) => ({
              ...f.properties,
              lon: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1],
            }))
          );
        }
        if (layers.shelters?.features) {
          setShelters(
            layers.shelters.features.map((f: any) => ({
              ...f.properties,
              lon: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1],
            }))
          );
        }
        const initialSensors = await fetchLatestSensors();
        setSensors(initialSensors);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    }
    loadData();
  }, []);

  // 2. Real-Time Telemetry via WebSocket & Polling
  useEffect(() => {
    let ws: WebSocket;
    try {
      ws = createTelemetryWebSocket(
        (reading) => {
          setIsWsConnected(true);
          setSensors((prev) =>
            prev.map((s) =>
              s.sensor_id === reading.sensor_id
                ? {
                    ...s,
                    latest: {
                      water_level_m: reading.water_level_m,
                      soil_moisture_pct: reading.soil_moisture_pct,
                      pore_pressure_kpa: reading.pore_pressure_kpa,
                      rainfall_mm_hr: reading.rainfall_rate_mm_hr,
                      battery_v: reading.battery_v,
                      recorded_at: reading.timestamp,
                    },
                  }
                : s
            )
          );
        },
        () => setIsWsConnected(false)
      );
    } catch (e) {
      console.warn('WebSocket setup failed, using polling', e);
    }

    const interval = setInterval(async () => {
      try {
        const fresh = await fetchLatestSensors();
        setSensors(fresh);
        setIsWsConnected(true);

        // Derive live params from sensor averages (only when not in manual mode)
        if (!isManualConnected) {
          const riverSensors = fresh.filter((s: any) => s.sensor_type === 'RIVER_GAUGE');
          const soilSensors = fresh.filter((s: any) => s.sensor_type === 'SOIL_MOISTURE');

          if (riverSensors.length > 0) {
            const avgDepth = riverSensors.reduce((acc: number, s: any) => acc + (s.latest?.water_level_m || 2.0), 0) / riverSensors.length;
            const avgRainfall = riverSensors.reduce((acc: number, s: any) => acc + (s.latest?.rainfall_mm_hr || 8), 0) / riverSensors.length;
            setLiveDepth(parseFloat(avgDepth.toFixed(2)));
            setLiveRainfall(parseFloat(avgRainfall.toFixed(1)));
          }
          if (soilSensors.length > 0) {
            const avgMoisture = soilSensors.reduce((acc: number, s: any) => acc + (s.latest?.soil_moisture_pct || 45), 0) / soilSensors.length;
            setLiveMoisture(parseFloat(avgMoisture.toFixed(1)));
          }
        }
      } catch (e) {
        setIsWsConnected(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [isManualConnected]);

  // 3. Poll Manual Scenario from App 2 (when connected)
  useEffect(() => {
    if (!isManualConnected) return;

    const pollManual = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/v1/scenario/manual`);
        if (res.ok) {
          const data = await res.json();
          if (data.scenario) {
            setManualScenario(data.scenario);
          }
        } else if (res.status === 404) {
          // No scenario pushed yet — keep waiting
        }
      } catch (e) {
        console.warn('Failed to poll manual scenario', e);
      }
    }, 5000);

    return () => clearInterval(pollManual);
  }, [isManualConnected]);

  // 4. Run Assessment whenever active params change
  useEffect(() => {
    async function runAssessment() {
      try {
        const res = await fetchFullAssessment({
          slope_angle_deg: activeSlope,
          soil_moisture_pct: activeMoisture,
          rainfall_rate_mm_hr: activeRainfall,
          cumulative_rain_24h_mm: activeRainfall * 1.5,
          upstream_water_depth_m: activeDepth,
          pore_pressure_kpa: (activeMoisture / 100) * 60,
        });
        setAssessment(res);
      } catch (err) {
        console.error('Error in risk assessment', err);
      }
    }
    runAssessment();
  }, [activeRainfall, activeMoisture, activeSlope, activeDepth]);

  // 5. Connect / Disconnect Manual Control
  const handleConnectManual = useCallback(async () => {
    setIsManualConnected(true);
    // Immediately fetch latest scenario on connect
    try {
      const res = await fetch(`${BACKEND}/api/v1/scenario/manual`);
      if (res.ok) {
        const data = await res.json();
        if (data.scenario) setManualScenario(data.scenario);
      }
    } catch (e) {}
  }, []);

  const handleDisconnectManual = useCallback(async () => {
    setIsManualConnected(false);
    setManualScenario(null);
    try {
      await fetch(`${BACKEND}/api/v1/scenario/manual`, { method: 'DELETE' });
    } catch (e) {}
  }, []);

  const threatLevel = assessment?.overall_risk_level || 'LOW';

  // If accessed via #citizen-siren, render the standalone Citizen Siren PWA
  if (isCitizenView) {
    return <MobileCitizenSirenApp />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
    }}>
      {/* Top Banner when Manual Control is active */}
      {isManualConnected && manualScenario && (
        <div style={{
          background: 'linear-gradient(90deg, #1e3a8a, #1e40af)',
          borderBottom: '1px solid #3b82f6',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#93c5fd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#f59e0b', color: '#000', fontWeight: 700,
              fontSize: '0.68rem', padding: '1px 6px', borderRadius: '3px',
            }}>
              TACTICAL SIMULATION ACTIVE
            </span>
            <span>
              Connected to <strong>Manual Control Panel (:5174)</strong>
            </span>
            {manualScenario.scenario_name && (
              <span style={{ color: '#cbd5e1' }}>
                — Scenario: <strong style={{ color: '#f3f4f6' }}>{manualScenario.scenario_name}</strong>
                {' '}| Rainfall: <strong style={{ color: '#38bdf8' }}>{manualScenario.rainfall_rate_mm_hr} mm/hr</strong>
                {' '}| Depth: <strong style={{ color: '#f97316' }}>{manualScenario.upstream_depth_m} m</strong>
                {' '}| Pushed: <strong>{new Date(manualScenario.pushed_at).toLocaleTimeString()}</strong>
              </span>
            )}
          </div>
          <button
            onClick={handleDisconnectManual}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#f87171', padding: '2px 10px', borderRadius: '4px',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
            }}
          >
            🔵 Back to Live Data
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        threatLevel={threatLevel}
        isWsConnected={isWsConnected}
        isManualConnected={isManualConnected}
        onConnectManual={handleConnectManual}
        onDisconnectManual={handleDisconnectManual}
        onOpenSirenModal={() => setIsSirenModalOpen(true)}
        onOpenCapModal={() => setIsCapModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenMobileSirenModal={() => setIsMobileSirenModalOpen(true)}
        onOpenRelocationModal={() => setIsRelocationModalOpen(true)}
      />

      {/* Main Dashboard Layout */}
      <main style={{
        flex: 1,
        padding: '0 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* NEW HERO INNOVATION 1: Multi-Hazard Cascading Domino Engine */}
        <CascadingChainTracker
          slopeStability={assessment?.slope_stability || null}
          threatLevel={threatLevel}
          rainfallRate={activeRainfall}
          waterDepth={activeDepth}
        />

        {/* TOP ROW: Multi-Hazard / GLOF / InSAR Command Sidebar on LEFT + Interactive GIS MAP on RIGHT */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 440px) 1fr',
          gap: '16px',
          alignItems: 'stretch',
        }}>
          {/* Top Left: GLOF Early Warning, ISRO InSAR Deformation, IMD Doppler dBZ & NDRF Staging */}
          <DisasterCommandSidebar
            threatLevel={threatLevel}
            waterDepth={activeDepth}
            rainfall={activeRainfall}
          />

          {/* Top Right: Dominant Interactive GIS Map */}
          <MapDashboard
            sensors={sensors}
            habitations={habitations}
            bridges={bridges}
            shelters={shelters}
            threatLevel={threatLevel}
            waterDepth={activeDepth}
            rainfall={activeRainfall}
          />
        </div>

        {/* MIDDLE SECTION: 6 Habitations & 4 Critical Bridges Physical Status Prediction (Full Width - 3 Cards per Row) */}
        <InfrastructureStatusPanel
          rainfall={activeRainfall}
          upstreamDepth={activeDepth}
          soilMoisture={activeMoisture}
        />

        {/* ANALYTICS ROW 1: Mohr-Coulomb F_s Stability Gauge + SHAP AI Explainability */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px',
          alignItems: 'start',
        }}>
          <PhysicsGauge slopeResult={assessment?.slope_stability || null} />
          <ShapAttributionCard explainability={assessment?.explainability || null} />
        </div>

        {/* ANALYTICS ROW 2: Live IoT Telemetry Hydrograph + Cartosat-1 DEM 3D Profile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px',
          alignItems: 'start',
        }}>
          <LiveHydrograph sensors={sensors} />
          <DemElevationProfile />
        </div>

        {/* ANALYTICS ROW 3: BRO Logistics Heavy Readiness + Basin Evacuation Lead-Time */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px',
          alignItems: 'start',
        }}>
          <BroLogisticsPanel
            threatLevel={threatLevel}
            rainfall={activeRainfall}
            upstreamDepth={activeDepth}
          />
          <LeadTimePanel leadTimeReport={assessment?.lead_time || null} />
        </div>

        {/* BOTTOM SECTION: Mathematical Algorithm & Physics-AI Alignment (Full Width) */}
        <MathPhysicsValidation
          rainfall={activeRainfall}
          slopeAngle={activeSlope}
          upstreamDepth={activeDepth}
        />
      </main>

      {/* LoRa Siren Simulation Modal */}
      <SirenModal
        isOpen={isSirenModalOpen}
        onClose={() => setIsSirenModalOpen(false)}
      />

      {/* NDMA Sachet CAP Broadcast Modal */}
      <CapAlertPanel
        isOpen={isCapModalOpen}
        onClose={() => setIsCapModalOpen(false)}
        threatLevel={threatLevel}
      />

      {/* Platform Architecture & Instructions Guide Modal */}
      <PlatformGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Zero-Touch Mobile Citizen Siren Broadcast Modal */}
      <MobileSirenBroadcastModal
        isOpen={isMobileSirenModalOpen}
        onClose={() => setIsMobileSirenModalOpen(false)}
      />

      {/* AI Permanent Relocation Suitability Matrix Modal */}
      <RelocationMatrixModal
        isOpen={isRelocationModalOpen}
        onClose={() => setIsRelocationModalOpen(false)}
      />
    </div>
  );
}

export default App;
