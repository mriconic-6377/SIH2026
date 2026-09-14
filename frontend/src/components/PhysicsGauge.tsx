import React from 'react';
import type { SlopeStabilityResult } from '../types';
import { Mountain, AlertTriangle, Info } from 'lucide-react';

interface PhysicsGaugeProps {
  slopeResult: SlopeStabilityResult | null;
}

export const PhysicsGauge: React.FC<PhysicsGaugeProps> = ({ slopeResult }) => {
  if (!slopeResult) return null;

  const fs = slopeResult.factor_of_safety;
  const isCritical = fs < 1.0;
  const isWarning = fs >= 1.0 && fs < 1.3;

  // Percentage for the gauge bar (0.5 to 2.5 scale mapped to 0-100%)
  const gaugePercent = Math.min(Math.max(((fs - 0.5) / 2.0) * 100, 0), 100);

  const getGaugeColor = () => {
    if (isCritical) return '#ef4444';
    if (isWarning) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={`glass-panel ${isCritical ? 'glass-panel-glow-red' : ''}`} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mountain size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Mohr-Coulomb Slope Stability</h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
          Physics Engine
        </span>
      </div>

      {/* Main Factor of Safety Display */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '4px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Factor of Safety (F_s)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: getGaugeColor() }}>
              {fs.toFixed(2)}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getGaugeColor() }}>
              {isCritical ? 'CRITICAL (FAILURE)' : isWarning ? 'WARNING (UNSTABLE)' : 'STABLE'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9ca3af' }}>
          <div>Slope: <strong style={{ color: '#f3f4f6' }}>{slopeResult.slope_angle_deg}°</strong></div>
          <div>Saturation: <strong style={{ color: '#f3f4f6' }}>{(slopeResult.water_table_ratio * 100).toFixed(0)}%</strong></div>
        </div>
      </div>

      {/* Gauge Bar */}
      <div>
        <div style={{ position: 'relative', width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${gaugePercent}%`,
            background: isCritical
              ? 'linear-gradient(90deg, #dc2626, #ef4444)'
              : isWarning
              ? 'linear-gradient(90deg, #d97706, #f59e0b)'
              : 'linear-gradient(90deg, #059669, #10b981)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#6b7280', marginTop: '4px' }}>
          <span>F_s 0.5 (Failure)</span>
          <span style={{ color: '#ef4444', fontWeight: 700 }}>F_s 1.0 (Threshold)</span>
          <span>F_s 2.5 (Stable)</span>
        </div>
      </div>

      {/* Geotechnical Interpretation Card */}
      <div style={{
        background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
        padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', color: '#d1d5db',
        display: 'flex', alignItems: 'flex-start', gap: '8px'
      }}>
        {isCritical ? (
          <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
        ) : (
          <Info size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
        )}
        <span>{slopeResult.interpretation}</span>
      </div>
    </div>
  );
};
