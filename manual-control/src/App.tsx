import { useState, useEffect } from 'react';
import { ShieldAlert, Gamepad2, ExternalLink } from 'lucide-react';

const BACKEND = '';

// ─── Scenario State ───
interface ScenarioState {
  rainfall: number;
  moisture: number;
  slope: number;
  depth: number;
  scenarioName: string;
}

// ─── Scenario Presets ───
const PRESETS = [
  {
    label: '🌧️ 2023 Mandi Cloudburst',
    description: 'Historic 125 mm/hr event, Aug 2023',
    values: { rainfall: 125, moisture: 88, slope: 37, depth: 5.0, scenarioName: '2023 Mandi Cloudburst' },
  },
  {
    label: '🌊 Larji Dam GLOF Surge',
    description: 'Glacial lake outburst flood scenario',
    values: { rainfall: 45, moisture: 70, slope: 22, depth: 6.8, scenarioName: 'Larji GLOF Surge' },
  },
  {
    label: '🏔️ Aut Tunnel Landslide',
    description: 'High pore pressure debris flow',
    values: { rainfall: 80, moisture: 92, slope: 42, depth: 3.5, scenarioName: 'Aut Tunnel Landslide' },
  },
  {
    label: '✅ Normal Weather Baseline',
    description: 'Clear sky, stable conditions',
    values: { rainfall: 8, moisture: 42, slope: 25, depth: 1.5, scenarioName: 'Normal Weather Baseline' },
  },
];

function App() {
  const [scenario, setScenario] = useState<ScenarioState>({
    rainfall: 25,
    moisture: 55,
    slope: 28,
    depth: 2.2,
    scenarioName: 'Custom Scenario',
  });

  const [isPushing, setIsPushing] = useState(false);
  const [lastPushedAt, setLastPushedAt] = useState<string | null>(null);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Poll status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/v1/scenario/status`);
        if (res.ok) {
          const data = await res.json();
          setIsConnected(data.is_manual_active && !!data.last_connected_at);
          setConnectionError(false);
        }
      } catch {
        setConnectionError(true);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setScenario(preset.values);
    setPushSuccess(false);
  };

  const pushScenario = async () => {
    setIsPushing(true);
    setPushSuccess(false);
    try {
      const res = await fetch(`${BACKEND}/api/v1/scenario/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall_rate_mm_hr: scenario.rainfall,
          soil_moisture_pct: scenario.moisture,
          slope_angle_deg: scenario.slope,
          upstream_depth_m: scenario.depth,
          scenario_name: scenario.scenarioName,
          pushed_by: 'Manual Control Panel',
        }),
      });
      if (res.ok) {
        setLastPushedAt(new Date().toLocaleTimeString());
        setPushSuccess(true);
        setTimeout(() => setPushSuccess(false), 4000);
      }
    } catch (e) {
      console.error('Push failed', e);
    } finally {
      setIsPushing(false);
    }
  };

  // Derive risk hint
  const getRiskHint = () => {
    if (scenario.rainfall > 100 || scenario.depth > 5.5) return { level: 'CRITICAL', color: '#ef4444' };
    if (scenario.rainfall > 60 || scenario.depth > 3.5 || scenario.moisture > 80) return { level: 'HIGH', color: '#f97316' };
    if (scenario.rainfall > 25 || scenario.depth > 2.0) return { level: 'MODERATE', color: '#eab308' };
    return { level: 'LOW', color: '#10b981' };
  };
  const riskHint = getRiskHint();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header className="glass-panel" style={{
        margin: '12px 16px', padding: '12px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        background: '#0d1527', border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '6px',
            background: '#1d4ed8', border: '1px solid #3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Gamepad2 size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="#60a5fa" />
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Disaster Scenario Control Console</h1>
              <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '3px', background: '#1e293b', color: '#93c5fd', border: '1px solid #334155' }}>
                Simulation Sandbox
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
              Adjust disaster variables &bull; Push parameters to Operational Dashboard &bull; PINN AI recalculates
            </p>
          </div>
        </div>

        {/* Connection status + link to dashboard */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '5px', background: '#1e293b', border: '1px solid #334155', fontSize: '0.72rem' }}>
            {connectionError ? (
              <>
                <span className="pulse-dot pulse-red" />
                <span style={{ color: '#f87171' }}>Backend Offline</span>
              </>
            ) : isConnected ? (
              <>
                <span className="pulse-dot pulse-green" />
                <span style={{ color: '#34d399', fontWeight: 600 }}>Main Dashboard Connected</span>
              </>
            ) : (
              <>
                <span className="pulse-dot pulse-blue" />
                <span style={{ color: '#94a3b8' }}>Bridge Ready (Click Connect on Dashboard)</span>
              </>
            )}
          </div>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '5px', textDecoration: 'none',
              fontSize: '0.75rem', fontWeight: 600, background: '#1e293b',
              color: '#93c5fd', border: '1px solid #334155', transition: 'all 0.15s'
            }}
          >
            <span>Open Operational Console</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '0 16px 16px',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 400px) 1fr',
        gap: '16px',
        alignItems: 'start',
      }}>

        {/* Left Column: Preset Scenarios */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Historic Presets</h2>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
              Select benchmark disaster conditions calibrated to Beas Valley events
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PRESETS.map((p, idx) => {
              const isSelected = scenario.scenarioName === p.values.scenarioName;
              return (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '3px',
                    padding: '10px 12px', borderRadius: '6px', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: isSelected ? '#1d4ed8' : '#090d16',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid #1e293b',
                    color: '#f8fafc',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: isSelected ? '#ffffff' : '#f8fafc' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? '#bfdbfe' : '#94a3b8' }}>
                    {p.description}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: isSelected ? '#dbeafe' : '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    Rain: {p.values.rainfall}mm/h &bull; Soil: {p.values.moisture}% &bull; Slope: {p.values.slope}° &bull; Stage: {p.values.depth}m
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Guidance Box */}
          <div style={{
            background: '#090d16', border: '1px solid #1e293b',
            borderRadius: '6px', padding: '10px', fontSize: '0.72rem', color: '#94a3b8',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <strong style={{ color: '#f8fafc' }}>How It Works:</strong>
            <div>1. Adjust sliders or select a preset.</div>
            <div>2. Click <strong>Push to Main Dashboard</strong>.</div>
            <div>3. In App 1 (:5173), click <strong>Connect Scenario</strong>.</div>
            <div>4. Physics models recompute instantly across all 6 habitations.</div>
          </div>
        </div>

        {/* Right Column: Custom Sliders & Push Button */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Custom Parameter Sliders</h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Active Scenario: <strong style={{ color: '#60a5fa' }}>{scenario.scenarioName}</strong>
              </p>
            </div>

            <div style={{
              padding: '3px 10px', borderRadius: '4px',
              background: `${riskHint.color}18`, color: riskHint.color,
              border: `1px solid ${riskHint.color}40`,
              fontSize: '0.72rem', fontWeight: 700
            }}>
              Forecast Risk: {riskHint.level}
            </div>
          </div>

          {/* Sliders Grid: Divided into clean 2-Column Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

            {/* Slider 1: Rainfall Rate */}
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>🌧️ Rainfall Intensity</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  {scenario.rainfall} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="160"
                step="1"
                value={scenario.rainfall}
                onChange={(e) => {
                  setScenario({ ...scenario, rainfall: parseFloat(e.target.value), scenarioName: 'Custom Scenario' });
                  setPushSuccess(false);
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>0 mm/h (Drizzle)</span>
                <span>50 mm/h (Heavy)</span>
                <span>160 mm/h (Cloudburst)</span>
              </div>
            </div>

            {/* Slider 2: Soil Moisture */}
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>🌱 Soil Saturation</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {scenario.moisture} %
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={scenario.moisture}
                onChange={(e) => {
                  setScenario({ ...scenario, moisture: parseFloat(e.target.value), scenarioName: 'Custom Scenario' });
                  setPushSuccess(false);
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>10% (Dry)</span>
                <span>60% (Field Capacity)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Slider 3: Slope Angle */}
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>🏔️ Valley Slope Angle</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {scenario.slope}°
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={scenario.slope}
                onChange={(e) => {
                  setScenario({ ...scenario, slope: parseFloat(e.target.value), scenarioName: 'Custom Scenario' });
                  setPushSuccess(false);
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>5° (Gentle)</span>
                <span>35° (Steep Valley)</span>
                <span>60° (Cliff Face)</span>
              </div>
            </div>

            {/* Slider 4: Upstream River Depth */}
            <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>🌊 River Stage Depth</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {scenario.depth} m
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.5"
                step="0.1"
                value={scenario.depth}
                onChange={(e) => {
                  setScenario({ ...scenario, depth: parseFloat(e.target.value), scenarioName: 'Custom Scenario' });
                  setPushSuccess(false);
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>0.5m (Low Flow)</span>
                <span>3.0m (Warning)</span>
                <span>8.5m (Extreme Flood)</span>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '14px' }}>
            <div>
              {lastPushedAt && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Last transmitted: <strong style={{ color: '#f8fafc' }}>{lastPushedAt}</strong>
                </div>
              )}
              {pushSuccess && (
                <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                  ✓ Scenario dispatched. Operational Console updated.
                </div>
              )}
            </div>

            <button
              onClick={pushScenario}
              disabled={isPushing}
              style={{
                padding: '8px 20px', borderRadius: '6px', border: '1px solid #3b82f6',
                background: '#2563eb', color: '#ffffff',
                fontSize: '0.82rem', fontWeight: 700, cursor: isPushing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{isPushing ? 'Transmitting...' : 'Push to Main Dashboard'}</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
