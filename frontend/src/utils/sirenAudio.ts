// ─── Universal High-Decibel Siren Audio Engine ───
// Supports both HTMLAudioElement (/siren.mp3) and Web Audio API synthesizer fallback.
// Bulletproof against mobile autoplay restrictions and browser interruption errors.

let sirenAudio: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let synthGain: GainNode | null = null;
let synthInterval: number | null = null;
let isEngineArmed = false;
let isAudioCurrentlyPlaying = false;

/**
 * Initializes and arms the audio system on first user gesture.
 */
export function armSirenAudioEngine(): void {
  try {
    // 1. Initialize HTMLAudioElement
    if (!sirenAudio) {
      sirenAudio = new Audio('/siren.mp3');
      sirenAudio.loop = true;
      sirenAudio.preload = 'auto';
      sirenAudio.volume = 1.0;
    }

    // 2. Initialize Web Audio Context
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    isEngineArmed = true;
    console.log('[SirenEngine] ✅ Audio engine armed successfully.');
  } catch (e) {
    console.warn('[SirenEngine] Error arming audio engine:', e);
  }
}

/**
 * Web Audio API synthesizer fallback:
 * Emulates high-decibel dual-tone emergency disaster siren (960 Hz / 770 Hz warble).
 */
function startSynthSiren(): void {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    if (synthGain) return; // already running

    synthGain = audioCtx.createGain();
    synthGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    synthGain.connect(audioCtx.destination);

    osc1 = audioCtx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(960, audioCtx.currentTime);
    osc1.connect(synthGain);
    osc1.start();

    osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(770, audioCtx.currentTime);
    osc2.connect(synthGain);
    osc2.start();

    // Warbling frequency sweep every 450ms
    let high = true;
    synthInterval = window.setInterval(() => {
      if (!audioCtx || !osc1 || !osc2) return;
      high = !high;
      const now = audioCtx.currentTime;
      const freq1 = high ? 960 : 770;
      const freq2 = high ? 770 : 620;
      osc1.frequency.exponentialRampToValueAtTime(freq1, now + 0.35);
      osc2.frequency.exponentialRampToValueAtTime(freq2, now + 0.35);
    }, 450);

    console.log('[SirenEngine] 🔊 Web Audio synthesizer active as fallback.');
  } catch (e) {
    console.warn('[SirenEngine] Synth siren error:', e);
  }
}

function stopSynthSiren(): void {
  try {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (osc1) {
      try { osc1.stop(); osc1.disconnect(); } catch (e) {}
      osc1 = null;
    }
    if (osc2) {
      try { osc2.stop(); osc2.disconnect(); } catch (e) {}
      osc2 = null;
    }
    if (synthGain) {
      try { synthGain.disconnect(); } catch (e) {}
      synthGain = null;
    }
  } catch (e) {
    console.warn('[SirenEngine] Error stopping synth:', e);
  }
}

/**
 * ACTIVATES the siren at full volume.
 * Tries HTMLAudioElement (/siren.mp3) first; if blocked or fails, starts Web Audio synth.
 */
export function playLoraSirenSound(): void {
  isAudioCurrentlyPlaying = true;
  armSirenAudioEngine();

  try {
    if (!sirenAudio) {
      sirenAudio = new Audio('/siren.mp3');
      sirenAudio.loop = true;
      sirenAudio.preload = 'auto';
    }

    sirenAudio.volume = 1.0;
    sirenAudio.currentTime = 0;

    const playPromise = sirenAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[SirenEngine] 🚨 SIREN MP3 PLAYING AT FULL VOLUME!');
          // Stop synth if it was running as fallback
          stopSynthSiren();
        })
        .catch((err) => {
          console.warn('[SirenEngine] HTMLAudio play failed, activating Web Audio fallback:', err.message);
          startSynthSiren();
        });
    }
  } catch (e) {
    console.error('[SirenEngine] Error in playLoraSirenSound:', e);
    startSynthSiren();
  }
}

/**
 * SILENCES the siren immediately.
 */
export function stopLoraSirenSound(): void {
  isAudioCurrentlyPlaying = false;
  try {
    if (sirenAudio) {
      sirenAudio.pause();
      sirenAudio.currentTime = 0;
      console.log('[SirenEngine] Siren MP3 paused.');
    }
  } catch (e) {
    console.error('[SirenEngine] Error stopping siren sound:', e);
  }
  stopSynthSiren();
}

/**
 * FULL STOP — Pauses and resets everything.
 */
export function fullStopSiren(): void {
  stopLoraSirenSound();
}

/**
 * Returns whether the audio engine has been armed by user interaction.
 */
export function isAudioArmed(): boolean {
  return isEngineArmed;
}

/**
 * Returns whether siren sound is currently active.
 */
export function isSirenActive(): boolean {
  return isAudioCurrentlyPlaying;
}

