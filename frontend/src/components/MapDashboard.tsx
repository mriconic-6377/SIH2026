import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { SensorStation, Habitation, Bridge, Shelter } from '../types';
import { Layers } from 'lucide-react';

interface MapDashboardProps {
  sensors: SensorStation[];
  habitations: Habitation[];
  bridges: Bridge[];
  shelters: Shelter[];
  threatLevel: string;
  waterDepth: number;
  rainfall?: number;
}

// Custom Leaflet Icons (using clean SVG HTML DivIcons)
const createIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background: ${color};
        width: 28px; height: 28px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${color};
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 800; font-size: 11px;
      ">${symbol}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const sensorRiverIcon = createIcon('#3b82f6', '🌊');
const sensorSoilIcon = createIcon('#a855f7', '🌱');
const habitationIcon = createIcon('#f97316', '🏘️');
const habitationCriticalIcon = createIcon('#ef4444', '🚨');
const bridgeIcon = createIcon('#eab308', '🌉');
const bridgeSubmergedIcon = createIcon('#ef4444', '⛔');
const shelterIcon = createIcon('#10b981', '🛡️');

export const MapDashboard: React.FC<MapDashboardProps> = ({
  sensors,
  habitations,
  bridges,
  shelters,
  threatLevel,
  waterDepth,
  rainfall,
}) => {
  const [showSensors, setShowSensors] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showInundation, setShowInundation] = useState(true);
  const [showNasaGpm, setShowNasaGpm] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [nasaGpmData, setNasaGpmData] = useState<any>(null);

  useEffect(() => {
    async function loadGpm() {
      try {
        const mult = waterDepth > 4.0 ? 3.5 : waterDepth > 2.5 ? 1.8 : 1.0;
        const res = await fetch(`/api/v1/satellite/gpm-rainfall?intensity_multiplier=${mult}`);
        if (res.ok) {
          const data = await res.json();
          setNasaGpmData(data);
        }
      } catch (e) {
        console.error('Failed to load NASA GPM satellite layer', e);
      }
    }
    loadGpm();
  }, [waterDepth]);

  const [basemap, setBasemap] = useState<'topo' | 'satellite' | 'dark' | 'osm'>('topo');

  const basemapUrls = {
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  };

  // Beas River valley center (Mandi-Kullu stretch)
  const centerLat = 31.7820;
  const centerLon = 77.1500;

  // Dynamic Road and Inundation Critical Threshold:
  // Active whenever threatLevel is HIGH / CRITICAL, or waterDepth > 3.0m, or rainfall > 25mm/hr
  const isCritical =
    threatLevel === 'CRITICAL' ||
    threatLevel === 'HIGH' ||
    waterDepth > 3.0 ||
    (rainfall !== undefined && rainfall > 25);

  return (
    <div className="glass-panel" style={{ position: 'relative', height: '100%', minHeight: '520px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Map Layer Controls Toolbar */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        background: 'rgba(13, 18, 31, 0.92)', backdropFilter: 'blur(10px)',
        padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem'
      }}>
        {/* Basemap Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontWeight: 700, color: '#9ca3af' }}>Map:</span>
          <select
            value={basemap}
            onChange={(e) => setBasemap(e.target.value as any)}
            style={{
              background: 'rgba(30, 41, 59, 0.9)', color: '#f3f4f6',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
              padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer'
            }}
          >
            <option value="topo">⛰️ Esri Himalayan Topo</option>
            <option value="satellite">🛰️ Esri Satellite Imagery</option>
            <option value="dark">🌑 Dark Matter</option>
            <option value="osm">🗺️ OpenStreetMap</option>
          </select>
        </div>

        <span style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.2)' }} />

        <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af' }}>
          <Layers size={14} /> Layers:
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#38bdf8' }}>
          <input type="checkbox" checked={showSensors} onChange={(e) => setShowSensors(e.target.checked)} />
          Sensors (8)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#fb923c' }}>
          <input type="checkbox" checked={showHabitations} onChange={(e) => setShowHabitations(e.target.checked)} />
          Villages (6)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#facc15' }}>
          <input type="checkbox" checked={showBridges} onChange={(e) => setShowBridges(e.target.checked)} />
          Bridges (4)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#34d399' }}>
          <input type="checkbox" checked={showShelters} onChange={(e) => setShowShelters(e.target.checked)} />
          Shelters (4)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#f87171' }}>
          <input type="checkbox" checked={showInundation} onChange={(e) => setShowInundation(e.target.checked)} />
          Flood Zone
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#4ade80', fontWeight: 600 }}>
          <input type="checkbox" checked={showRoads} onChange={(e) => setShowRoads(e.target.checked)} />
          🛣️ Highways (BRO)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#c084fc', fontWeight: 600 }}>
          <input type="checkbox" checked={showNasaGpm} onChange={(e) => setShowNasaGpm(e.target.checked)} />
          🛰️ NASA GPM 0.1°
        </label>
      </div>

      {/* Map View */}
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={11}
        style={{ width: '100%', height: '100%', minHeight: '520px' }}
        scrollWheelZoom={true}
      >
        {/* Active Free Basemap (No API key needed) */}
        <TileLayer
          key={basemap}
          attribution={basemapUrls[basemap].attribution}
          url={basemapUrls[basemap].url}
        />

        {/* NASA GPM IMERG 0.1° Satellite Rainfall Grid Layer */}
        {showNasaGpm &&
          nasaGpmData?.grid_geojson?.features?.map((f: any) => {
            const coords = f.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);
            const props = f.properties;
            return (
              <Polygon
                key={props.cell_id}
                positions={coords}
                pathOptions={{
                  color: props.color,
                  fillColor: props.color,
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '4,4',
                }}
              >
                <Popup>
                  <div>
                    <div style={{ fontWeight: 800, color: '#c084fc' }}>🛰️ {props.cell_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Sensor: {props.satellite_sensor}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Resolution: {props.spatial_resolution}</div>
                    <div style={{ marginTop: '4px', fontSize: '0.85rem', fontWeight: 700, color: props.color }}>
                      Satellite Rain: {props.rainfall_rate_mm_hr} mm/hr ({props.precipitation_class})
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Dynamic Flood Inundation Buffer along Beas River */}
        {showInundation && (
          <>
            <Circle
              center={[31.7820, 77.2150]} // Aut Tunnel bottleneck
              radius={isCritical ? 3200 : 1200}
              pathOptions={{
                color: isCritical ? '#ef4444' : '#0284c7',
                fillColor: isCritical ? '#ef4444' : '#0284c7',
                fillOpacity: isCritical ? 0.35 : 0.20,
                weight: 2,
              }}
            />
            <Circle
              center={[31.6690, 77.0550]} // Pandoh Dam buffer
              radius={isCritical ? 4000 : 1800}
              pathOptions={{
                color: isCritical ? '#ef4444' : '#0284c7',
                fillColor: isCritical ? '#ef4444' : '#0284c7',
                fillOpacity: isCritical ? 0.30 : 0.15,
                weight: 2,
              }}
            />
          </>
        )}

        {/* ========================================================================= */}
        {/* DYNAMIC ROAD NETWORK: GREEN (SAFE/OPEN) vs RED (DAMAGED/SUBMERGED)        */}
        {/* ========================================================================= */}
        {showRoads && (
          <>
            {/* 1. PRIMARY NH-21 BEAS CANYON HIGHWAY (Mandi -> Pandoh -> Thalot -> Aut -> Larji -> Bhuntar) */}
            <Polyline
              positions={[
                [31.7080, 76.9320], // Mandi Town
                [31.6850, 76.9950], // Bhiuli
                [31.6690, 77.0550], // Pandoh Dam (Flood Zone)
                [31.7250, 77.1400], // Thalot (Critical Inundation)
                [31.7450, 77.2050], // Aut Valley
                [31.7820, 77.2150], // Aut Gorge & Tunnel (Scour & Debris Zone)
                [31.8350, 77.1850], // Takoli
                [31.8850, 77.1550], // Bhuntar Confluence
                [31.9580, 77.1025], // Kullu North
              ]}
              pathOptions={{
                color: isCritical ? '#ef4444' : '#22c55e',
                weight: isCritical ? 5 : 3.5,
                dashArray: isCritical ? '6, 6' : undefined,
                opacity: isCritical ? 0.95 : 0.85,
              }}
            >
              <Popup>
                <div style={{ minWidth: '220px', padding: '4px' }}>
                  <div style={{
                    fontWeight: 800, fontSize: '0.88rem',
                    color: isCritical ? '#ef4444' : '#22c55e',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span>{isCritical ? '🔴 NH-21 CANYON HIGHWAY: CLOSED / DAMAGED' : '🟢 NH-21 MAIN HIGHWAY: OPEN'}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '3px' }}>
                    Primary Corridor: Mandi &bull; Pandoh &bull; Thalot &bull; Aut Gorge &bull; Bhuntar
                  </div>
                  <div style={{
                    marginTop: '6px', padding: '4px 8px', borderRadius: '4px',
                    background: isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)',
                    fontSize: '0.74rem', fontWeight: 700,
                    color: isCritical ? '#fca5a5' : '#86efac', border: `1px solid ${isCritical ? '#ef4444' : '#22c55e'}`
                  }}>
                    {isCritical
                      ? '⚠️ Water depth > 5m + Landslide Scour. Traffic stopped at Pandoh & Aut boom barriers.'
                      : '✅ All spans open. Normal vehicular traffic flowing.'}
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* 2. BRO EMERGENCY LIFELINE BYPASS ROUTE 2A (Mandi -> Kataula -> Prashar Ridge -> Bajaura -> Kullu) */}
            <Polyline
              positions={[
                [31.7080, 76.9320], // Mandi Town
                [31.7650, 77.0120], // Kataula High Valley (Elev: 1200m)
                [31.8150, 77.0850], // Prashar Ridge Pass (Elev: 1850m)
                [31.8450, 77.1450], // Bajaura Junction
                [31.8850, 77.1550], // Bhuntar Airport
                [31.9580, 77.1025], // Kullu Town
              ]}
              pathOptions={{
                color: '#22c55e',
                weight: isCritical ? 5 : 2.5,
                dashArray: isCritical ? '8, 8' : '4, 4',
                opacity: isCritical ? 1.0 : 0.6,
              }}
            >
              <Popup>
                <div style={{ minWidth: '220px', padding: '4px' }}>
                  <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.88rem' }}>
                    🛣️ BRO Lifeline Bypass Route 2A (Ridge Highway)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Mandi &rarr; Kataula &rarr; Prashar Ridge &rarr; Bajaura &rarr; Kullu
                  </div>
                  <div style={{
                    marginTop: '6px', padding: '4px 8px', borderRadius: '4px',
                    background: 'rgba(34,197,94,0.2)', color: '#86efac',
                    border: '1px solid #22c55e', fontSize: '0.74rem', fontWeight: 700
                  }}>
                    {isCritical
                      ? '🟢 ACTIVE EMERGENCY BYPASS: Allocated exclusively for Ambulances & BRO JCBs.'
                      : '🟢 STANDBY BACKUP ROUTE: Elevated ridge path ready for emergency diversion.'}
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* 3. SAFE SHELTER EVACUATION FEEDER ARTERIES (Green Safe Corridors) */}
            {/* Feeder to Aut Govt High School (Elev: 920m) */}
            <Polyline
              positions={[[31.7450, 77.2050], [31.7580, 77.2180]]}
              pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9 }}
            >
              <Popup>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                  🟢 Safe Evacuation Artery: Aut &rarr; High School Shelter (Elev: 920m)
                </div>
              </Popup>
            </Polyline>

            {/* Feeder to Bhuntar Airport Staging Hub (Elev: 1110m) */}
            <Polyline
              positions={[[31.8850, 77.1550], [31.8740, 77.1680]]}
              pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9 }}
            >
              <Popup>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                  🟢 Safe Evacuation Artery: Bhuntar &rarr; Airport Staging Hub (Elev: 1110m)
                </div>
              </Popup>
            </Polyline>
          </>
        )}

        {/* Sensor Markers */}
        {showSensors &&
          sensors.map((sensor) => (
            <Marker
              key={sensor.sensor_id}
              position={[sensor.lat, sensor.lon]}
              icon={sensor.type === 'RIVER_STAGE' ? sensorRiverIcon : sensorSoilIcon}
            >
              <Popup>
                <div style={{ minWidth: '180px', padding: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f3f4f6' }}>{sensor.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '8px' }}>
                    ID: {sensor.sensor_id} &bull; Elev: {sensor.elevation}m
                  </div>

                  {sensor.latest ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px' }}>
                      {sensor.latest.water_level_m !== null && (
                        <div>Water: <strong style={{ color: '#38bdf8' }}>{sensor.latest.water_level_m}m</strong></div>
                      )}
                      {sensor.latest.soil_moisture_pct !== null && (
                        <div>Soil: <strong style={{ color: '#c084fc' }}>{sensor.latest.soil_moisture_pct}%</strong></div>
                      )}
                      {sensor.latest.rainfall_mm_hr !== null && (
                        <div>Rain: <strong style={{ color: '#38bdf8' }}>{sensor.latest.rainfall_mm_hr} mm/h</strong></div>
                      )}
                      {sensor.latest.battery_v !== null && (
                        <div>Batt: <strong style={{ color: '#4ade80' }}>{sensor.latest.battery_v}V</strong></div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Awaiting telemetry...</span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Habitation Markers */}
        {showHabitations &&
          habitations.map((hab) => (
            <Marker
              key={hab.habitation_id}
              position={[hab.lat, hab.lon]}
              icon={isCritical ? habitationCriticalIcon : habitationIcon}
            >
              <Popup>
                <div style={{ minWidth: '170px' }}>
                  <div style={{ fontWeight: 800, color: '#f3f4f6' }}>{hab.name} Village</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Pop: {hab.population.toLocaleString()} persons</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Kutcha Houses: {(hab.kutcha_ratio * 100).toFixed(0)}%</div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                    &rarr; Shelter: {hab.nearest_shelter || 'Designated Green Zone'}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Critical Bridge Markers */}
        {showBridges &&
          bridges.map((bridge) => {
            const bridgeSubmerged = isCritical && (bridge.bridge_id === 'BR-AUT-03' || bridge.bridge_id === 'BR-LARJI-02');
            return (
              <Marker
                key={bridge.bridge_id}
                position={[bridge.lat, bridge.lon]}
                icon={bridgeSubmerged ? bridgeSubmergedIcon : bridgeIcon}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ fontWeight: 800, color: '#f3f4f6' }}>{bridge.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Highway: {bridge.highway} &bull; Span: {bridge.span}m</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Deck Elevation: {bridge.deck_elevation}m</div>
                    <div style={{
                      marginTop: '6px', fontSize: '0.75rem', fontWeight: 700,
                      color: bridgeSubmerged ? '#ef4444' : '#10b981'
                    }}>
                      Status: {bridgeSubmerged ? 'SUBMERGED (ROAD BLOCKED)' : 'OPEN FOR TRAFFIC'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Shelter Markers */}
        {showShelters &&
          shelters.map((shelter) => (
            <Marker
              key={shelter.shelter_id}
              position={[shelter.lat, shelter.lon]}
              icon={shelterIcon}
            >
              <Popup>
                <div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>{shelter.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Safe Capacity: {shelter.capacity} evacuees</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Elev: {shelter.elevation}m (Above High Flood Level)</div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Floating Highway Status Indicator Legend */}
      {showRoads && (
        <div style={{
          position: 'absolute', bottom: 12, right: 12, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(10px)',
          padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
          fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '5px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 800, color: '#cbd5e1', fontSize: '0.74rem' }}>
            🛣️ Lifeline Road Conditions:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '18px', height: '4px', background: isCritical ? '#ef4444' : '#22c55e',
              borderRadius: '2px', display: 'inline-block'
            }} />
            <span>NH-21 Beas Valley: <strong style={{ color: isCritical ? '#ef4444' : '#22c55e' }}>{isCritical ? '🔴 CLOSED / SUBMERGED' : '🟢 OPEN'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '18px', height: '4px', background: '#22c55e',
              borderRadius: '2px', display: 'inline-block',
              border: isCritical ? '1px dashed #ffffff' : 'none'
            }} />
            <span>BRO Route 2A (Ridge): <strong style={{ color: '#22c55e' }}>{isCritical ? '🟢 ACTIVE BYPASS' : '🟢 OPEN (STANDBY)'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
