import React, { useState, useEffect } from 'react';
import { ShieldAlert, Volume2, Radio, CloudSun, Link, Link2Off, BookOpen, Smartphone, Building } from 'lucide-react';

interface HeaderProps {
  threatLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isWsConnected: boolean;
  isManualConnected: boolean;
  onConnectManual: () => void;
  onDisconnectManual: () => void;
  onOpenSirenModal: () => void;
  onOpenCapModal: () => void;
  onOpenGuideModal: () => void;
  onOpenMobileSirenModal: () => void;
  onOpenRelocationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  threatLevel,
  isWsConnected,
  isManualConnected,
  onConnectManual,
  onDisconnectManual,
  onOpenSirenModal,
  onOpenCapModal,
  onOpenGuideModal,
  onOpenMobileSirenModal,
  onOpenRelocationModal,
}) => {
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch('/api/v1/weather/live');
        if (res.ok) {
          const data = await res.json();
          setWeatherData(data);
        }
      } catch (e) {}
    }
    loadWeather();
    const timer = setInterval(loadWeather, 60000);
    return () => clearInterval(timer);
  }, []);

  const getThreatBadge = () => {
    switch (threatLevel) {
      case 'CRITICAL':
        return <span className="badge badge-critical">CRITICAL SURGE DETECTED</span>;
      case 'HIGH':
        return <span className="badge badge-high">HIGH RISK ALERT</span>;
      case 'MODERATE':
        return <span className="badge badge-moderate">MODERATE MONITORING</span>;
      default:
        return <span className="badge badge-low">SYSTEM NORMAL</span>;
    }
  };

  const mandiWeather = weatherData?.stations?.find((s: any) => s.city === 'Mandi');
  const kulluWeather = weatherData?.stations?.find((s: any) => s.city === 'Kullu');

  return (
    <header className="glass-panel" style={{
      padding: '12px 20px',
      margin: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      background: '#0d1527',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Left: Official Command Logo & Region */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '6px',
          background: '#1d4ed8',
          border: '1px solid #3b82f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          <ShieldAlert size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              GeoResilience AI
            </h1>
            <span style={{
              fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px',
              background: '#1e293b', color: '#94a3b8', border: '1px solid #334155',
              fontWeight: 600, textTransform: 'uppercase'
            }}>
              National Early Warning Suite
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1px' }}>
            Beas River Basin (Mandi-Kullu, HP) &bull; Hydro-Geotechnical Early Warning Platform
          </p>
        </div>
      </div>

      {/* Middle: Professional Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {mandiWeather && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#1e293b', border: '1px solid #334155',
            padding: '5px 10px', borderRadius: '5px', fontSize: '0.72rem', color: '#e2e8f0'
          }}>
            <CloudSun size={14} color="#60a5fa" />
            <span>
              <strong>Mandi:</strong> {mandiWeather.temperature_c}°C ({mandiWeather.humidity_pct}% RH) &bull; <strong>Kullu:</strong> {kulluWeather?.temperature_c || 21.5}°C
            </span>
            <span style={{ fontSize: '0.62rem', color: '#64748b' }}>[IMD Telemetry]</span>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#1e293b', padding: '5px 10px', borderRadius: '5px',
          border: '1px solid #334155'
        }}>
          <div className={isWsConnected ? 'pulse-dot pulse-dot-green' : 'pulse-dot pulse-dot-red'} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isWsConnected ? '#34d399' : '#f87171' }}>
            {isWsConnected ? '8 IOT STATIONS ACTIVE' : 'CONNECTING...'}
          </span>
        </div>

        {getThreatBadge()}
      </div>

      {/* Right: Executive Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

        {/* Manual Scenario Mode Toggle */}
        <button
          onClick={isManualConnected ? onDisconnectManual : onConnectManual}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '5px', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s ease',
            background: isManualConnected ? '#2563eb' : '#1e293b',
            color: '#ffffff',
            border: isManualConnected ? '1px solid #60a5fa' : '1px solid #334155',
          }}
          title={isManualConnected
            ? 'Disconnect from Manual Control Panel — revert to real-time telemetry'
            : 'Connect to Manual Control Panel (Port 5174) — run model on custom scenario'
          }
        >
          {isManualConnected ? <Link2Off size={14} /> : <Link size={14} />}
          {isManualConnected ? 'Manual Active' : 'Connect Scenario'}
        </button>

        {/* Platform Guide & SOPs */}
        <button
          onClick={onOpenGuideModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 10px', borderRadius: '5px', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600,
            background: '#1e293b', border: '1px solid #334155',
            color: '#93c5fd', transition: 'all 0.15s ease',
          }}
          title="Open architecture manual, mathematical proofs, and NDRF operational SOPs"
        >
          <BookOpen size={14} />
          <span>Platform SOP</span>
        </button>

        {/* AI Permanent Relocation Decision Plan */}
        <button
          onClick={onOpenRelocationModal}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 10px', borderRadius: '5px', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 600,
            background: '#1e293b', border: '1px solid #0284c7',
            color: '#38bdf8', transition: 'all 0.15s ease',
          }}
          title="Open SDMA AI Permanent Habitation Relocation Suitability Matrix"
        >
          <Building size={14} />
          <span>Relocation Matrix</span>
        </button>

        {/* NDMA CAP Broadcast */}
        <button
          onClick={onOpenCapModal}
          style={{
            background: '#059669', color: '#ffffff', border: '1px solid #10b981',
            padding: '6px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s ease'
          }}
          title="Broadcast emergency CAP v1.2 alert to NDMA Sachet portal"
        >
          <Radio size={14} />
          <span>CAP Broadcast</span>
        </button>

        {/* Mobile Citizen Siren Broadcast */}
        <button
          onClick={onOpenMobileSirenModal}
          style={{
            background: '#dc2626', color: '#ffffff', border: '1px solid #ef4444',
            padding: '6px 12px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s ease', boxShadow: '0 2px 8px rgba(220,38,38,0.3)'
          }}
          title="Broadcast zero-touch emergency siren to all citizen mobile phones"
        >
          <Smartphone size={14} />
          <span>Mobile Siren</span>
        </button>

        {/* Offline Siren Trigger */}
        <button
          onClick={onOpenSirenModal}
          className="btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          title="Trigger 868 MHz LoRaWAN acoustic siren network"
        >
          <Volume2 size={14} color="#94a3b8" />
          <span>LoRa Siren</span>
        </button>
      </div>
    </header>
  );
};
