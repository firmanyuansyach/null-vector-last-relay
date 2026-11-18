import { ARENA, MODULES, PLAYER, RUN, WAVE_DATA } from './config.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const gap = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const rand = (min, max) => min + Math.random() * (max - min);

function sparks(world, x, y, color, count = 10, kick = 150) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(kick * .3, kick);
    world.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: rand(.2, .65), maxLife: .65, color, size: rand(1.5, 4) });
  }
}

function notify(world, message, seconds = 2.1) {
  world.notice = message;
  world.noticeTimer = seconds;
}

function makeEnemy(kind, x, y, wave) {
  const scale = 1 + Math.max(0, wave - 1) * .07;
  const stats = {
    mite: [8, 78, 9, 13, '#ff7281'],
    skater: [16, 57, 14, 16, '#ffbf5e'],
    pylon: [24, 32, 17, 18, '#b99bff'],
    bulwark: [40, 27, 22, 24, '#70a9ff'],
  }[kind];
  return { kind, x, y, hp: Math.ceil(stats[0] * scale), maxHp: Math.ceil(stats[0] * scale), speed: stats[1] + Math.max(0, wave - 2) * 2, touch: stats[2], radius: stats[3], color: stats[4], fireTimer: rand(.8, 1.8), coreTimer: 0, wobble: rand(0, 6), alive: true };
}

function edgeSpawn() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: rand(ARENA.left + 30, ARENA.right - 30), y: ARENA.top + 20 };
  if (side === 1) return { x: ARENA.right - 20, y: rand(ARENA.top + 30, ARENA.bottom - 30) };
  if (side === 2) return { x: rand(ARENA.left + 30, ARENA.right - 30), y: ARENA.bottom - 20 };
  return { x: ARENA.left + 20, y: rand(ARENA.top + 30, ARENA.bottom - 30) };
}

function spawnEnemy(world) {
  const wave = world.wave;
  const roll = Math.random();
  const kind = wave >= 5
    ? roll < .2 ? 'bulwark' : roll < .44 ? 'pylon' : roll < .72 ? 'skater' : 'mite'
    : wave >= 3
      ? roll < .2 ? 'bulwark' : roll < .42 ? 'pylon' : roll < .68 ? 'skater' : 'mite'
      : wave >= 2
        ? roll < .31 ? 'pylon' : roll < .58 ? 'skater' : 'mite'
        : roll < .3 ? 'skater' : 'mite';
  const point = edgeSpawn();
  world.enemies.push(makeEnemy(kind, point.x, point.y, wave));
}

function spawnBoss(world) {
  const final = world.wave === RUN.waves;
  const hp = final ? 520 : 275;
  world.enemies.push({
    kind: 'boss', name: final ? 'ZERO / THE SILENCE' : 'THE AUDITOR',
    x: ARENA.cx, y: ARENA.top + 116, hp, maxHp: hp, speed: 38, radius: final ? 46 : 38,
    touch: 22, color: final ? '#ff657e' : '#b99bff', alive: true, phase: 1,
    orbit: rand(0, 6), attackTimer: 1.6, windup: 0, coreTimer: 0,
  });
}

function spawnWave(world, number) {
  if (number > RUN.waves) {
    world.screen = 'win';
    world.best = Math.max(world.best, world.score);
    try { localStorage.setItem('null-vector-last-relay-best', String(world.best)); } catch { /* Local score storage is optional. */ }
    notify(world, 'SIGNAL RESTORED · THE RELAY HOLDS', 8);
    world.soundEvent = 'win'; world.soundSerial += 1;
    return;
  }
  world.wave = number;
  world.waveSpawnLeft = WAVE_DATA[number - 1].count;
  world.spawnTimer = .8;
  world.enemies.length = 0;
  world.enemyShots.length = 0;
  world.playerShots.length = 0;
  if (number === 4 || number === 8) spawnBoss(world);
  notify(world, (number === 4 || number === 8 ? 'BREACH BOSS · ' : 'SECTOR PING · ') + WAVE_DATA[number - 1].threat, 2.8);
  if (number === 4 || number === 8) { world.soundEvent = 'boss'; world.soundSerial += 1; }
}

function rollOffers(world) {
  const bag = MODULES.slice();
  const selected = [];
  while (selected.length < 3 && bag.length) selected.push(...bag.splice(Math.floor(Math.random() * bag.length), 1));
  world.offers = selected;
}

export function createWorld() {
  let best = 0;
  try { best = Number(localStorage.getItem('null-vector-last-relay-best')) || 0; } catch { /* Private browsing can disable storage. */ }
  return {
    screen: 'title', wave: 0, score: 0, best, kills: 0, scrap: 0, hull: RUN.startingHull, maxHull: RUN.startingHull,
    core: RUN.startingCore, coreMax: RUN.startingCore, flux: 0, fluxMode: false, combo: 0, bestChain: 0,
    comboTimer: 0, waveSpawnLeft: 0, spawnTimer: 0, elapsed: 0, notice: 'AWAITING PILOT', noticeTimer: 2,
    player: { x: ARENA.cx, y: ARENA.cy + 128, radius: PLAYER.radius, vx: 0, vy: 0, aim: 0, invuln: 0, dashTimer: 0, dashCooldown: 0, shotTimer: 0 },
    enemies: [], playerShots: [], enemyShots: [], cells: [], particles: [], offers: [], modules: ['coil','magnet'],
    rig: { fireRate: .82, damage: 8, bolts: 1, fluxRadius: 154, fluxGain: 18, pulseDamage: 82, dashScale: 1, scrapBonus: 0, scrapRadius: 142, comboWindow: 2.2, repair: 0 },
    mute: false, novaFlash: 0, soundEvent: '', soundSerial: 0,
  };
}

export function startRun(world) {
  const fresh = createWorld();
  Object.keys(world).forEach((key) => delete world[key]);
  Object.assign(world, fresh);
  world.screen = 'play';
  spawnWave(world, 1);
  world.notice = 'WAVE 01 · BREAK THE SCOUT SCREEN';
  world.noticeTimer = 2.5;
}

function fireBolt(world, input) {
  const player = world.player;
  const target = input.pointer;
  const aim = Math.atan2(target.y - player.y, target.x - player.x);
  player.aim = aim;
  const spread = world.rig.bolts > 1 ? .095 : 0;
  for (let i = 0; i < world.rig.bolts; i += 1) {
    const offset = (i - (world.rig.bolts - 1) / 2) * spread;
    const angle = aim + offset;
    world.playerShots.push({ x: player.x + Math.cos(angle) * 15, y: player.y + Math.sin(angle) * 15, vx: Math.cos(angle) * PLAYER.shotSpeed, vy: Math.sin(angle) * PLAYER.shotSpeed, life: 1.15, damage: world.rig.damage, color: world.fluxMode ? '#b99bff' : '#55f0d2', radius: 4 });
  }
  sparks(world, player.x + Math.cos(aim) * 15, player.y + Math.sin(aim) * 15, world.fluxMode ? '#b99bff' : '#55f0d2', 2, 55);
  world.soundEvent = 'shot'; world.soundSerial += 1;
}

function hurtPlayer(world, sourceX, sourceY) {
  const player = world.player;
  if (player.invuln > 0 || player.dashTimer > 0) return;
  world.hull -= 1;
  player.invuln = 1.2;
  const dx = player.x - sourceX; const dy = player.y - sourceY; const length = Math.max(1, Math.hypot(dx, dy));
  player.vx += dx / length * 220; player.vy += dy / length * 220;
  sparks(world, player.x, player.y, '#ff7281', 18, 240);
  notify(world, world.hull > 0 ? 'HULL BREACH · MOVE, PILOT' : 'PILOT LOST · CORE SIGNAL COLLAPSED', 2.4);
  world.soundEvent = 'hit'; world.soundSerial += 1;
  if (world.hull <= 0) endRun(world, 'lose');
}

function killEnemy(world, enemy) {
  enemy.alive = false;
  world.kills += 1;
  world.combo = world.comboTimer > 0 ? Math.min(12, world.combo + 1) : 1;
  world.bestChain = Math.max(world.bestChain, world.combo);
  world.comboTimer = world.rig.comboWindow;
  const bounty = enemy.kind === 'boss' ? 900 : enemy.kind === 'bulwark' ? 180 : enemy.kind === 'pylon' ? 160 : 100;
  world.score += bounty * world.combo;
  world.scrap += 1 + world.rig.scrapBonus + (enemy.kind === 'boss' ? 5 : 0);
  world.flux = clamp(world.flux + (enemy.kind === 'boss' ? 30 : 7), 0, RUN.pulseCost);
  world.cells.push({ x: enemy.x, y: enemy.y, value: enemy.kind === 'boss' ? 8 : 2, life: 14, phase: Math.random() * 6 });
  sparks(world, enemy.x, enemy.y, enemy.color, enemy.kind === 'boss' ? 42 : 12, enemy.kind === 'boss' ? 270 : 150);
  if (enemy.kind === 'boss') notify(world, 'BREACH BOSS SHATTERED · SCRAP CACHE +5', 2.8);
  world.soundEvent = 'kill'; world.soundSerial += 1;
}

function fireEnemyShot(world, enemy, target, angleOffset = 0, speed = 235) {
  const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x) + angleOffset;
  world.enemyShots.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 3.2, radius: 5, color: enemy.kind === 'boss' ? '#ff6f7e' : '#ffbf5e', damage: 1 });
}

function updateBoss(world, boss, dt) {
  const nextPhase = boss.hp <= boss.maxHp * .5 ? 2 : 1;
  if (nextPhase !== boss.phase) {
    boss.phase = nextPhase;
    notify(world, boss.name + ' · PHASE 2 · PATTERN INTENSIFIES', 2.4);
    world.soundEvent = 'boss'; world.soundSerial += 1;
  }
  boss.orbit += dt * (world.wave === 8 ? .58 : .4);
  boss.x = ARENA.cx + Math.cos(boss.orbit) * 210;
  boss.y = ARENA.cy - 80 + Math.sin(boss.orbit * 1.35) * 135;
  boss.x = clamp(boss.x, ARENA.left + 70, ARENA.right - 70);
  boss.y = clamp(boss.y, ARENA.top + 65, ARENA.bottom - 130);
  boss.attackTimer -= dt;
  boss.windup = boss.attackTimer < .66 ? clamp(1 - Math.max(0, boss.attackTimer) / .66, 0, 1) : 0;
  if (boss.attackTimer <= 0) {
    const target = world.wave === 8 ? world.player : { x: ARENA.cx, y: ARENA.cy };
    const count = world.wave === 8 ? (boss.phase === 2 ? 13 : 9) : (boss.phase === 2 ? 8 : 5);
    const speed = world.wave === 8 ? (boss.phase === 2 ? 305 : 270) : (boss.phase === 2 ? 255 : 220);
    for (let i = 0; i < count; i += 1) {
      fireEnemyShot(world, boss, target, (i - (count - 1) / 2) * (world.wave === 8 ? .23 : .18), speed);
    }
    boss.attackTimer = boss.phase === 2 ? 1.7 : world.wave === 8 ? 2.15 : 2.55;
    boss.windup = 0;
  }
  if (gap(boss, { x: ARENA.cx, y: ARENA.cy }) < 112) {
    boss.coreTimer += dt;
    if (boss.coreTimer > .95) { boss.coreTimer = 0; world.core = Math.max(0, world.core - (world.wave === 8 ? 3 : 2)); }
  }
}

function updateEnemies(world, dt) {
  const player = world.player;
  const core = { x: ARENA.cx, y: ARENA.cy };
  for (const enemy of world.enemies) {
    if (!enemy.alive) continue;
    enemy.wobble = (enemy.wobble || 0) + dt * 2.5;
    if (enemy.stagger > 0) { enemy.stagger = Math.max(0, enemy.stagger - dt); continue; }
    if (enemy.kind === 'boss') { updateBoss(world, enemy, dt); continue; }
    let target = core;
    if (enemy.kind === 'pylon') {
      const coreGap = gap(enemy, core);
      if (coreGap < 270) {
        const dx = enemy.x - core.x; const dy = enemy.y - core.y; const d = Math.max(1, Math.hypot(dx, dy));
        enemy.x += dx / d * enemy.speed * dt; enemy.y += dy / d * enemy.speed * dt;
      } else {
        const dx = core.x - enemy.x; const dy = core.y - enemy.y; const d = Math.max(1, Math.hypot(dx, dy));
        enemy.x += dx / d * enemy.speed * dt; enemy.y += dy / d * enemy.speed * dt;
      }
      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0) { fireEnemyShot(world, enemy, player, rand(-.08,.08), 190); enemy.fireTimer = 1.7; }
    } else {
      const dx = core.x - enemy.x; const dy = core.y - enemy.y; const d = Math.max(1, Math.hypot(dx, dy));
      const wobble = Math.sin(enemy.wobble) * .18;
      enemy.x += (dx / d + Math.cos(enemy.wobble) * wobble) * enemy.speed * dt;
      enemy.y += (dy / d + Math.sin(enemy.wobble) * wobble) * enemy.speed * dt;
    }
    const coreDistance = gap(enemy, core);
    if (coreDistance < 61) {
      enemy.coreTimer += dt;
      if (enemy.coreTimer > 1.1) {
        enemy.coreTimer = 0;
        const coreHit = enemy.kind === 'bulwark' ? 3 : enemy.kind === 'pylon' ? 2 : enemy.kind === 'skater' ? 1.5 : 1;
        world.core = Math.max(0, world.core - coreHit);
        sparks(world, enemy.x, enemy.y, '#ffbf5e', 4, 80);
        if (world.core <= 0) { endRun(world, 'lose'); return; }
      }
    }
    if (gap(enemy, player) < enemy.radius + player.radius + 2) {
      hurtPlayer(world, enemy.x, enemy.y);
      if (world.screen !== 'play') return;
    }
    enemy.x = clamp(enemy.x, ARENA.left + enemy.radius, ARENA.right - enemy.radius);
    enemy.y = clamp(enemy.y, ARENA.top + enemy.radius, ARENA.bottom - enemy.radius);
  }
}

function collectCell(world, cell) {
  cell.taken = true;
  world.scrap += cell.value;
  world.score += cell.value * 25;
  world.flux = clamp(world.flux + cell.value * 4, 0, RUN.pulseCost);
  sparks(world, cell.x, cell.y, '#ffbf5e', 8, 90);
}

function updateProjectiles(world, dt) {
  for (const shot of world.playerShots) {
    if (shot.life <= 0) continue;
    shot.life -= dt; shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if (shot.x < ARENA.left || shot.x > ARENA.right || shot.y < ARENA.top || shot.y > ARENA.bottom) { shot.life = 0; continue; }
    for (const enemy of world.enemies) {
      if (!enemy.alive || gap(shot, enemy) > enemy.radius + shot.radius) continue;
      shot.life = 0; enemy.hp -= shot.damage;
      world.flux = clamp(world.flux + 1.8, 0, RUN.pulseCost);
      sparks(world, shot.x, shot.y, shot.color, 4, 70);
      if (enemy.hp <= 0) killEnemy(world, enemy);
      break;
    }
  }
  for (const shot of world.enemyShots) {
    if (shot.life <= 0) continue;
    shot.life -= dt; shot.x += shot.vx * dt; shot.y += shot.vy * dt;
    if (shot.x < ARENA.left || shot.x > ARENA.right || shot.y < ARENA.top || shot.y > ARENA.bottom) { shot.life = 0; continue; }
    if (world.fluxMode && gap(shot, world.player) < world.rig.fluxRadius * .78) {
      shot.life = 0; world.flux = clamp(world.flux + 4, 0, RUN.pulseCost); sparks(world, shot.x, shot.y, '#b99bff', 4, 70); continue;
    }
    if (gap(shot, world.player) < world.player.radius + shot.radius) { shot.life = 0; hurtPlayer(world, shot.x, shot.y); }
  }
  world.playerShots = world.playerShots.filter((shot) => shot.life > 0);
  world.enemyShots = world.enemyShots.filter((shot) => shot.life > 0);
}

function updateCells(world, dt) {
  const player = world.player;
  for (const cell of world.cells) {
    if (cell.taken) continue;
    cell.life -= dt; cell.phase += dt * 3;
    const d = gap(player, cell);
    const radius = world.fluxMode ? world.rig.scrapRadius * 2.3 : world.rig.scrapRadius;
    if (d < radius) {
      const pull = world.fluxMode ? 6.5 : 2.8;
      const dx = player.x - cell.x; const dy = player.y - cell.y; const length = Math.max(1, d);
      cell.x += dx / length * (world.fluxMode ? 330 : 95) * dt * pull / 3;
      cell.y += dy / length * (world.fluxMode ? 330 : 95) * dt * pull / 3;
    }
    if (d < player.radius + 11) collectCell(world, cell);
  }
  world.cells = world.cells.filter((cell) => !cell.taken && cell.life > 0);
}

function updateParticles(world, dt) {
  for (const particle of world.particles) {
    particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt;
    particle.vx *= .96; particle.vy *= .96;
  }
  world.particles = world.particles.filter((particle) => particle.life > 0);
}

function doPulse(world) {
  if (world.flux < RUN.pulseCost) { notify(world, 'NOVA NEEDS 100% FLUX', 1.4); return; }
  world.flux = 0;
  world.novaFlash = .72;
  let hits = 0;
  for (const enemy of world.enemies) {
    if (!enemy.alive || gap(world.player, enemy) > 246 + world.rig.fluxRadius * .4) continue;
    enemy.hp -= world.rig.pulseDamage;
    enemy.stagger = .8;
    sparks(world, enemy.x, enemy.y, '#b99bff', enemy.kind === 'boss' ? 20 : 10, 180);
    hits += 1;
    if (enemy.hp <= 0) killEnemy(world, enemy);
  }
  for (const shot of world.enemyShots) shot.life = 0;
  world.enemyShots.length = 0;
  sparks(world, world.player.x, world.player.y, '#b99bff', 38, 300);
  notify(world, hits ? 'NOVA RELEASED · ' + hits + ' THREATS DISRUPTED' : 'NOVA RELEASED · SIGNAL CLEARED', 1.7);
  world.soundEvent = 'pulse'; world.soundSerial += 1;
}

function spendScrapPatch(world) {
  if (world.core >= world.coreMax) { notify(world, 'CORE SHIELD ALREADY FULL', 1.3); return; }
  if (world.scrap < 10) { notify(world, 'CORE PATCH NEEDS 10 SCRAP', 1.4); return; }
  world.scrap -= 10;
  world.core = Math.min(world.coreMax, world.core + 18);
  notify(world, 'SCRAP PATCH · CORE +18', 1.7);
  world.soundEvent = 'upgrade'; world.soundSerial += 1;
}

function useModule(world, id) {
  const rig = world.rig;
  if (id === 'coil') rig.fireRate *= .82;
  if (id === 'fork') rig.bolts = Math.min(5, rig.bolts + 1);
  if (id === 'amp') rig.damage += 2;
  if (id === 'longwave') rig.fluxRadius += 45;
  if (id === 'capacitor') { rig.fluxGain *= 1.2; rig.pulseDamage *= 1.2; }
  if (id === 'plating') { world.coreMax += 24; world.core = Math.min(world.coreMax, world.core + 24); }
  if (id === 'hull') { world.maxHull = Math.min(5, world.maxHull + 1); world.hull = Math.min(world.maxHull, world.hull + 1); }
  if (id === 'vector') rig.dashScale *= .78;
  if (id === 'salvage') rig.scrapBonus += 1;
  if (id === 'magnet') rig.scrapRadius += 54;
  if (id === 'chain') rig.comboWindow += 1.5;
  if (id === 'patch') rig.repair += 18;
  world.modules.push(id);
  if (rig.repair) world.core = Math.min(world.coreMax, world.core + rig.repair);
}

function finishWave(world) {
  if (world.wave >= RUN.waves) { spawnWave(world, RUN.waves + 1); return; }
  world.screen = 'upgrade';
  rollOffers(world);
  notify(world, 'WAVE ' + String(world.wave).padStart(2,'0') + ' SECURED', 3);
}

export function chooseModule(world, index) {
  if (world.screen !== 'upgrade' || !world.offers[index]) return false;
  const module = world.offers[index];
  useModule(world, module.id);
  world.screen = 'play';
  world.soundEvent = 'upgrade'; world.soundSerial += 1;
  spawnWave(world, world.wave + 1);
  return true;
}

export function endRun(world, screen) {
  if (world.screen === 'win' || world.screen === 'lose') return;
  world.screen = screen;
  world.best = Math.max(world.best, world.score);
  try { localStorage.setItem('null-vector-last-relay-best', String(world.best)); } catch { /* Local score storage is optional. */ }
}

export function updateWorld(world, input, dt) {
  if (world.screen !== 'play') return;
  const step = Math.min(dt, .05);
  const player = world.player;
  world.elapsed += step;
  world.noticeTimer = Math.max(0, world.noticeTimer - step);
  world.comboTimer = Math.max(0, world.comboTimer - step);
  world.novaFlash = Math.max(0, world.novaFlash - step);
  if (!world.comboTimer) world.combo = 0;
  player.invuln = Math.max(0, player.invuln - step);
  player.dashCooldown = Math.max(0, player.dashCooldown - step);
  player.dashTimer = Math.max(0, player.dashTimer - step);

  if (input.wasPressed('q')) {
    world.fluxMode = !world.fluxMode;
    notify(world, world.fluxMode ? 'FLUX MODE · HARVEST & ABSORB' : 'ARC MODE · WEAPON LIVE', 1.4);
  }
  if (input.wasPressed('f')) spendScrapPatch(world);
  if (input.wasPressed('e')) doPulse(world);
  if (input.wasPressed('space') && player.dashCooldown <= 0) {
    player.dashTimer = PLAYER.dashTime;
    player.dashCooldown = PLAYER.dashCooldown * world.rig.dashScale;
    player.invuln = Math.max(player.invuln, .28);
    const dashX = Number(input.isDown('d','arrowright')) - Number(input.isDown('a','arrowleft'));
    const dashY = Number(input.isDown('s','arrowdown')) - Number(input.isDown('w','arrowup'));
    const dashLength = Math.hypot(dashX, dashY);
    player.dashDX = dashLength ? dashX / dashLength : Math.cos(player.aim);
    player.dashDY = dashLength ? dashY / dashLength : Math.sin(player.aim);
    sparks(world, player.x, player.y, '#55f0d2', 10, 120);
    world.soundEvent = 'dash'; world.soundSerial += 1;
  }

  let dx = Number(input.isDown('d','arrowright')) - Number(input.isDown('a','arrowleft'));
  let dy = Number(input.isDown('s','arrowdown')) - Number(input.isDown('w','arrowup'));
  const length = Math.hypot(dx, dy) || 1; dx /= length; dy /= length;
  const moveX = player.dashTimer > 0 ? (player.dashDX ?? dx) : dx;
  const moveY = player.dashTimer > 0 ? (player.dashDY ?? dy) : dy;
  const speed = player.dashTimer > 0 ? PLAYER.dashSpeed : PLAYER.speed * (world.fluxMode ? .84 : 1);
  const response = 1 - Math.exp(-18 * step);
  player.vx += (moveX * speed - player.vx) * response;
  player.vy += (moveY * speed - player.vy) * response;
  player.x = clamp(player.x + player.vx * step, ARENA.left + 22, ARENA.right - 22);
  player.y = clamp(player.y + player.vy * step, ARENA.top + 22, ARENA.bottom - 22);
  player.aim = Math.atan2(input.pointer.y - player.y, input.pointer.x - player.x);

  if (input.pointer.down && !world.fluxMode && player.shotTimer <= 0) {
    fireBolt(world, input);
    player.shotTimer = PLAYER.shotCooldown * world.rig.fireRate;
  }
  player.shotTimer = Math.max(0, player.shotTimer - step);

  if (world.fluxMode) {
    let nearby = 0;
    for (const enemy of world.enemies) if (enemy.alive && gap(player, enemy) < world.rig.fluxRadius) nearby += 1;
    world.flux = clamp(world.flux + step * world.rig.fluxGain * Math.min(2.5, nearby), 0, RUN.pulseCost);
  }

  world.spawnTimer -= step;
  if (world.waveSpawnLeft > 0 && world.spawnTimer <= 0) {
    spawnEnemy(world);
    world.waveSpawnLeft -= 1;
    world.spawnTimer = WAVE_DATA[world.wave - 1].interval;
  }
  updateEnemies(world, step);
  updateProjectiles(world, step);
  updateCells(world, step);
  updateParticles(world, step);
  if (world.core <= 0 && world.screen === 'play') endRun(world, 'lose');
  if (world.waveSpawnLeft === 0 && world.enemies.every((enemy) => !enemy.alive) && world.screen === 'play') finishWave(world);
}
