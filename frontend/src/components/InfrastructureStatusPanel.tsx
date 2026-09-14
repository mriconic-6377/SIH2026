import React, { useState, useEffect } from 'react';
import { Home, Compass, Users, Navigation } from 'lucide-react';
import { fetchInfrastructureStatus } from '../services/api';
import type { InfrastructureStatusReport, VillageStatus, BridgeStatus } from '../types';

interface InfrastructureStatusPanelProps {
  rainfall: number;
  upstreamDepth: number;
  soilMoisture: number;
}

export const InfrastructureStatusPanel: React.FC<InfrastructureStatusPanelProps> = ({
  rainfall,
  upstreamDepth,
  soilMoisture,
}) => {
  const [data, setData] = useState<InfrastructureStatusReport | null>(null);
  const [activeTab, setActiveTab] = useState<'villages' | 'bridges'>('villages');

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetchInfrastructureStatus({
          rainfall_rate_mm_hr: rainfall,
          upstream_water_depth_m: upstreamDepth,
          soil_moisture_pct: soilMoisture,
        });
        setData(res);
      } catch (e) {
        console.error('Failed to load infrastructure status', e);
      }
    }
    loadStatus();
  }, [rainfall, upstreamDepth, soilMoisture]);

  if (!data) return null;

  const villages = data.habitations || [];
  const bridges = data.bridges || [];

  const criticalVillages = villages.filter(v => v.status === 'EVACUATE_NOW' || v.status === 'HIGH_ALERT');
  const criticalBridges = bridges.filter(b => b.status === 'SUBMERGED_CLOSED' || b.status === 'CRITICAL_SCOUR_WARNING');
  const totalPopAtRisk = villages.reduce((acc, v) => acc + (v.status !== 'SAFE' ? v.population : 0), 0);

  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      background: '#0d1527',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '6px',
            background: '#1d4ed8',
            border: '1px solid #3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Home size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc' }}>
                6 Habitations &amp; 4 Critical Bridges — Physical Status Prediction
              </h2>
              <span style={{
                fontSize: '0.65rem', padding: '1px 6px', borderRadius: '3px',
                background: '#1e293b', color: '#93c5fd', border: '1px solid #334155', fontWeight: 600
              }}>
                Hydro-Geotechnical Law Engine
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
              Dynamic flood inundation, Mohr-Coulomb slope stability (F_s), bridge deck freeboard &amp; pier scour velocity
            </p>
          </div>
        </div>

        {/* Quick KPI pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            background: criticalVillages.length > 0 ? 'rgba(220,38,38,0.12)' : 'rgba(16,185,129,0.12)',
            border: `1px solid ${criticalVillages.length > 0 ? 'rgba(220,38,38,0.3)' : 'rgba(16,185,129,0.3)'}`,
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
            color: criticalVillages.length > 0 ? '#f87171' : '#34d399',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            <Users size={13} />
            <span>{totalPopAtRisk.toLocaleString()} Residents at Risk ({criticalVillages.length}/6 Alert)</span>
          </div>

          <div style={{
            background: criticalBridges.length > 0 ? 'rgba(234,88,12,0.12)' : 'rgba(16,185,129,0.12)',
            border: `1px solid ${criticalBridges.length > 0 ? 'rgba(234,88,12,0.3)' : 'rgba(16,185,129,0.3)'}`,
            padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
            color: criticalBridges.length > 0 ? '#fb923c' : '#34d399',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            <Compass size={13} />
            <span>{criticalBridges.length}/4 Bridges at Scour Risk</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('villages')}
          style={{
            padding: '5px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'villages' ? '#2563eb' : '#1e293b',
            color: activeTab === 'villages' ? '#ffffff' : '#94a3b8',
            border: activeTab === 'villages' ? '1px solid #60a5fa' : '1px solid #334155',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Home size={13} />
          <span>6 Vulnerable Habitations (Upstream &rarr; Downstream)</span>
          <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.3)' }}>6</span>
        </button>

        <button
          onClick={() => setActiveTab('bridges')}
          style={{
            padding: '5px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'bridges' ? '#2563eb' : '#1e293b',
            color: activeTab === 'bridges' ? '#ffffff' : '#94a3b8',
            border: activeTab === 'bridges' ? '1px solid #60a5fa' : '1px solid #334155',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Compass size={13} />
          <span>4 Critical Highway Bridges (NH-21)</span>
          <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(0,0,0,0.3)' }}>4</span>
        </button>

        <div style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
          Discharge: <strong>{data.inputs.discharge_m3_s.toFixed(1)} m³/s</strong> &bull; Wave Speed: <strong>{data.inputs.surge_wave_speed_m_s} m/s</strong>
        </div>
      </div>

      {/* Tab 1: 6 Habitations View (Strictly 3 Columns: 3 Cards Row 1, 3 Cards Row 2) */}
      {activeTab === 'villages' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '14px',
        }}>
          {villages.map((v: VillageStatus, idx: number) => {
            const isDanger = v.status === 'EVACUATE_NOW' || v.status === 'HIGH_ALERT';
            return (
              <div
                key={v.id}
                style={{
                  background: isDanger ? 'rgba(220,38,38,0.06)' : '#0f172a',
                  border: `1px solid ${isDanger ? 'rgba(220,38,38,0.35)' : '#1e293b'}`,
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '220px'
                }}
              >
                {/* Status Bar Indicator */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: v.status_color
                }} />

                {/* Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                          background: '#1e293b', color: '#93c5fd', fontFamily: 'var(--font-mono)'
                        }}>
                          #{idx + 1} &bull; {v.distance_km} km
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>{v.name}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>({v.district} Dist.)</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        Elev: <strong>{v.elevation_m}m</strong> &bull; Slope: <strong>{v.slope_angle_deg}°</strong> &bull; Pop: <strong>{v.population.toLocaleString()}</strong>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                      background: `${v.status_color}18`, color: v.status_color, border: `1px solid ${v.status_color}40`,
                      whiteSpace: 'nowrap'
                    }}>
                      {v.status_label}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
                    background: '#090d16', padding: '6px 8px', borderRadius: '4px', fontSize: '0.7rem',
                    border: '1px solid rgba(255,255,255,0.04)', marginTop: '8px'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.62rem' }}>Geotech F_s</div>
                      <div style={{
                        fontWeight: 700, fontFamily: 'var(--font-mono)',
                        color: v.factor_of_safety < 1.0 ? '#ef4444' : v.factor_of_safety < 1.3 ? '#f97316' : '#34d399'
                      }}>
                        {v.factor_of_safety.toFixed(2)}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.62rem' }}>Inundation Risk</div>
                      <div style={{
                        fontWeight: 700, fontFamily: 'var(--font-mono)',
                        color: v.inundation_risk_pct > 70 ? '#ef4444' : v.inundation_risk_pct > 40 ? '#f97316' : '#60a5fa'
                      }}>
                        {v.inundation_risk_pct}%
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.62rem' }}>Lead Time</div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                        {v.lead_time_mins} min
                      </div>
                    </div>
                  </div>

                  {/* Demographics & Freeboard */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
                    <span>Vulnerable: <strong style={{ color: '#f1f5f9' }}>{v.vulnerable_count}</strong></span>
                    <span>Kutcha: <strong style={{ color: '#f1f5f9' }}>{v.kutcha_houses_count}</strong></span>
                    <span>Freeboard: <strong style={{ color: v.freeboard_margin_m <= 0.5 ? '#ef4444' : '#34d399' }}>{v.freeboard_margin_m}m</strong></span>
                  </div>
                </div>

                {/* Tactical Advisory & Shelter */}
                <div style={{
                  background: '#090d16', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '4px', padding: '6px 8px', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px'
                }}>
                  <div style={{ color: '#cbd5e1' }}>
                    <strong>Directive:</strong> {v.advisory}
                  </div>
                  <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                    <Navigation size={10} />
                    <span>Shelter: <strong>{v.nearest_shelter}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 4 Critical Bridges View (Strictly 2 Columns: 2 Cards Row 1, 2 Cards Row 2) */}
      {activeTab === 'bridges' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '14px',
        }}>
          {bridges.map((b: BridgeStatus, idx: number) => {
            const isDanger = b.status === 'SUBMERGED_CLOSED' || b.status === 'CRITICAL_SCOUR_WARNING';
            return (
              <div
                key={b.id}
                style={{
                  background: isDanger ? 'rgba(220,38,38,0.06)' : '#0f172a',
                  border: `1px solid ${isDanger ? 'rgba(220,38,38,0.35)' : '#1e293b'}`,
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '200px'
                }}
              >
                {/* Status Bar Indicator */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: b.status_color
                }} />

                {/* Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                          background: '#1e293b', color: '#fbbf24', fontFamily: 'var(--font-mono)'
                        }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>{b.name}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', background: '#1e293b', color: '#94a3b8' }}>
                          {b.highway}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        Deck Elev: <strong>{b.deck_elevation_m}m</strong> &bull; Span: <strong>{b.span_m}m</strong>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                      background: `${b.status_color}18`, color: b.status_color, border: `1px solid ${b.status_color}40`,
                      whiteSpace: 'nowrap'
                    }}>
                      {b.status_label}
                    </span>
                  </div>

                  {/* Engineering Metrics Grid */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px',
                    background: '#090d16', padding: '6px 8px', borderRadius: '4px', fontSize: '0.7rem',
                    border: '1px solid rgba(255,255,255,0.04)', marginTop: '8px'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.62rem' }}>Freeboard</div>
                      <div style={{
                        fontWeight: 700, fontFamily: 'var(--font-mono)',
                        color: b.freeboard_clearance_m <= 0.5 ? '#ef4444' : b.freeboard_clearance_m <= 1.5 ? '#f97316' : '#34d399'
                      }}>
                        {b.freeboard_clearance_m} m
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.62rem' }}>Scour Vel. (v_s)</div>
                      <div style={{
                        fontWeight: 700, fontFamily: 'var(--font-mono)',
                        color: b.scour_velocity_m_s > 6.0 ? '#ef4444' : b.scour_velocity_m_s > 4.0 ? '#fbbf24' : '#60a5fa'
                      }}>
                        {b.scour_velocity_m_s} m/s
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.62rem' }}>Pier Thrust</div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                        {b.pier_hydrodynamic_thrust_kn} kN
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submergence & Traffic Action */}
                <div style={{
                  background: '#090d16', border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '4px', padding: '6px 8px', fontSize: '0.68rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.64rem' }}>
                    <span>Submergence Risk: <strong style={{ color: b.submergence_risk_pct > 60 ? '#ef4444' : '#60a5fa' }}>{b.submergence_risk_pct}%</strong></span>
                    <span>Highway: <strong style={{ color: b.status_color }}>{b.status === 'SUBMERGED_CLOSED' ? 'BLOCKED' : 'OPEN'}</strong></span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
                    <strong style={{ color: '#f59e0b' }}>BRO Action:</strong> {b.traffic_action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
