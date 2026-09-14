import React from 'react';
import type { LeadTimeReport } from '../types';
import { Timer } from 'lucide-react';

interface LeadTimePanelProps {
  leadTimeReport: LeadTimeReport | null;
}

export const LeadTimePanel: React.FC<LeadTimePanelProps> = ({ leadTimeReport }) => {
  if (!leadTimeReport) return null;

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'INSUFFICIENT':
        return <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>CRITICAL (&lt;10m)</span>;
      case 'TIGHT':
        return <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>TIGHT (&lt;30m)</span>;
      default:
        return <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>ADEQUATE (&gt;30m)</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header with Hydraulic Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Dynamic Evacuation Lead-Time (T_lead)</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: '#9ca3af' }}>
          <span>Surge Speed: <strong style={{ color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>{leadTimeReport.surge_wave_speed_m_s} m/s</strong></span>
          <span>Discharge Q: <strong style={{ color: '#3b82f6', fontFamily: 'var(--font-mono)' }}>{leadTimeReport.discharge_m3_s} m³/s</strong></span>
        </div>
      </div>

      {/* Per-Habitation Table / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
        {leadTimeReport.habitations.map((hab) => {
          const isUrgent = hab.urgency === 'INSUFFICIENT';
          const isTight = hab.urgency === 'TIGHT';

          return (
            <div
              key={hab.habitation_name}
              style={{
                background: isUrgent ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f9fafb' }}>{hab.habitation_name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>({hab.distance_km} km downstream)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                  Travel Time: {hab.raw_travel_time_mins} mins &bull; Proc. Delay: {hab.processing_delay_mins} mins
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: isUrgent ? '#ef4444' : isTight ? '#f59e0b' : '#10b981'
                }}>
                  {hab.net_lead_time_mins > 0 ? `${hab.net_lead_time_mins.toFixed(1)} mins` : 'SURGE IMMINENT'}
                </span>
                {getUrgencyBadge(hab.urgency)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
