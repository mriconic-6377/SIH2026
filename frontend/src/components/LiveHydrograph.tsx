import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import type { SensorStation } from '../types';

interface LiveHydrographProps {
  sensors: SensorStation[];
}

export const LiveHydrograph: React.FC<LiveHydrographProps> = ({ sensors }) => {
  const [history, setHistory] = useState<{ time: string; kullu: number; aut: number; pandoh: number }[]>([]);

  // Collect water level time points as telemetry arrives
  useEffect(() => {
    const kulluSensor = sensors.find((s) => s.sensor_id === 'SN-KULLU-001');
    const autSensor = sensors.find((s) => s.sensor_id === 'SN-AUT-004');
    const pandohSensor = sensors.find((s) => s.sensor_id === 'SN-PANDOH-005');

    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newPoint = {
      time: timeLabel,
      kullu: kulluSensor?.latest?.water_level_m || 1.8,
      aut: autSensor?.latest?.water_level_m || 2.2,
      pandoh: pandohSensor?.latest?.water_level_m || 2.8,
    };

    setHistory((prev) => [...prev.slice(-15), newPoint]);
  }, [sensors]);

  const maxVal = Math.max(6.0, ...history.map((h) => Math.max(h.kullu, h.aut, h.pandoh)));

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live River Stage Hydrograph</h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          Real-Time Wave Tracking
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#9ca3af' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
          Kullu (Upstream)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7' }} />
          Aut (Gorge Midpoint)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          Pandoh (Downstream Dam)
        </span>
      </div>

      {/* SVG Multi-Line Chart */}
      <div style={{ height: '140px', width: '100%', position: 'relative', marginTop: '4px' }}>
        {history.length > 1 ? (
          <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid Lines */}
            <line x1="0" y1="10" x2="400" y2="10" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
            <line x1="0" y1="110" x2="400" y2="110" stroke="rgba(255,255,255,0.1)" />

            {/* High Flood Warning Level Line (4.5m) */}
            <line
              x1="0"
              y1={110 - (4.5 / maxVal) * 100}
              x2="400"
              y2={110 - (4.5 / maxVal) * 100}
              stroke="#ef4444"
              strokeDasharray="4,4"
              strokeWidth="1"
            />
            <text x="340" y={105 - (4.5 / maxVal) * 100} fill="#ef4444" fontSize="8" fontWeight="600">
              Danger Level (4.5m)
            </text>

            {/* Kullu Line */}
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={history
                .map((h, i) => `${(i / (history.length - 1)) * 400},${110 - (h.kullu / maxVal) * 100}`)
                .join(' ')}
            />

            {/* Aut Line */}
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={history
                .map((h, i) => `${(i / (history.length - 1)) * 400},${110 - (h.aut / maxVal) * 100}`)
                .join(' ')}
            />

            {/* Pandoh Line */}
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={history
                .map((h, i) => `${(i / (history.length - 1)) * 400},${110 - (h.pandoh / maxVal) * 100}`)
                .join(' ')}
            />
          </svg>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
            Streaming hydrograph data points...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280' }}>
        <span>Rolling time window (last 60s)</span>
        <span>Peak stage: {maxVal.toFixed(1)}m</span>
      </div>
    </div>
  );
};
