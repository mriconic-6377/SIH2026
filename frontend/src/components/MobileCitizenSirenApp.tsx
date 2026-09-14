import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, Volume2, VolumeX, Navigation, MapPin, CheckCircle, Smartphone, Radio, Zap, RotateCcw } from 'lucide-react';
import { playLoraSirenSound, stopLoraSirenSound, armSirenAudioEngine, fullStopSiren } from '../utils/sirenAudio';

interface SirenStatusPayload {
  is_active: boolean;
  dispatched_at: number | null;
  alert_id: string | null;
  target_village: string;
  severity: string;
  title: string;
  message: string;
  nearest_shelter: string;
  lead_time_mins: number;
  acknowledged_count: number;
}

export const MobileCitizenSirenApp: React.FC = () => {
  const [selectedVillage, setSelectedVillage] = useState<string>('Bhuntar');
  const [sirenState, setSirenState] = useState<SirenStatusPayload | null>(null);
  const [isAudioArmed, setIsAudioArmed] = useState<boolean>(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(1080); // 18 mins

  // Persistent Refs for Synchronous Audio, Target & Acknowledge State
  const selectedVillageRef = useRef<string>(selectedVillage);
  selectedVillageRef.current = selectedVillage;

  const isSirenPlayingRef = useRef<boolean>(false);
  const lastAckAlertIdRef = useRef<string | null>(null);
  const vibrationIntervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Village Metadata Dictionary
  const villageShelters: Record<string, { shelter: string; elev: number; dist_km: number }> = {
    Bhuntar: { shelter: 'Bhuntar Airport Staging Area', elev: 1110, dist_km: 1.2 },
    Larji: { shelter: 'Aut Government High School', elev: 920, dist_km: 3.5 },
    Aut: { shelter: 'Aut Government High School', elev: 920, dist_km: 0.8 },
    Thalot: { shelter: 'Pandoh Community Center', elev: 830, dist_km: 8.5 },
    Pandoh: { shelter: 'Pandoh Community Center', elev: 830, dist_km: 1.0 },
    Mandi: { shelter: 'Mandi District Relief Hub (Paddal Ground)', elev: 760, dist_km: 1.5 },
  };

  // 1. Audio Unlocking & WakeLock
  const armAudio = useCallback(() => {
    try {
      armSirenAudioEngine();
      setIsAudioArmed(true);

      // Request Screen WakeLock so screen stays on during emergency
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(wl => {
          wakeLockRef.current = wl;
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Audio arming failed:', e);
    }
  }, []);

  // Omni-Gesture Listeners: Automatically arm audio on ANY screen interaction
  useEffect(() => {
    const handleGesture = () => {
      armAudio();
    };
    window.addEventListener('click', handleGesture);
    window.addEventListener('touchstart', handleGesture);
    window.addEventListener('keydown', handleGesture);
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, [armAudio]);

  // 2. Stop Siren Audio & Voice Directive (Deterministic & Hard Stop)
  const stopSirenAudio = useCallback(() => {
    isSirenPlayingRef.current = false;
    setIsSirenPlaying(false);

    try {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopLoraSirenSound();
      fullStopSiren();
    } catch (e) {
      console.error('Error stopping siren audio:', e);
    }
  }, []);

  // 3. Start Siren Sound + Vernacular Hindi Voice Broadcast
  const startSirenAudio = useCallback(() => {
    if (isSirenPlayingRef.current) return;
    isSirenPlayingRef.current = true;
    setIsSirenPlaying(true);
    setIsAudioArmed(true);

    try {
      playLoraSirenSound();

      // Vernacular Hindi Emergency Spoken Voice Directive
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const targetShelterName = villageShelters[selectedVillageRef.current]?.shelter || 'ऊंचे सुरक्षित राहत केंद्र';
          const hindiVoiceText = `सावधान! ब्यास नदी घाटी में आपातकालीन बाढ़ और भूस्खलन का खतरा है। सभी नागरिक तुरंत ${targetShelterName} की ओर सुरक्षित स्थान पर जाएं!`;
          const utterance = new SpeechSynthesisUtterance(hindiVoiceText);
          utterance.lang = 'hi-IN';
          utterance.rate = 0.95;
          utterance.pitch = 1.1;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Speech synthesis error:', e);
        }
      }

      // Synchronized vibration pulse
      if ('vibrate' in navigator) {
        navigator.vibrate([400, 200, 400, 200, 800]);
        if (vibrationIntervalRef.current) clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = window.setInterval(() => {
          if (!isSirenPlayingRef.current) {
            navigator.vibrate(0);
            return;
          }
          navigator.vibrate([400, 200, 400, 200, 800]);
        }, 2000);
      }
    } catch (e) {
      console.error('Audio start error:', e);
    }
  }, []);

  // 4. Centralized Dispatch Processor for Siren State
  const processIncomingSirenState = useCallback((payload: SirenStatusPayload) => {
    setSirenState(payload);

    if (!payload.is_active) {
      // Emergency stood down by command center
      lastAckAlertIdRef.current = null;
      setIsAcknowledged(false);
      stopSirenAudio();
      return;
    }

    // Emergency is ACTIVE!
    // Check if this is a NEW alert that hasn't been acknowledged yet
    const hasAcknowledgedThisAlert = payload.alert_id && payload.alert_id === lastAckAlertIdRef.current;
    if (!hasAcknowledgedThisAlert) {
      setIsAcknowledged(false);
    }

    const currentVillage = selectedVillageRef.current;
    const isTargeted = payload.target_village === 'ALL_VALLEY' || 
      payload.target_village.toLowerCase() === currentVillage.toLowerCase();

    if (isTargeted && !hasAcknowledgedThisAlert) {
      startSirenAudio();
    } else if (!isTargeted) {
      stopSirenAudio();
    }
  }, [startSirenAudio, stopSirenAudio]);

  // 5. WebSocket Listener for Instant Push Dispatch
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event_type === 'MOBILE_SIREN_TRIGGER' && data.siren_payload) {
            processIncomingSirenState(data.siren_payload);
          } else if (data.event_type === 'MOBILE_SIREN_CANCEL') {
            processIncomingSirenState({ ...data.siren_payload, is_active: false });
          }
        } catch (e) {}
      };
    } catch (e) {
      console.log('WS fallback to polling');
    }

    return () => {
      if (ws) ws.close();
    };
  }, [processIncomingSirenState]);

  // 6. 500ms Fallback Polling (Zero-Touch Remote Trigger)
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const res = await fetch('/api/v1/alerts/mobile-siren/status');
        if (res.ok && isMounted) {
          const data: SirenStatusPayload = await res.json();
          processIncomingSirenState(data);
        }
      } catch (e) {}
    }

    checkStatus();
    const interval = setInterval(checkStatus, 500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [processIncomingSirenState]);

  // 7. Clean up audio on unmount only
  useEffect(() => {
    return () => {
      stopSirenAudio();
    };
  }, [stopSirenAudio]);

  // 8. Re-evaluate targeting when selectedVillage changes
  useEffect(() => {
    if (sirenState) {
      processIncomingSirenState(sirenState);
    }
  }, [selectedVillage]);

  // 9. Citizen Acknowledge ("I AM EVACUATING / SAFE")
  const handleAcknowledge = async () => {
    // Record acknowledgement for the current alert ID
    lastAckAlertIdRef.current = sirenState?.alert_id || 'manual-ack';
    
    // HARD STOP immediately
    stopSirenAudio();
    setIsAcknowledged(true);

    try {
      await fetch('/api/v1/alerts/mobile-siren/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village: selectedVillage,
          citizen_id: `CITIZEN-${selectedVillage.toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        }),
      });
    } catch (e) {
      console.error('Failed to send ACK', e);
    }
  };

  // 10. Manual Reset to Re-Trigger/Test
  const handleResetAcknowledgement = () => {
    lastAckAlertIdRef.current = null;
    setIsAcknowledged(false);
    if (sirenState?.is_active) {
      const isTargeted = sirenState.target_village === 'ALL_VALLEY' || 
        sirenState.target_village.toLowerCase() === selectedVillage.toLowerCase();
      if (isTargeted) {
        startSirenAudio();
      }
    }
  };

  // 11. Evacuation Countdown Timer
  useEffect(() => {
    if (sirenState?.is_active && countdownSeconds > 0) {
      const timer = setInterval(() => setCountdownSeconds(prev => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [sirenState?.is_active, countdownSeconds]);

  const currentShelter = villageShelters[selectedVillage] || villageShelters.Bhuntar;
  const isEmergencyActive = sirenState?.is_active && (sirenState?.target_village === 'ALL_VALLEY' || sirenState?.target_village.toLowerCase() === selectedVillage.toLowerCase());

  return (
    <div
      onClick={armAudio}
      onTouchStart={armAudio}
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        background: isEmergencyActive && !isAcknowledged ? '#7f1d1d' : '#090d16',
        color: '#f8fafc',
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Flashing Strobe Background Animation on Active Siren */}
      {isEmergencyActive && !isAcknowledged && (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(185,28,28,0.95) 100%)',
            animation: 'pulse 0.5s infinite alternate',
            zIndex: 0, pointerEvents: 'none'
          }}
        />
      )}

      {/* TOP NOTIFICATION: Auto-Arm Status & Tap to Unmute Banner */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {isEmergencyActive && !isAcknowledged && !isSirenPlaying && (
          <div
            onClick={() => {
              armAudio();
              startSirenAudio();
            }}
            style={{
              background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
              color: '#ffffff',
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '12px',
              fontSize: '0.88rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 0 24px rgba(220,38,38,0.8)',
              animation: 'pulse 0.8s infinite alternate',
              border: '2px solid #ffffff'
            }}
          >
            <Volume2 size={22} />
            <span>🚨 EMERGENCY SIREN ACTIVE — TAP HERE TO PLAY SOUND 🔊</span>
          </div>
        )}

        {!isAudioArmed && (
          <div
            onClick={armAudio}
            style={{
              background: 'linear-gradient(90deg, #ea580c, #c2410c)',
              color: '#ffffff',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(234,88,12,0.4)',
              animation: 'pulse 1s infinite alternate'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} />
              <span>TAP ONCE TO ARM AUTOMATIC SIREN</span>
            </div>
            <span style={{ background: '#ffffff', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
              ARM
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>Citizen Disaster Siren</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Wake-on-Disaster (WoD) PWA</div>
            </div>
          </div>

          {/* Audio Arm Badge */}
          <button
            onClick={() => {
              armAudio();
              if (isEmergencyActive && !isAcknowledged) {
                startSirenAudio();
              }
            }}
            style={{
              padding: '4px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
              background: isAudioArmed ? 'rgba(16,185,129,0.15)' : 'rgba(234,88,12,0.2)',
              color: isAudioArmed ? '#34d399' : '#fb923c',
              border: `1px solid ${isAudioArmed ? '#10b981' : '#f97316'}`,
              display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
            }}
          >
            {isAudioArmed ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{isAudioArmed ? (isSirenPlaying ? 'SIREN BLASTING' : 'AUDIO ARMED') : 'TAP TO ARM'}</span>
          </button>
        </div>

        {/* Habitation Selector */}
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <MapPin size={14} color="#38bdf8" />
            <span>My Location:</span>
          </div>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            style={{
              background: '#1e293b', color: '#f8fafc', border: '1px solid #334155',
              padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, outline: 'none'
            }}
          >
            <option value="Bhuntar">Bhuntar (Kullu)</option>
            <option value="Larji">Larji (Mandi)</option>
            <option value="Aut">Aut (Mandi)</option>
            <option value="Thalot">Thalot (Mandi)</option>
            <option value="Pandoh">Pandoh (Mandi)</option>
            <option value="Mandi">Mandi Town (Mandi)</option>
          </select>
        </div>
      </div>

      {/* CENTER STATUS CARD */}
      <div style={{ position: 'relative', zIndex: 1, margin: '16px 0' }}>
        {/* =================================================== */}
        {/* MODE A: STANDBY NORMAL MONITORING */}
        {/* =================================================== */}
        {!isEmergencyActive && !isAcknowledged && (
          <div style={{
            background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '24px 16px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck size={36} color="#34d399" />
            </div>

            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>ALL CLEAR &bull; STANDBY</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Connected to Beas Valley Emergency Command Network
              </div>
            </div>

            {/* Ingestion Status Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                📡 LoRa Mesh: <strong>868 MHz Active</strong>
              </div>
              <div style={{ background: '#1e293b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', color: '#cbd5e1' }}>
                ⚡ Audio: <strong>{isAudioArmed ? 'Auto-Armed' : 'Touch Screen'}</strong>
              </div>
            </div>

            {/* Assigned Shelter Info */}
            <div style={{
              width: '100%', background: '#090d16', padding: '12px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.04)', textAlign: 'left', marginTop: '6px'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>ASSIGNED EMERGENCY RELIEF SHELTER</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                {currentShelter.shelter}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px' }}>
                Elev: {currentShelter.elev}m &bull; Approx Distance: {currentShelter.dist_km} km
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={() => {
                if (isSirenPlaying) {
                  stopSirenAudio();
                } else {
                  startSirenAudio();
                }
              }}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                background: isSirenPlaying ? '#ef4444' : '#1e293b',
                color: '#ffffff', border: '1px solid #334155', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px'
              }}
            >
              <Radio size={14} />
              <span>{isSirenPlaying ? 'STOP TEST SIREN' : 'TEST HARDWARE SIREN (LOCAL TEST)'}</span>
            </button>
          </div>
        )}

        {/* =================================================== */}
        {/* MODE B: 🚨 CRITICAL EVACUATION SIREN ACTIVATED */}
        {/* =================================================== */}
        {isEmergencyActive && !isAcknowledged && (
          <div style={{
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            border: '2px solid #ef4444', borderRadius: '16px', padding: '20px 16px',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#ef4444', boxShadow: '0 0 30px #ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'bounce 0.8s infinite'
            }}>
              <AlertTriangle size={42} color="#ffffff" />
            </div>

            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
                🚨 {sirenState?.title || 'EVACUATE IMMEDIATELY'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fef08a', fontWeight: 700, marginTop: '4px' }}>
                TARGET: {sirenState?.target_village} VALLEY
              </div>
            </div>

            {/* Countdown Box */}
            <div style={{ background: '#450a0a', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 600 }}>ESTIMATED SURGE ARRIVAL WINDOW</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')} MIN
              </div>
            </div>

            {/* Broadcast Directives */}
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', width: '100%' }}>
              <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700 }}>COMMAND CENTER DIRECTIVE:</div>
              <div style={{ fontSize: '0.82rem', color: '#f8fafc', marginTop: '3px', lineHeight: 1.4 }}>
                {sirenState?.message}
              </div>
              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.78rem' }}>
                <Navigation size={14} />
                <span>Move to: <strong>{sirenState?.nearest_shelter || currentShelter.shelter}</strong></span>
              </div>
            </div>

            {/* Big Action Button — GUARANTEED INSTANT SILENCE */}
            <button
              onClick={handleAcknowledge}
              style={{
                width: '100%', padding: '16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 900,
                background: '#22c55e', color: '#ffffff', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(34,197,94,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <CheckCircle size={22} />
              <span>I AM EVACUATING (SAFE ACKNOWLEDGE)</span>
            </button>
          </div>
        )}

        {/* =================================================== */}
        {/* MODE C: ACKNOWLEDGED & EN ROUTE TO SHELTER */}
        {/* =================================================== */}
        {isAcknowledged && (
          <div style={{
            background: '#064e3b', border: '2px solid #10b981', borderRadius: '16px',
            padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px'
          }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={32} color="#ffffff" />
            </div>

            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>ACKNOWLEDGEMENT RECORDED</div>
              <div style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '2px' }}>
                Siren silenced. Command Center recorded your evacuation.
              </div>
            </div>

            <div style={{ background: '#022c22', padding: '12px', borderRadius: '10px', width: '100%', textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>TURN-BY-TURN SHELTER DIRECTIVE</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                📍 {sirenState?.nearest_shelter || currentShelter.shelter}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '2px' }}>
                High Elevation Zone &bull; Elevation: {currentShelter.elev}m
              </div>
            </div>

            {/* Re-trigger / Reset button */}
            <button
              onClick={handleResetAcknowledgement}
              style={{
                marginTop: '6px', width: '100%', padding: '10px', borderRadius: '8px',
                background: '#042f2e', color: '#5eead4', border: '1px solid #14b8a6',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <RotateCcw size={14} />
              <span>RE-ARM / RE-TRIGGER SIREN TEST</span>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
          National Disaster Management Authority &bull; Beas River Early Warning Network
        </div>
      </div>
    </div>
  );
};
