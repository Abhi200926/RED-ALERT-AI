/**
 * Emergency Alert Audio Synthesizer
 * Uses Web Audio API to produce an emergency alert broadcast chime.
 * Complies with browser autoplay policies by requiring user activation.
 */

let audioCtx: AudioContext | null = null;
let currentOscillator1: OscillatorNode | null = null;
let currentOscillator2: OscillatorNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencyAlertSound(durationMs = 2800): void {
  try {
    const ctx = getAudioContext();
    stopAlertSound();

    const now = ctx.currentTime;

    // Dual-tone frequency alternating between 853 Hz and 960 Hz (Standard EAS dual frequencies)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(853, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(960, now);

    // Subtle volume ramp up and ramp down to prevent audio popping
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    gainNode.gain.setValueAtTime(0.18, now + (durationMs / 1000) - 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + durationMs / 1000);
    osc2.stop(now + durationMs / 1000);

    currentOscillator1 = osc1;
    currentOscillator2 = osc2;
  } catch (err) {
    console.warn('Web Audio playback failed:', err);
  }
}

export function playSafetyChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.warn('Safety chime audio failed:', err);
  }
}

export function stopAlertSound(): void {
  try {
    if (currentOscillator1) {
      currentOscillator1.stop();
      currentOscillator1.disconnect();
      currentOscillator1 = null;
    }
    if (currentOscillator2) {
      currentOscillator2.stop();
      currentOscillator2.disconnect();
      currentOscillator2 = null;
    }
  } catch {
    // Ignore already stopped oscillator errors
  }
}
