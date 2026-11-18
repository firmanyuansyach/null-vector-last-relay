let context;
let muted = false;

export function toggleMute() { muted = !muted; return muted; }

export function playSound(kind) {
  if (muted) return;
  try {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') context.resume();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const settings = {
      shot: [520, 0.035, 'triangle', 0.035], hit: [155, 0.18, 'sawtooth', 0.07],
      kill: [760, 0.08, 'sine', 0.045], pulse: [92, 0.36, 'sawtooth', 0.12],
      dash: [310, 0.09, 'triangle', 0.07], upgrade: [680, 0.24, 'sine', 0.08],
      boss: [75, 0.5, 'sawtooth', 0.12], win: [440, 0.65, 'sine', 0.08],
    }[kind] || [400, 0.08, 'sine', 0.04];
    osc.type = settings[2];
    osc.frequency.setValueAtTime(settings[0], now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(35, settings[0] * 0.62), now + settings[1]);
    gain.gain.setValueAtTime(settings[3], now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + settings[1]);
    osc.connect(gain); gain.connect(context.destination);
    osc.start(now); osc.stop(now + settings[1] + 0.02);
  } catch { /* Audio is optional; the game still runs if Web Audio is unavailable. */ }
}
