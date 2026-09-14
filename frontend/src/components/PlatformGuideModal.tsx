import React, { useState } from 'react';
import { BookOpen, X, ShieldAlert, Layers, Sigma, Compass, Radio } from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'dual_app' | 'math_engine' | 'villages_bridges' | 'alert_flow' | 'sop'>('overview');

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', label: '1. Executive Overview', icon: ShieldAlert },
    { id: 'dual_app', label: '2. Dual-Console Architecture', icon: Layers },
    { id: 'math_engine', label: '3. Physics-AI Law Suite (PINN)', icon: Sigma },
    { id: 'villages_bridges', label: '4. Habitations & Bridges Physics', icon: Compass },
    { id: 'alert_flow', label: '5. NDMA CAP & BRO Logistics', icon: Radio },
    { id: 'sop', label: '6. Operational SOP & NDRF Workflow', icon: BookOpen },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(5, 10, 25, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '980px', maxWidth: '96vw', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: '#0f172a', border: '1px solid #334155',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)', borderRadius: '8px'
      }}>
        {/* Modal Top Bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d1527'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '5px',
              background: '#1d4ed8', border: '1px solid #3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                GeoResilience AI — Platform Architecture &amp; SOP Manual
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Institutional Guide for District Disaster Management Authority (DDMA), NDRF &amp; BRO Engineers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: '5px', padding: '5px', color: '#94a3b8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body (Sidebar + Content) */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden' }}>
          {/* Left Navigation */}
          <div style={{
            background: '#090d16', borderRight: '1px solid #1e293b',
            padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 6px' }}>
              Documentation Index
            </div>
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    textAlign: 'left', padding: '8px 10px', borderRadius: '5px', border: isActive ? '1px solid #3b82f6' : '1px solid transparent',
                    background: isActive ? '#1d4ed8' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8', fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6 }}>

            {/* Section 1: Overview */}
            {activeSection === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  1. Executive Overview &amp; Mandi-Kullu Valley Catchment
                </h3>
                <p>
                  <strong>GeoResilience AI</strong> is an enterprise multi-hazard disaster early warning and evacuation intelligence platform custom-engineered for the <strong>Beas River Valley (Mandi to Kullu stretch, Himachal Pradesh)</strong> along National Highway 21 (NH-21 / NH-154).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '4px', fontSize: '0.8rem' }}>Target Hazards Monitored</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <li>Cloudburst Induced Flash Floods</li>
                      <li>Glacial Lake Outburst Floods (GLOFs)</li>
                      <li>Pore-Water Driven Slope Failures &amp; Landslides</li>
                      <li>Debris Flows &amp; Riverbank Scour</li>
                    </ul>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', fontSize: '0.8rem' }}>Integrated Data Streams</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <li>ISRO Cartosat-1 10m/30m DEM Elevation</li>
                      <li>NASA GPM Real-Time Satellite Precipitation</li>
                      <li>OpenWeather Regional IMD Telemetry</li>
                      <li>8 Live In-Situ River &amp; Slope IoT Piezometers</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Dual Web App Architecture */}
            {activeSection === 'dual_app' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  2. Dual-Console System Architecture
                </h3>
                <p>
                  To ensure strict operational safety between <strong>live monitoring</strong> and <strong>tactical simulation modeling</strong>, the platform is partitioned into two synchronized applications:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.85rem' }}>Operational Console (:5173)</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 8px' }}>Command Center &amp; Live Analytics</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Displays live IoT sensors, NASA GPM &amp; OpenWeather</li>
                      <li>Mohr-Coulomb F_s stability gauges &amp; SHAP attribution</li>
                      <li>Live 6 Villages &amp; 4 Bridges physical impact condition</li>
                      <li><strong>Scenario Toggle</strong>: Syncs with App 2 parameters on demand.</li>
                    </ul>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#cbd5e1', fontSize: '0.85rem' }}>Simulation Sandbox (:5174)</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 8px' }}>What-If Scenario Modeling</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Sliders for Rainfall, Moisture, Slope, and Stage Depth</li>
                      <li>4 Historic Presets (2023 Mandi Cloudburst, Larji GLOF, etc.)</li>
                      <li><strong>Push to Main Dashboard</strong>: Transmits values to the shared memory bridge API.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Mathematical Algorithms */}
            {activeSection === 'math_engine' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  3. Physics-AI Law Suite (PINN Architecture)
                </h3>
                <p>
                  GeoResilience AI utilizes a Physics-Informed Neural Network (PINN) framework coupled with fundamental physical conservation laws:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.82rem' }}>1. Green-Ampt Transient Subsurface Infiltration</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#93c5fd', margin: '3px 0' }}>
                      f(t) = K_s · [1 + (ψ·Δθ)/F(t)], &nbsp;&nbsp; u_w = γ_w · (F(t) - S_drain) / n
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Calculates wetting front propagation into Himalayan sandy loam colluvium and dynamic pore-water pressure ($u_w$ in kPa).
                    </div>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.82rem' }}>2. Mohr-Coulomb Infinite Slope Stability (Cartosat DEM)</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#fef08a', margin: '3px 0' }}>
                      F_s = [c' + (γ·z - u_w)·cos²(β)·tan(φ')] / [γ·z·sin(β)·cos(β)]
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Computes Factor of Safety ($F_s$) along steep valley slopes ($15^\circ - 45^\circ$). $F_s &lt; 1.0$ triggers landslide failure alarms.
                    </div>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.82rem' }}>3. 1D St. Venant &amp; Manning Hydrodynamic Surge Wave Routing</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#a7f3d0', margin: '3px 0' }}>
                      c = √(g·y) + v_flow, &nbsp;&nbsp; Q = (1/n)·A·R^(2/3)·S_0^(1/2), &nbsp;&nbsp; T_lead = (x / c) - t_delay
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Routes flood waves downstream through Beas River gorge geometry to calculate exact village arrival timestamps.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: 6 Villages & 4 Bridges Physics */}
            {activeSection === 'villages_bridges' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  4. Habitations &amp; Bridges Physics Matrix
                </h3>
                <p>
                  Every individual settlement and bridge in the Beas Valley is tracked with localized terrain elevation, channel cross-section, and vulnerability metrics:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '4px' }}>6 Vulnerable Habitations</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <li><strong>Bhuntar</strong> (Pop: 8,500, Elev: 1096m, 11.5km)</li>
                      <li><strong>Larji</strong> (Pop: 1,800, Elev: 900m, 23.5km)</li>
                      <li><strong>Aut</strong> (Pop: 2,800, Elev: 850m, 27.0km)</li>
                      <li><strong>Thalot</strong> (Pop: 1,200, Elev: 750m, 36.0km)</li>
                      <li><strong>Pandoh</strong> (Pop: 3,500, Elev: 780m, 44.5km)</li>
                      <li><strong>Mandi Town</strong> (Pop: 26,422, Elev: 710m, 62.0km)</li>
                    </ul>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#fb923c', marginBottom: '4px' }}>4 Critical Highway Bridges (NH-21)</div>
                    <ul style={{ paddingLeft: '16px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <li><strong>Bhuntar Beas Bridge</strong>: 65m span, Deck 1100m</li>
                      <li><strong>Larji Dam Access Bridge</strong>: 45m span, Deck 905m</li>
                      <li><strong>Aut Tunnel Approach Bridge</strong>: 40m span, Deck 855m</li>
                      <li><strong>Pandoh Lake Crossing</strong>: 70m span, Deck 785m</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: NDMA CAP & BRO Logistics */}
            {activeSection === 'alert_flow' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  5. NDMA CAP v1.2, LoRaWAN Siren &amp; BRO Logistics
                </h3>
                <p>
                  The platform embeds 3 automated tactical emergency action workflows:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.8rem' }}>NDMA CAP Broadcast</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Generates XML payload formatted to <strong>ITU-T X.1303 / OASIS CAP v1.2</strong> standard for direct broadcast over <strong>NDMA Sachet Portal</strong>.
                    </div>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.8rem' }}>LoRaWAN Offline Siren</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Triggers solar-powered 120 dB acoustic sirens in downstream habitations using <strong>868 MHz LoRa mesh</strong> during power grid blackouts.
                    </div>
                  </div>

                  <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.8rem' }}>BRO 70 RCC Logistics</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Calculates heavy machinery staging (Excavators, JCBs, Bailey bridge kits) at high-risk highway choke points along NH-21.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: Operator SOP */}
            {activeSection === 'sop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  6. Standard Operating Procedure (SOP)
                </h3>
                <p>
                  Standardized 5-step operational protocol for Disaster Management Authorities:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>1</span>
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong>Monitor Telemetry:</strong> Watch live NASA GPM rainfall rate and River Stage hydrographs.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>2</span>
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong>Inspect Village &amp; Bridge Matrix:</strong> Check for any <code>EVACUATE NOW</code> or <code>DECK SUBMERGED</code> alerts.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>3</span>
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong>Run What-If Simulations:</strong> Use Port 5174 to model anticipated cloudburst intensity.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>4</span>
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong>Authorize CAP Broadcast:</strong> Dispatch official XML alerts to the national disaster portal.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>5</span>
                    <div style={{ fontSize: '0.75rem' }}>
                      <strong>Sound Local Sirens &amp; Deploy BRO:</strong> Trigger offline LoRa sirens and mobilize BRO 70 RCC road clearance teams.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#0d1527', fontSize: '0.72rem', color: '#94a3b8'
        }}>
          <div>GeoResilience AI v1.0 &bull; Disaster Early Warning System &bull; Beas Valley Pilot</div>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '5px 14px', fontSize: '0.75rem' }}
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
