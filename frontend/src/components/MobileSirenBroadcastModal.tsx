import React, { useState, useEffect } from 'react';
import { X, Smartphone, AlertTriangle, Radio, Users, CheckCircle, ExternalLink } from 'lucide-react';

interface MobileSirenBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSirenBroadcastModal: React.FC<MobileSirenBroadcastModalProps> = ({ isOpen, onClose }) => {
  const [targetVillage, setTargetVillage] = useState<string>('ALL_VALLEY');
  const [severity, setSeverity] = useState<string>('CRITICAL_EVACUATION');
  const [title, setTitle] = useState<string>('🚨 FLASH FLOOD EMERGENCY — EVACUATE NOW');
  const [message, setMessage] = useState<string>(
    'Beas river surge wave crossing high danger mark. Evacuate immediately to designated high-elevation shelter.'
  );
  const [nearestShelter, setNearestShelter] = useState<string>('Designated Elevated Disaster Shelter');
  const [leadTimeMins, setLeadTimeMins] = useState<number>(18);
  const [statusData, setStatusData] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Preset disaster templates
  const presets = [
    {
      name: '🌧️ 2023 Cloudburst Surge',
      target: 'Bhuntar',
      severity: 'CRITICAL_EVACUATION',
      title: '🚨 CLOUDBURST FLASH FLOOD — BHUNTAR',
      message: 'Cloudburst detected upstream in Manikaran. Massive flood wave hitting Bhuntar in 15 mins. Move to Airport High Ground.',
      shelter: 'Bhuntar Airport Staging Area (1110m Elev)',
      lead: 15,
    },
    {
      name: '🌊 Ghepan Gath GLOF Breach',
      target: 'ALL_VALLEY',
      severity: 'CRITICAL_EVACUATION',
      title: '🚨 GLOF LAKE BREACH — ALL HABITATIONS',
      message: 'Ghepan Gath moraine dam overtopped. Glacial surge moving downstream. Evacuate all riverbank habitations immediately.',
      shelter: 'Nearest Tehsil Elevated Shelter Hub',
      lead: 35,
    },
    {
      name: '🏔️ Aut Gorge Landslide Risk',
      target: 'Aut',
      severity: 'HIGH_ALERT',
      title: '⚠️ IMPENDING ROCKFALL & LANDSLIDE — AUT',
      message: 'InSAR ground deformation spiking at -12mm/wk. Slopes unstable near Aut Tunnel approach. Evacuate roadside kutcha houses.',
      shelter: 'Aut Government High School (920m Elev)',
      lead: 25,
    },
  ];

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/alerts/mobile-siren/status');
      if (res.ok) {
        const json = await res.json();
        setStatusData(json);
      }
    } catch (e) {
      console.error('Failed to fetch mobile siren status', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/v1/alerts/mobile-siren/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_village: targetVillage,
          severity,
          title,
          message,
          nearest_shelter: nearestShelter,
          lead_time_mins: leadTimeMins,
        }),
      });
      if (res.ok) {
        fetchStatus();
      }
    } catch (e) {
      console.error('Broadcast failed', e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleCancel = async () => {
    try {
      await fetch('/api/v1/alerts/mobile-siren/cancel', { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error('Cancel failed', e);
    }
  };

  if (!isOpen) return null;

  const citizenAppUrl = `${window.location.origin}/#citizen-siren`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid #334155', borderRadius: '12px',
        width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
        color: '#f8fafc', padding: '20px', boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Zero-Touch Autonomous Mobile Citizen Siren
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, marginTop: '2px' }}>
                Wake-on-Disaster (WoD) High-Priority Emergency Broadcast Dispatcher
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Live Status Banner */}
        <div style={{
          margin: '14px 0', padding: '12px 16px', borderRadius: '8px',
          background: statusData?.is_active ? 'rgba(220,38,38,0.12)' : 'rgba(16,185,129,0.12)',
          border: `1px solid ${statusData?.is_active ? 'rgba(220,38,38,0.4)' : 'rgba(16,185,129,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusData?.is_active ? <AlertTriangle size={18} color="#ef4444" /> : <CheckCircle size={18} color="#34d399" />}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: statusData?.is_active ? '#f87171' : '#34d399' }}>
                {statusData?.is_active ? '🚨 EMERGENCY SIREN BROADCAST ACTIVE' : '🟢 STANDBY (READY TO DISPATCH)'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Target: <strong>{statusData?.target_village || 'None'}</strong> &bull; Alert ID: {statusData?.alert_id || 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#090d16', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} />
              <span>{statusData?.acknowledged_count || 0} Citizens Acknowledged</span>
            </div>
            {statusData?.is_active && (
              <button
                onClick={handleCancel}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                  background: '#334155', color: '#f8fafc', border: '1px solid #475569', cursor: 'pointer'
                }}
              >
                STAND DOWN SIREN
              </button>
            )}
          </div>
        </div>

        {/* Shareable Link Box for Judges/Mobile Testing */}
        <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>CITIZEN MOBILE APP LINK (OPEN ON ANY PHONE):</div>
            <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, marginTop: '2px', wordBreak: 'break-all' }}>
              {citizenAppUrl}
            </div>
          </div>
          <a
            href={citizenAppUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700,
              background: '#2563eb', color: '#ffffff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <ExternalLink size={12} />
            <span>Open PWA</span>
          </a>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '6px' }}>
            QUICK DISASTER TEMPLATES:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setTargetVillage(p.target);
                  setSeverity(p.severity);
                  setTitle(p.title);
                  setMessage(p.message);
                  setNearestShelter(p.shelter);
                  setLeadTimeMins(p.lead);
                }}
                style={{
                  background: '#1e293b', border: '1px solid #334155', borderRadius: '6px',
                  padding: '8px', color: '#f8fafc', fontSize: '0.72rem', fontWeight: 700,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dispatch Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>TARGET HABITATION:</label>
              <select
                value={targetVillage}
                onChange={(e) => setTargetVillage(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#090d16', color: '#f8fafc', border: '1px solid #334155', marginTop: '4px', fontSize: '0.78rem' }}
              >
                <option value="ALL_VALLEY">🚨 ALL 6 HABITATIONS (VALLEY-WIDE)</option>
                <option value="Bhuntar">Bhuntar (11.5 km)</option>
                <option value="Larji">Larji (23.5 km)</option>
                <option value="Aut">Aut (27.0 km)</option>
                <option value="Thalot">Thalot (36.0 km)</option>
                <option value="Pandoh">Pandoh (44.5 km)</option>
                <option value="Mandi">Mandi Town (62.0 km)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>LEAD TIME WINDOW (MINS):</label>
              <input
                type="number"
                value={leadTimeMins}
                onChange={(e) => setLeadTimeMins(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#090d16', color: '#f8fafc', border: '1px solid #334155', marginTop: '4px', fontSize: '0.78rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>ALERT HEADLINE:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#090d16', color: '#f8fafc', border: '1px solid #334155', marginTop: '4px', fontSize: '0.78rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>BROADCAST EMERGENCY DIRECTIVE (CITIZEN SCREEN MSG):</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#090d16', color: '#f8fafc', border: '1px solid #334155', marginTop: '4px', fontSize: '0.78rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>ASSIGNED HIGH-ELEVATION RELIEF SHELTER:</label>
            <input
              type="text"
              value={nearestShelter}
              onChange={(e) => setNearestShelter(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#090d16', color: '#f8fafc', border: '1px solid #334155', marginTop: '4px', fontSize: '0.78rem' }}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            style={{
              marginTop: '10px', width: '100%', padding: '14px', borderRadius: '8px',
              background: '#dc2626', color: '#ffffff', fontSize: '0.92rem', fontWeight: 900,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(220,38,38,0.4)'
            }}
          >
            <Radio size={18} />
            <span>{isBroadcasting ? 'DISPATCHING TO CITIZENS...' : 'BROADCAST EMERGENCY SIREN TO CITIZEN PHONES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
