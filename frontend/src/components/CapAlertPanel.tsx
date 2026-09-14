import React, { useState } from 'react';
import { Send, Radio, CheckCircle2, X } from 'lucide-react';

interface CapAlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  threatLevel: string;
}

export const CapAlertPanel: React.FC<CapAlertPanelProps> = ({ isOpen, onClose, threatLevel }) => {
  const [headline, setHeadline] = useState('FLASH FLOOD SURGE IMMINENT - EVACUATE TO GREEN ZONE');
  const [description, setDescription] = useState('Rapid water stage rise in Beas River basin (Aut-Pandoh stretch). High probability of bridge submergence within 30 minutes.');
  const [severity, setSeverity] = useState(threatLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING');
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/v1/alerts/dispatch-cap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity,
          alert_type: 'CAP_SACHET_SMS',
          target_habitation_id: 'HAB-AUT',
          headline,
          description,
          instruction: 'Move immediately to designated Green Zone shelter at higher elevation. Avoid NH-21 low-lying bridges.',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchResult(data);
      }
    } catch (e) {
      console.error('Failed to dispatch alert', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '580px', width: '100%', padding: '24px',
        position: 'relative', background: 'rgba(17, 24, 39, 0.95)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
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
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Radio size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f9fafb' }}>
              Common Alerting Protocol (CAP v1.2) Dispatcher
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              National Disaster Management Authority (NDMA Sachet) &amp; Telecom Gateway
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: '4px' }}>
              Alert Severity Level:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['WARNING', 'CRITICAL', 'EXTREME'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  style={{
                    flex: 1, padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                    background: severity === lvl ? (lvl === 'EXTREME' || lvl === 'CRITICAL' ? '#dc2626' : '#d97706') : 'rgba(255,255,255,0.06)',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: '4px' }}>
              Urgent Broadcast Headline:
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f3f4f6', fontSize: '0.8rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d1d5db', display: 'block', marginBottom: '4px' }}>
              Detailed Description &amp; Evacuation Instruction:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '6px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f3f4f6', fontSize: '0.8rem', resize: 'none'
              }}
            />
          </div>
        </div>

        {/* Dispatch Result Card if Success */}
        {dispatchResult && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '0.75rem', color: '#d1d5db'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, marginBottom: '4px' }}>
              <CheckCircle2 size={16} /> CAP Alert Broadcasted Successfully!
            </div>
            <div>Identifier: <strong style={{ color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>{dispatchResult.cap_identifier}</strong></div>
            <div>Telecom SMS Queued: <strong>{dispatchResult.cap_document?.dispatch_status?.telecom_sms_queued?.toLocaleString()}</strong></div>
            <div>IVR Voice Calls Queued: <strong>{dispatchResult.cap_document?.dispatch_status?.ivr_voice_calls_queued?.toLocaleString()}</strong></div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDispatch}
            disabled={isSending}
            className="btn-danger"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Send size={16} />
            {isSending ? 'Transmitting to NDMA Sachet...' : 'Broadcast Emergency CAP Alert'}
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
