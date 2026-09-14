import React, { useState, useEffect } from 'react';
import { Truck, Navigation, Wrench, AlertTriangle } from 'lucide-react';

interface BroLogisticsPanelProps {
  threatLevel: string;
  rainfall: number;
  upstreamDepth: number;
}

export const BroLogisticsPanel: React.FC<BroLogisticsPanelProps> = ({
  threatLevel,
  rainfall,
  upstreamDepth,
}) => {
  const [logisticsData, setLogisticsData] = useState<any>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(
          `/api/v1/logistics/bro-plan?threat_level=${threatLevel}&rainfall_rate_mm_hr=${rainfall}&upstream_water_depth_m=${upstreamDepth}`
        );
        if (res.ok) {
          const data = await res.json();
          setLogisticsData(data);
        }
      } catch (e) {
        console.error('Failed to fetch BRO plan', e);
      }
    }
    fetchPlan();
  }, [threatLevel, rainfall, upstreamDepth]);

  if (!logisticsData) return null;

  const isCritical = logisticsData.active_corridor_status === 'CRITICAL_BLOCKAGE';

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>BRO Lifeline & Supply Chain Resilience</h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: isCritical ? '#f87171' : '#34d399', background: isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
          {logisticsData.active_corridor_status}
        </span>
      </div>

      {/* Network Vulnerability Index Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
          <span style={{ color: '#9ca3af' }}>Highway Network Vulnerability Index</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isCritical ? '#ef4444' : '#f59e0b' }}>
            {(logisticsData.network_vulnerability_index * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${logisticsData.network_vulnerability_index * 100}%`,
            height: '100%',
            background: isCritical ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #f59e0b)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Choke Points Alert if Any */}
      {logisticsData.critical_choke_points.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '8px 12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} /> Critical Highway Choke Points:
          </div>
          <ul style={{ margin: '4px 0 0 18px', fontSize: '0.72rem', color: '#d1d5db' }}>
            {logisticsData.critical_choke_points.map((cp: string, i: number) => (
              <li key={i}>{cp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pre-Positioned Machinery Orders */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Wrench size={14} color="#f59e0b" /> Pre-Positioned Heavy Machinery (JCB/Dozer Orders):
        </div>

        {logisticsData.equipment_staging_orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {logisticsData.equipment_staging_orders.map((order: any, idx: number) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.72rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#f9fafb' }}>
                  <span>{order.equipment_type} ({order.available_units} Units)</span>
                  <span style={{ color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>ETA: {order.deployment_eta_mins}m</span>
                </div>
                <div style={{ color: '#9ca3af', marginTop: '2px' }}>
                  Staging: <strong style={{ color: '#d1d5db' }}>{order.recommended_staging_node}</strong> &bull; Target: {order.target_choke_point}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.72rem', color: '#6b7280', padding: '4px' }}>
            &bull; All machinery on standard depot standby. No emergency deployment required.
          </div>
        )}
      </div>

      {/* Emergency Bypass Reroute Plan */}
      {logisticsData.convoy_reroute_plans.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Navigation size={14} color="#06b6d4" /> Relief & Medical Convoy Reroute Plan:
          </div>

          {logisticsData.convoy_reroute_plans.map((plan: any, idx: number) => (
            <div
              key={idx}
              style={{
                background: plan.is_primary_blocked ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${plan.is_primary_blocked ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.72rem',
              }}
            >
              <div style={{ fontWeight: 600, color: plan.is_primary_blocked ? '#fbbf24' : '#34d399' }}>
                {plan.origin} &rarr; {plan.destination}
              </div>
              <div style={{ color: '#d1d5db', marginTop: '2px' }}>
                <strong>Bypass:</strong> {plan.recommended_bypass}
              </div>
              {plan.additional_time_mins > 0 && (
                <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '1px' }}>
                  Extra: +{plan.additional_distance_km} km (+{plan.additional_time_mins} mins) &bull; {plan.clearance_status}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
