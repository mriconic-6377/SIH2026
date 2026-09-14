import React, { useState, useEffect } from 'react';
import { Mountain } from 'lucide-react';

export const DemElevationProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<any[]>([]);
  const [demCatalog, setDemCatalog] = useState<any>(null);

  useEffect(() => {
    async function loadElevationProfile() {
      try {
        const res = await fetch('/api/v1/gis/dem/elevation-profile');
        if (res.ok) {
          const data = await res.json();
          setProfileData(data.profile || []);
        }

        const catRes = await fetch('/api/v1/gis/dem/catalog');
        if (catRes.ok) {
          const cat = await catRes.json();
          setDemCatalog(cat);
        }
      } catch (e) {
        console.error('Failed to load DEM elevation profile', e);
      }
    }
    loadElevationProfile();
  }, []);

  if (profileData.length === 0) return null;

  const maxElev = 2200;
  const minElev = 600;
  const elevRange = maxElev - minElev;

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mountain size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>ISRO Cartosat-1 DEM (30m) Elevation Transect</h3>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          {demCatalog?.total_tiles_loaded || 4} GeoTIFF Tiles Ingested
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
        Real-time sampled terrain profile along 62 km Beas River gorge channel (Kullu 1,458m &rarr; Mandi 718m).
      </p>

      {/* SVG Elevation Profile Chart */}
      <div style={{ height: '140px', width: '100%', position: 'relative', marginTop: '4px' }}>
        <svg viewBox="0 0 500 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Grid lines */}
          <line x1="0" y1="15" x2="500" y2="15" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
          <line x1="0" y1="65" x2="500" y2="65" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
          <line x1="0" y1="115" x2="500" y2="115" stroke="rgba(255,255,255,0.1)" />

          {/* Elevation Area Fill */}
          <polygon
            points={`0,115 ${profileData
              .map((p, i) => {
                const x = (i / (profileData.length - 1)) * 500;
                const y = 115 - ((p.elevation_dem_m - minElev) / elevRange) * 100;
                return `${x},${y}`;
              })
              .join(' ')} 500,115`}
            fill="url(#terrainGradient)"
            opacity="0.35"
          />

          <defs>
            <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Terrain Line */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={profileData
              .map((p, i) => {
                const x = (i / (profileData.length - 1)) * 500;
                const y = 115 - ((p.elevation_dem_m - minElev) / elevRange) * 100;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Checkpoint Dots & Labels */}
          {profileData.map((p, i) => {
            const x = (i / (profileData.length - 1)) * 500;
            const y = 115 - ((p.elevation_dem_m - minElev) / elevRange) * 100;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={p.slope_deg > 30 ? '4' : '3'} fill={p.slope_deg > 30 ? '#ef4444' : '#06b6d4'} stroke="#ffffff" strokeWidth="1" />
                {i === 0 || i === 5 || i === profileData.length - 1 ? (
                  <text x={x} y={y - 8} fill="#f3f4f6" fontSize="7.5" fontWeight="600" textAnchor={i === 0 ? 'start' : i === profileData.length - 1 ? 'end' : 'middle'}>
                    {p.checkpoint} ({p.elevation_dem_m}m)
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280' }}>
        <span>Chainage: 0 km (Kullu) &rarr; 62 km (Mandi)</span>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>Red Dots: Steep Slopes (&gt;30°)</span>
      </div>
    </div>
  );
};
