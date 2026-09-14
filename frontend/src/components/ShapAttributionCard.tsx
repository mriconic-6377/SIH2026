import React from 'react';
import type { ExplainabilityResult } from '../types';
import { Sparkles } from 'lucide-react';

interface ShapAttributionCardProps {
  explainability: ExplainabilityResult | null;
}

export const ShapAttributionCard: React.FC<ShapAttributionCardProps> = ({ explainability }) => {
  if (!explainability) return null;

  const getBarColor = (featureName: string) => {
    if (featureName === explainability.top_driver) return 'var(--accent-cyan)';
    if (featureName.includes('Rainfall') || featureName.includes('Surge')) return 'var(--accent-blue)';
    if (featureName.includes('Soil') || featureName.includes('Pore')) return 'var(--accent-purple)';
    return 'var(--accent-amber)';
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#a855f7" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Explainable AI (SHAP Attribution)</h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          Transparent AI
        </span>
      </div>

      {/* Top Driver Highlight */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Primary Disaster Trigger:</span>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#06b6d4', marginTop: '2px' }}>
          {explainability.top_driver} ({explainability.feature_contributions[explainability.top_driver]}% Impact)
        </div>
      </div>

      {/* Feature Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(explainability.feature_contributions).map(([feature, pct]) => (
          <div key={feature}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span style={{ color: feature === explainability.top_driver ? '#f3f4f6' : '#9ca3af', fontWeight: feature === explainability.top_driver ? 600 : 400 }}>
                {feature}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: getBarColor(feature) }}>
                {pct.toFixed(1)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: getBarColor(feature),
                borderRadius: '3px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Interpretation */}
      <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
        &bull; Derived via physics-weighted Shapley value attribution for SDMA audit compliance.
      </p>
    </div>
  );
};
