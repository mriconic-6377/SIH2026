import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, AlertOctagon, CheckCircle2, X } from 'lucide-react';
import { playLoraSirenSound, stopLoraSirenSound } from '../utils/sirenAudio';

interface SirenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SirenModal: React.FC<SirenModalProps> = ({ isOpen, onClose }) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  if (!isOpen) return null;

  const startSirenSound = () => {
    playLoraSirenSound();
    setIsPlayingSound(true);
  };

  const stopSirenSound = () => {
    stopLoraSirenSound();
    setIsPlayingSound(false);
  };

  const handleClose = () => {
    stopSirenSound();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="glass-panel glass-panel-glow-red" style={{
        maxWidth: '540px', width: '100%', padding: '24px',
        position: 'relative', background: 'rgba(17, 24, 39, 0.95)'
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', color: '#9ca3af',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertOctagon size={24} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f9fafb' }}>
              Zero-Internet LoRaWAN Siren Relay
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Autonomous 868 MHz Radio Hardware Actuator (Pillar 4 Demonstration)
            </p>
          </div>
        </div>

        {/* Offline Signal Flow Diagram */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px',
          padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={14} /> Direct Hardware Signal Path (&lt;1.5s Offline Latency)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#d1d5db' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem' }}>⛰️</div>
              <strong>Hillside Node</strong>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Piezometer Trigger</div>
            </div>

            <div style={{ color: '#06b6d4', fontWeight: 700 }}>&mdash;&mdash; LoRa P2P &mdash;&gt;</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem' }}>⚡</div>
              <strong>Base Receiver</strong>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>ESP32 Hardware Relay</div>
            </div>

            <div style={{ color: '#ef4444', fontWeight: 700 }}>&mdash;&mdash; GPIO &mdash;&gt;</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem' }}>🚨</div>
              <strong style={{ color: '#ef4444' }}>110dB Siren</strong>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Road Barrier Drops</div>
            </div>
          </div>
        </div>

        {/* Hardware Status Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#d1d5db', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Cell Tower Independence: <strong>100% Operational during blackout</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Radio Frequency: <strong>868.0 MHz (IN865-867 Licensed Free Band)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Audible Evacuation Radius: <strong>3.2 km across mountain valley</strong></span>
          </div>
        </div>

        {/* Audio Test Button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {isPlayingSound ? (
            <button
              onClick={stopSirenSound}
              className="btn-danger"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <VolumeX size={18} /> Stop Acoustic Alarm
            </button>
          ) : (
            <button
              onClick={startSirenSound}
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <Volume2 size={18} /> Test Sound Siren (Audio Synthesis)
            </button>
          )}

          <button onClick={handleClose} className="btn-secondary">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
