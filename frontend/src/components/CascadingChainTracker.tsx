import React from 'react';
import { Mountain, Layers, Zap, Waves, Activity } from 'lucide-react';
import type { SlopeStabilityResult } from '../types';

interface CascadingChainTrackerProps {
  slopeStability?: SlopeStabilityResult | null;
  threatLevel: string;
  rainfallRate: number;
  waterDepth: number;
}

export const CascadingChainTracker: React.FC<CascadingChainTrackerProps> = ({
  slopeStability,
  threatLevel,
  rainfallRate,
  waterDepth
}) => {
  const isCritical = threatLevel === 'CRITICAL' || waterDepth > 5.0 || rainfallRate > 60;
  const isWarning = threatLevel === 'WARNING' || waterDepth > 3.5 || rainfallRate > 30;

  // Step 1: Mountain Trigger Status (Mohr-Coulomb Fs & InSAR Creep)
  const fs = slopeStability?.factor_of_safety ?? 1.85;
  const isStep1Active = fs < 1.3 || rainfallRate > 25;
  const isStep1Critical = fs < 1.0;

  // Step 2: Debris Flow Mix Status (Slurry Damming Risk)
  const debrisRisk = isCritical ? 88 : isWarning ? 62 : 18;
  const isStep2Active = isStep1Active || rainfallRate > 40;

  // Step 3: Canyon Surge Acceleration (Wave Speed c = √(gy) + v)
  const waveSpeed = Math.sqrt(9.81 * Math.max(1.5, waterDepth)) + (waterDepth > 3 ? 3.8 : 1.4);
  const isStep3Active = waterDepth > 3.0 || isCritical;

  // Step 4: Valley Inundation & Bridge Scour
  const isStep4Active = isCritical || waterDepth > 4.5;

  return (
    <div className="glass-panel" style={{
      marginBottom: '16px', padding: '14px 18px',
      background: isCritical
        ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.4) 0%, rgba(17, 24, 39, 0.95) 100%)'
        : 'rgba(17, 24, 39, 0.85)',
      border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
      boxShadow: isCritical ? '0 0 25px rgba(239, 68, 68, 0.2)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: isCritical ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={16} color={isCritical ? '#ef4444' : '#38bdf8'} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Multi-Hazard Cascading Domino Engine</span>
              <span style={{
                fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px',
                background: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                color: '#ffffff', fontWeight: 700
              }}>
                {isCritical ? 'CHAIN REACTION ACTIVE' : isWarning ? 'CASCADE ALERT' : 'EQUILIBRIUM'}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Sequential Chain: Mountain InSAR Creep ➔ Debris Mix ➔ Canyon Wave Acceleration ➔ Bridge Inundation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
          <span>Current Hydro Celerity:</span>
          <strong style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.82rem' }}>
            {waveSpeed.toFixed(1)} m/s ({(waveSpeed * 3.6).toFixed(0)} km/h)
          </strong>
        </div>
      </div>

      {/* 4-Step Interactive Domino Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '10px',
        position: 'relative'
      }}>
        {/* ================= STEP 1 ================= */}
        <div style={{
          background: isStep1Critical ? 'rgba(239, 68, 68, 0.15)' : isStep1Active ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isStep1Critical ? '#ef4444' : isStep1Active ? '#f59e0b' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
              <Mountain size={14} color={isStep1Critical ? '#ef4444' : '#38bdf8'} />
              <span>STEP 1: MOUNTAIN TRIGGER</span>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isStep1Critical ? '#ef4444' : isStep1Active ? '#f59e0b' : '#34d399' }}>
              {isStep1Critical ? 'SLOPE FAILURE' : isStep1Active ? 'MICRO-CREEP' : 'STABLE'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            InSAR Aut Gorge Creep
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Slope Fs: <strong style={{ color: isStep1Critical ? '#ef4444' : '#38bdf8' }}>{fs.toFixed(2)}</strong></span>
            <span>Rate: <strong>{isStep1Critical ? '-12.4mm/wk' : '-3.8mm/wk'}</strong></span>
          </div>
        </div>

        {/* ================= STEP 2 ================= */}
        <div style={{
          background: isCritical ? 'rgba(239, 68, 68, 0.15)' : isStep2Active ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isCritical ? '#ef4444' : isStep2Active ? '#f59e0b' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
              <Layers size={14} color={isCritical ? '#ef4444' : '#f59e0b'} />
              <span>STEP 2: DEBRIS SLURRY</span>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isCritical ? '#ef4444' : '#f59e0b' }}>
              {isCritical ? 'DAMMING BREACH' : 'SLURRY FORMATION'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            Rock + Ice + Water + Mud Mix
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Damming Risk: <strong style={{ color: isCritical ? '#ef4444' : '#f59e0b' }}>{debrisRisk}%</strong></span>
            <span>Viscosity: <strong>{isCritical ? 'High Slurry' : 'Normal'}</strong></span>
          </div>
        </div>

        {/* ================= STEP 3 ================= */}
        <div style={{
          background: isStep3Active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isStep3Active ? '#ef4444' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
              <Zap size={14} color={isStep3Active ? '#ef4444' : '#38bdf8'} />
              <span>STEP 3: GORGE SURGE</span>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isStep3Active ? '#ef4444' : '#34d399' }}>
              {isStep3Active ? 'VENTURI ACCELERATION' : 'STEADY FLOW'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            1D St. Venant Kinematic Wave
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Celerity: <strong style={{ color: isStep3Active ? '#ef4444' : '#38bdf8' }}>{waveSpeed.toFixed(1)} m/s</strong></span>
            <span>Gorge Bed: <strong>S0=0.012 m/m</strong></span>
          </div>
        </div>

        {/* ================= STEP 4 ================= */}
        <div style={{
          background: isStep4Active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${isStep4Active ? '#ef4444' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
              <Waves size={14} color={isStep4Active ? '#ef4444' : '#10b981'} />
              <span>STEP 4: VALLEY IMPACT</span>
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isStep4Active ? '#ef4444' : '#34d399' }}>
              {isStep4Active ? 'EVACUATE & SCOUR' : 'NORMAL ENVELOPE'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            6 Villages & 4 Bridges Impact
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Target: <strong style={{ color: isStep4Active ? '#ef4444' : '#38bdf8' }}>{isStep4Active ? 'Thalot / Larji' : 'Monitoring'}</strong></span>
            <span>Relief: <strong>4 Safe Hubs</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
