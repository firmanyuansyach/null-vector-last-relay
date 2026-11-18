export const VIEW = Object.freeze({ width: 1280, height: 800 });
export const ARENA = Object.freeze({ left: 245, top: 126, right: 1014, bottom: 716, cx: 630, cy: 421 });
export const RUN = Object.freeze({ waves: 8, startingCore: 100, startingHull: 3, pulseCost: 100 });
export const PLAYER = Object.freeze({ speed: 288, radius: 12, dashSpeed: 740, dashTime: 0.18, dashCooldown: 1.28, shotSpeed: 670, shotCooldown: 0.25 });
export const COLORS = Object.freeze({
  background: '#080f18', field: '#0d1924', grid: 'rgba(106, 149, 165, .11)', panel: 'rgba(9, 18, 28, .9)',
  line: 'rgba(132, 183, 199, .24)', text: '#edf7fa', muted: '#809aa8', cyan: '#55f0d2', amber: '#ffbf5e',
  violet: '#b99bff', coral: '#ff6f7e', blue: '#70a9ff', enemy: '#ff7281',
});

export const WAVE_DATA = Object.freeze([
  { count: 7, interval: 1.08, threat: 'SCOUT SWARM' },
  { count: 9, interval: 0.96, threat: 'SHOOTERS DETECTED' },
  { count: 12, interval: 0.87, threat: 'ARMORED DRIFTERS' },
  { count: 5, interval: 1.02, threat: 'BREACH BOSS · AUDITOR' },
  { count: 14, interval: 0.78, threat: 'BREAKER PACK' },
  { count: 16, interval: 0.72, threat: 'CROSS-FIRE GRID' },
  { count: 19, interval: 0.66, threat: 'ALL SIGNALS HOSTILE' },
  { count: 7, interval: 0.78, threat: 'BREACH BOSS · ZERO' },
]);

export const MODULES = Object.freeze([
  { id: 'coil', name: 'HOT COIL', tag: 'WEAPON', text: 'Fire arc bolts 18% faster.', color: '#55f0d2' },
  { id: 'fork', name: 'FORKED ARC', tag: 'WEAPON', text: 'Add a second bolt at a narrow angle.', color: '#70a9ff' },
  { id: 'amp', name: 'PHASE AMP', tag: 'WEAPON', text: 'Bolt damage +2. Bosses feel it.', color: '#ffbf5e' },
  { id: 'longwave', name: 'LONGWAVE', tag: 'FLUX', text: 'Flux field radius +45 px.', color: '#b99bff' },
  { id: 'capacitor', name: 'DEEP CELL', tag: 'FLUX', text: 'Flux gain and nova damage +20%.', color: '#55f0d2' },
  { id: 'plating', name: 'CORE PLATING', tag: 'DEFENSE', text: 'Core capacity +24 and restore 24.', color: '#ffbf5e' },
  { id: 'hull', name: 'GHOST HULL', tag: 'DEFENSE', text: 'Repair one hull. Gain a spare if full.', color: '#70a9ff' },
  { id: 'vector', name: 'VECTOR JETS', tag: 'MOBILITY', text: 'Dash cooldown -22%.', color: '#55f0d2' },
  { id: 'salvage', name: 'SCRAP TITHING', tag: 'ECONOMY', text: 'Gain +1 scrap on every breach kill.', color: '#ffbf5e' },
  { id: 'magnet', name: 'GRAVITY LENS', tag: 'FLUX', text: 'Pull salvage from farther away.', color: '#b99bff' },
  { id: 'chain', name: 'CHAIN MEMORY', tag: 'SCORE', text: 'Keep a kill chain alive 1.5 s longer.', color: '#70a9ff' },
  { id: 'patch', name: 'FIELD PATCH', tag: 'REPAIR', text: 'Restore 18 core after every wave.', color: '#55f0d2' },
]);
