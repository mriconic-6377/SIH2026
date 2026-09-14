import React, { useState, useEffect } from 'react';
import { Radar, Eye } from 'lucide-react';

interface DisasterCommandSidebarProps {
  threatLevel: string;
  waterDepth: number;
  rainfall: number;
}

export const DisasterCommandSidebar: React.FC<DisasterCommandSidebarProps> = ({
  threatLevel,
  waterDepth,
  rainfall,
}) => {
  const [activeTab, setActiveTab] = useState<'glof' | 'radar_sar' | 'ndrf_ops' | 'telemetry'>('glof');
  const [liveDeformation, setLiveDeformation] = useState(-3.8);
  const [radarDbz, setRadarDbz] = useState(38.2);

  // Dynamic reaction to rainfall and depth
  useEffect(() => {
    const calculatedDbz = Math.min(65.0, 25.0 + rainfall * 0.35 + (waterDepth > 3.0 ? 10.0 : 0));
    setRadarDbz(parseFloat(calculatedDbz.toFixed(1)));

    const def = -2.5 - (rainfall * 0.05) - (waterDepth * 0.3);
    setLiveDeformation(parseFloat(def.toFixed(2)));
  }, [rainfall, waterDepth]);

  const isCritical = threatLevel === 'CRITICAL' || threatLevel === 'HIGH';

  // Glacial Lakes Data in Beas / Himachal Catchment
  const glacialLakes = [
    {
      name: 'Ghepan Gath Glacial Lake',
      elevation_m: 4050,
      area_hectares: 54.2,
      water_volume_million_m3: 18.5,
      moraine_stability: isCritical ? 'UNSTABLE / EXPANDING' : 'STABLE MORAINE DAM',
      moraine_color: isCritical ? '#ef4444' : '#10b981',
      breach_risk_pct: isCritical ? 78.4 : 12.2,
      freeboard_margin_m: isCritical ? 1.8 : 4.6,
      distance_to_mandi_km: 84.0,
      estimated_surge_time_hrs: 2.8,
    },
    {
      name: 'Samudra Tapu Glacial Lake',
      elevation_m: 4280,
      area_hectares: 92.0,
      water_volume_million_m3: 34.0,
      moraine_stability: 'MONITORED BY SATELLITE',
      moraine_color: '#3b82f6',
      breach_risk_pct: isCritical ? 45.0 : 8.5,
      freeboard_margin_m: 6.2,
      distance_to_mandi_km: 112.0,
      estimated_surge_time_hrs: 4.1,
    },
    {
      name: 'Chhota Shigri Ice Basin',
      elevation_m: 4400,
      area_hectares: 38.5,
      water_volume_million_m3: 9.8,
      moraine_stability: 'NORMAL ACCUMULATION',
      moraine_color: '#10b981',
      breach_risk_pct: isCritical ? 32.0 : 4.0,
      freeboard_margin_m: 7.5,
      distance_to_mandi_km: 96.0,
      estimated_surge_time_hrs: 3.4,
    },
  ];

  // NDRF & Emergency Staging Hubs
  const ndrfDeployments = [
    {
      unit: 'NDRF 14th Bn — Quick Reaction Alpha',
      location: 'Kullu Staging Hub (NH-21)',
      strength: '38 Personnel &bull; 4 Inflatable Boats',
      status: isCritical ? 'DEPLOYED TO GORGE' : 'STANDBY (READY 15m)',
      status_color: isCritical ? '#f97316' : '#10b981',
    },
    {
      unit: 'HP SDRF Regional Task Force Bravo',
      location: 'Pandoh Dam Emergency Post',
      strength: '24 Operators &bull; Drone Recon Team',
      status: isCritical ? 'ACTIVE PATROL & CLEARANCE' : 'ROUTINE MONITORING',
      status_color: isCritical ? '#ef4444' : '#3b82f6',
    },
    {
      unit: 'Air Evacuation Helipad Matrix',
      location: 'Bhuntar Airport (1110m) + Mandi Ground',
      strength: 'Mi-17 / ALH Dhruv Clearance Ready',
      status: '🟢 OPERATIONAL (Wind: 8 kt)',
      status_color: '#10b981',
    },
    {
      unit: 'Larji & Pandoh Dam Sluice Control',
      location: 'Beas Hydro Command Post',
      strength: 'Spillway Capacity: 6,200 m³/s',
      status: isCritical ? '⚠️ 2/5 GATES DISCHARGING' : 'ALL GATES NORMAL',
      status_color: isCritical ? '#f97316' : '#10b981',
    },
  ];

  return (
    <div className="glass-panel" style={{
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px',
      height: '100%', minHeight: '480px', boxSizing: 'border-box',
      background: '#0d1527', border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '5px',
            background: '#1d4ed8',
            border: '1px solid #3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Radar size={15} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
              Multi-Hazard &amp; GLOF Intelligence
            </h3>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              Glacial Lakes &bull; ISRO InSAR &bull; IMD Doppler &bull; NDRF Staging
            </p>
          </div>
        </div>

        <span style={{
          fontSize: '0.62rem', padding: '2px 6px', borderRadius: '3px',
          background: isCritical ? 'rgba(220,38,38,0.12)' : 'rgba(16,185,129,0.12)',
          color: isCritical ? '#f87171' : '#34d399',
          border: `1px solid ${isCritical ? 'rgba(220,38,38,0.3)' : 'rgba(16,185,129,0.3)'}`,
          fontWeight: 700
        }}>
          {isCritical ? 'HIGH WATCH' : 'SCAN ACTIVE'}
        </span>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: '#090d16', padding: '3px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <button
          onClick={() => setActiveTab('glof')}
          style={{
            padding: '5px 2px', borderRadius: '4px', border: activeTab === 'glof' ? '1px solid #3b82f6' : 'none', fontSize: '0.68rem', fontWeight: 600,
            cursor: 'pointer', textAlign: 'center',
            background: activeTab === 'glof' ? '#1d4ed8' : 'transparent',
            color: activeTab === 'glof' ? '#ffffff' : '#94a3b8',
          }}
        >
          GLOF
        </button>

        <button
          onClick={() => setActiveTab('radar_sar')}
          style={{
            padding: '5px 2px', borderRadius: '4px', border: activeTab === 'radar_sar' ? '1px solid #3b82f6' : 'none', fontSize: '0.68rem', fontWeight: 600,
            cursor: 'pointer', textAlign: 'center',
            background: activeTab === 'radar_sar' ? '#1d4ed8' : 'transparent',
            color: activeTab === 'radar_sar' ? '#ffffff' : '#94a3b8',
          }}
        >
          InSAR
        </button>

        <button
          onClick={() => setActiveTab('ndrf_ops')}
          style={{
            padding: '5px 2px', borderRadius: '4px', border: activeTab === 'ndrf_ops' ? '1px solid #3b82f6' : 'none', fontSize: '0.68rem', fontWeight: 600,
            cursor: 'pointer', textAlign: 'center',
            background: activeTab === 'ndrf_ops' ? '#1d4ed8' : 'transparent',
            color: activeTab === 'ndrf_ops' ? '#ffffff' : '#94a3b8',
          }}
        >
          NDRF
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          style={{
            padding: '5px 2px', borderRadius: '4px', border: activeTab === 'telemetry' ? '1px solid #3b82f6' : 'none', fontSize: '0.68rem', fontWeight: 600,
            cursor: 'pointer', textAlign: 'center',
            background: activeTab === 'telemetry' ? '#1d4ed8' : 'transparent',
            color: activeTab === 'telemetry' ? '#ffffff' : '#94a3b8',
          }}
        >
          Sensors
        </button>
      </div>

      {/* Tab 1: GLOF Glacial Lake Watch */}
      {activeTab === 'glof' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '360px' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', background: '#090d16', padding: '5px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <strong>GLOF Surveillance Protocol:</strong> Continuous moraine dam &amp; water volume satellite tracking across high-altitude Himalayan lakes.
          </div>

          {glacialLakes.map((lake, idx) => (
            <div key={idx} style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: '5px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#f8fafc' }}>{lake.name}</span>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                  background: `${lake.moraine_color}18`, color: lake.moraine_color, border: `1px solid ${lake.moraine_color}35`
                }}>
                  {lake.moraine_stability}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '0.68rem', color: '#94a3b8' }}>
                <div>Elev: <strong style={{ color: '#e2e8f0' }}>{lake.elevation_m}m</strong></div>
                <div>Volume: <strong style={{ color: '#60a5fa' }}>{lake.water_volume_million_m3}M m³</strong></div>
                <div>Breach Risk: <strong style={{ color: lake.breach_risk_pct > 50 ? '#ef4444' : '#10b981' }}>{lake.breach_risk_pct}%</strong></div>
                <div>Surge Time: <strong style={{ color: '#fbbf24' }}>{lake.estimated_surge_time_hrs} hrs</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '3px', marginTop: '1px' }}>
                <span>Freeboard: {lake.freeboard_margin_m}m</span>
                <span>Distance: {lake.distance_to_mandi_km} km</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: ISRO InSAR & Doppler Radar Live Surveillance */}
      {activeTab === 'radar_sar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: '360px' }}>
          {/* ISRO InSAR */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '5px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Radar size={13} />
                <span>ISRO / Sentinel-1 InSAR Deformation</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#10b981' }}>12-Day Cycle</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Aut Gorge Slope Displacement:</span>
                <strong style={{ color: liveDeformation < -5.0 ? '#ef4444' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {liveDeformation} mm/week
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phase Coherence Index (γ):</span>
                <strong style={{ color: '#10b981', fontFamily: 'var(--font-mono)' }}>0.84 (High)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Accelerated Creep:</span>
                <strong style={{ color: isCritical ? '#ef4444' : '#10b981' }}>
                  {isCritical ? '⚠️ Detected' : 'Normal'}
                </strong>
              </div>
            </div>
          </div>

          {/* IMD Doppler Weather Radar */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '5px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Eye size={13} />
                <span>IMD Doppler S-Band Radar</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#60a5fa' }}>Shimla Station</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Max Reflectivity (Z_max):</span>
                <strong style={{ color: radarDbz > 45.0 ? '#ef4444' : '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  {radarDbz} dBZ {radarDbz > 45.0 ? '🚨 Cloudburst Core' : ''}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Echo Tops Height:</span>
                <strong style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>11.4 km</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mesocyclone Rotation:</span>
                <strong style={{ color: isCritical ? '#f97316' : '#10b981' }}>
                  {isCritical ? '⚠️ Weak Rotation' : 'None'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: NDRF Deployment & Reservoir Status */}
      {activeTab === 'ndrf_ops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, maxHeight: '360px' }}>
          {ndrfDeployments.map((d, idx) => (
            <div key={idx} style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: '5px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.76rem', color: '#f8fafc' }}>{d.unit}</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{d.location} &bull; {d.strength}</div>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700, color: d.status_color,
                background: '#090d16', padding: '2px 5px', borderRadius: '3px', marginTop: '2px',
                border: '1px solid rgba(255,255,255,0.04)'
              }}>
                {d.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: IoT & Sat-Comm Health Telemetry */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, maxHeight: '360px', fontSize: '0.7rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <span>LoRaWAN Mesh Gateway:</span>
            <strong style={{ color: '#10b981' }}>🟢 Online (868 MHz)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <span>INSAT-3DR Sat-Broadcast:</span>
            <strong style={{ color: '#10b981' }}>🟢 Synced</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <span>NASA GPM Constellation:</span>
            <strong style={{ color: '#60a5fa' }}>14 mins (IMERG Early)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <span>Sensor Network Packet Loss:</span>
            <strong style={{ color: '#10b981' }}>0.04% (8/8 Online)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
            <span>Average Station Battery:</span>
            <strong style={{ color: '#10b981' }}>12.8 V (Solar Nominal)</strong>
          </div>
        </div>
      )}
    </div>
  );
};
