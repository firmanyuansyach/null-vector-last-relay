import { ARENA, COLORS, MODULES, RUN, VIEW, WAVE_DATA } from './config.js';

function box(ctx, x, y, width, height, radius, fill, stroke = COLORS.line) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}

function label(ctx, value, x, y, size = 10, color = COLORS.text, align = 'left', weight = 700) {
  ctx.font = `${weight} ${size}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function bar(ctx, x, y, width, height, value, max, color, bg = 'rgba(232,246,250,.08)') {
  box(ctx, x, y, width, height, height / 2, bg, null);
  const fill = Math.max(0, Math.min(1, value / max));
  if (fill > 0) box(ctx, x, y, width * fill, height, height / 2, color, null);
}

function glow(ctx, x, y, radius, color, alpha = .34) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color.replace('ALPHA', String(alpha)));
  gradient.addColorStop(1, color.replace('ALPHA', '0'));
  ctx.fillStyle = gradient;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}

function drawBackdrop(ctx, time, wave) {
  const g = ctx.createLinearGradient(0, 0, VIEW.width, VIEW.height);
  g.addColorStop(0, '#0a1520'); g.addColorStop(.52, '#0b131e'); g.addColorStop(1, '#10121c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const accent = wave >= 7 ? 'rgba(255,111,126,.055)' : wave >= 4 ? 'rgba(185,155,255,.045)' : 'rgba(85,240,210,.045)';
  for (let i = 0; i < 11; i += 1) {
    const x = (i * 149 + 41) % VIEW.width;
    const y = (i * 91 + 35) % VIEW.height;
    glow(ctx, x, y, 180 + Math.sin(time + i) * 35, accent.replace('.055', 'ALPHA').replace('.045', 'ALPHA'), .55);
  }
  ctx.fillStyle = 'rgba(187,218,226,.035)';
  for (let y = 104; y < 730; y += 4) ctx.fillRect(0, y, VIEW.width, 1);
}

function drawArena(ctx, time, world) {
  const color = world.wave >= 7 ? COLORS.coral : world.wave >= 4 ? COLORS.violet : COLORS.cyan;
  box(ctx, ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top, 10, 'rgba(9,18,27,.95)', 'rgba(136,194,204,.24)');
  ctx.save();
  ctx.beginPath(); ctx.roundRect(ARENA.left + 1, ARENA.top + 1, ARENA.right - ARENA.left - 2, ARENA.bottom - ARENA.top - 2, 9); ctx.clip();
  ctx.fillStyle = '#0d1924'; ctx.fillRect(ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top);
  ctx.strokeStyle = 'rgba(117,164,178,.09)'; ctx.lineWidth = 1;
  for (let x = ARENA.left + 20; x < ARENA.right; x += 32) { ctx.beginPath(); ctx.moveTo(x, ARENA.top); ctx.lineTo(x, ARENA.bottom); ctx.stroke(); }
  for (let y = ARENA.top + 18; y < ARENA.bottom; y += 32) { ctx.beginPath(); ctx.moveTo(ARENA.left, y); ctx.lineTo(ARENA.right, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(85,240,210,.08)'; ctx.setLineDash([2, 11]);
  ctx.beginPath(); ctx.arc(ARENA.cx, ARENA.cy, 114 + Math.sin(time * .8) * 4, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(ARENA.cx, ARENA.cy, 228, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  const nodes = [[ARENA.left+48,ARENA.top+48],[ARENA.right-48,ARENA.top+48],[ARENA.left+48,ARENA.bottom-48],[ARENA.right-48,ARENA.bottom-48]];
  nodes.forEach(([x,y],index)=>{
    ctx.save(); ctx.translate(x,y); ctx.rotate(time*.08+(index%2)*.4);
    ctx.strokeStyle='rgba(127,185,193,.28)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.rect(-12,-12,24,24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22,0); ctx.lineTo(22,0); ctx.moveTo(0,-22); ctx.lineTo(0,22); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,3+Math.sin(time*2+index)*1.2,0,Math.PI*2); ctx.fillStyle=index%2?COLORS.violet:COLORS.cyan; ctx.fill();
    ctx.restore();
  });
  ctx.strokeStyle = color; ctx.globalAlpha = .16 + Math.sin(time * 2) * .04; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(ARENA.left + 4, ARENA.top + 4, ARENA.right - ARENA.left - 8, ARENA.bottom - ARENA.top - 8, 8); ctx.stroke();
  ctx.restore();
}

function drawCore(ctx, world, time) {
  const { cx, cy } = ARENA;
  const hue = world.core < 35 ? COLORS.coral : COLORS.amber;
  glow(ctx, cx, cy, 105, hue === COLORS.coral ? 'rgba(255,111,126,ALPHA)' : 'rgba(255,191,94,ALPHA)', .35);
  ctx.save(); ctx.translate(cx, cy);
  ctx.rotate(time * .23);
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath(); ctx.ellipse(0, 0, 46 + i * 12, 23 + i * 8, i * .5, 0, Math.PI * 2);
    ctx.strokeStyle = i === 0 ? hue : 'rgba(126,207,212,.4)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.rotate(-time * .7);
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI / 4; const r = i % 2 === 0 ? 31 : 23;
    const x = Math.cos(a) * r; const y = Math.sin(a) * r;
    if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fillStyle = 'rgba(255,191,94,.2)'; ctx.fill(); ctx.strokeStyle = hue; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 12 + Math.sin(time * 5) * 2, 0, Math.PI * 2); ctx.fillStyle = '#fff3ca'; ctx.fill();
  ctx.restore();
  label(ctx, 'THE RELAY', cx, cy + 67, 8, '#95aeb5', 'center', 900);
}

function drawPilot(ctx, player, world, time) {
  if (player.invuln > 0 && Math.floor(time * 16) % 2 === 0) return;
  if (world.fluxMode) {
    ctx.strokeStyle = 'rgba(185,155,255,.52)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, world.rig.fluxRadius, 0, Math.PI * 2); ctx.stroke();
    glow(ctx, player.x, player.y, world.rig.fluxRadius, 'rgba(185,155,255,ALPHA)', .09);
  }
  const angle = player.aim;
  ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(angle);
  const thrust = 6 + Math.sin(time * 26) * 2;
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18 - thrust, -4); ctx.lineTo(-14, 0); ctx.lineTo(-18 - thrust, 4); ctx.closePath();
  ctx.fillStyle = world.fluxMode ? COLORS.violet : COLORS.amber; ctx.fill();
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-8, -11); ctx.lineTo(-12, 0); ctx.lineTo(-8, 11); ctx.closePath();
  ctx.fillStyle = '#c7f8ee'; ctx.fill(); ctx.strokeStyle = world.fluxMode ? COLORS.violet : COLORS.cyan; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, Math.PI * 2); ctx.fillStyle = COLORS.amber; ctx.fill();
  ctx.restore();
  if (player.dashCooldown > 0) {
    ctx.strokeStyle = 'rgba(85,240,210,.2)'; ctx.beginPath(); ctx.arc(player.x, player.y, 19, -Math.PI/2, -Math.PI/2 + (1 - player.dashCooldown / 1.28) * Math.PI * 2); ctx.stroke();
  }
}

function drawEnemy(ctx, enemy, time) {
  if (!enemy.alive) return;
  const boss = enemy.kind === 'boss';
  const radius = enemy.radius;
  if (enemy.stagger > 0) {
    ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 8 + Math.sin(time * 18) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(185,155,255,${.45 + Math.min(.35, enemy.stagger * .35)})`;
    ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
  }
  if (boss && enemy.windup > 0) {
    ctx.beginPath(); ctx.arc(enemy.x, enemy.y, radius + 22 + enemy.windup * 24, 0, Math.PI * 2);
    ctx.strokeStyle = enemy.phase === 2 ? `rgba(255,111,126,${.3 + enemy.windup * .65})` : `rgba(255,191,94,${.25 + enemy.windup * .55})`;
    ctx.lineWidth = 2 + enemy.windup; ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, enemy.phase === 2 ? 'PHASE II · CHARGING' : 'CHARGING', enemy.x, enemy.y - radius - 29, 8, enemy.phase === 2 ? COLORS.coral : COLORS.amber, 'center', 900);
  }
  glow(ctx, enemy.x, enemy.y, radius * (boss ? 2.7 : 1.8), enemy.kind === 'pylon' ? 'rgba(185,155,255,ALPHA)' : enemy.kind === 'bulwark' ? 'rgba(112,169,255,ALPHA)' : 'rgba(255,111,126,ALPHA)', boss ? .32 : .2);
  ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.rotate(boss ? Math.sin(time * .7) * .12 : enemy.wobble * .2);
  if (boss) {
    ctx.beginPath();
    for (let i = 0; i < 12; i += 1) {
      const a = i * Math.PI / 6; const r = i % 2 === 0 ? radius : radius * .72;
      if (!i) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fillStyle = 'rgba(23,19,35,.96)'; ctx.fill(); ctx.strokeStyle = enemy.color; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, radius * .43, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,111,126,.25)'; ctx.fill(); ctx.strokeStyle = '#ffe4da'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, radius * .14 + Math.sin(time * 7) * 2, 0, Math.PI * 2); ctx.fillStyle = '#fff2d4'; ctx.fill();
  } else if (enemy.kind === 'bulwark') {
    ctx.fillStyle = 'rgba(21,32,49,.96)'; ctx.strokeStyle = enemy.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-radius, -radius, radius * 2, radius * 2, 5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-radius * .55,0); ctx.lineTo(0,-radius * .55); ctx.lineTo(radius * .55,0); ctx.lineTo(0,radius * .55); ctx.closePath(); ctx.fillStyle = enemy.color; ctx.fill();
  } else if (enemy.kind === 'pylon') {
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(26,20,43,.96)'; ctx.fill(); ctx.strokeStyle = enemy.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, radius * .45, 0, Math.PI * 2); ctx.strokeStyle = '#eadfff'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-radius * .35, 0); ctx.lineTo(radius * .35, 0); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(0,-radius); ctx.lineTo(radius*.8,0); ctx.lineTo(0,radius); ctx.lineTo(-radius*.8,0); ctx.closePath();
    ctx.fillStyle = 'rgba(43,23,36,.95)'; ctx.fill(); ctx.strokeStyle = enemy.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fillStyle = '#fff1da'; ctx.fill();
  }
  ctx.restore();
  if (boss) {
    const width = 100;
    box(ctx, enemy.x - width/2, enemy.y + radius + 7, width, 5, 3, 'rgba(245,245,255,.1)', null);
    box(ctx, enemy.x - width/2, enemy.y + radius + 7, width * Math.max(0, enemy.hp/enemy.maxHp), 5, 3, enemy.color, null);
  } else if (enemy.maxHp > 2) {
    box(ctx, enemy.x - 12, enemy.y + radius + 5, 24, 3, 2, 'rgba(245,245,255,.12)', null);
    box(ctx, enemy.x - 12, enemy.y + radius + 5, 24 * Math.max(0, enemy.hp/enemy.maxHp), 3, 2, enemy.color, null);
  }
}

function drawCombat(ctx, world, time) {
  drawCore(ctx, world, time);
  for (const cell of world.cells) {
    glow(ctx, cell.x, cell.y, 22, 'rgba(255,191,94,ALPHA)', .27);
    ctx.save(); ctx.translate(cell.x, cell.y + Math.sin(cell.phase) * 3); ctx.rotate(time * 1.4);
    ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(7,0); ctx.lineTo(0,7); ctx.lineTo(-7,0); ctx.closePath();
    ctx.fillStyle = COLORS.amber; ctx.fill(); ctx.strokeStyle = '#fff4d0'; ctx.stroke(); ctx.restore();
    label(ctx, '+' + cell.value, cell.x, cell.y - 14, 8, COLORS.amber, 'center', 900);
  }
  for (const shot of world.playerShots) {
    glow(ctx, shot.x, shot.y, 14, shot.color === COLORS.violet ? 'rgba(185,155,255,ALPHA)' : 'rgba(85,240,210,ALPHA)', .35);
    ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2); ctx.fillStyle = shot.color; ctx.fill();
  }
  for (const shot of world.enemyShots) {
    glow(ctx, shot.x, shot.y, 18, 'rgba(255,111,126,ALPHA)', .32);
    ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2); ctx.fillStyle = shot.color; ctx.fill(); ctx.strokeStyle = '#ffe6db'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (const enemy of world.enemies) drawEnemy(ctx, enemy, time);
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size); ctx.globalAlpha = 1;
  }
  drawPilot(ctx, world.player, world, time);
  if (world.novaFlash > 0) {
    const progress=1-world.novaFlash/.72;
    ctx.globalAlpha=1-progress;
    ctx.beginPath(); ctx.arc(world.player.x,world.player.y,35+progress*330,0,Math.PI*2);
    ctx.strokeStyle=COLORS.violet; ctx.lineWidth=5*(1-progress)+1; ctx.stroke();
    ctx.beginPath(); ctx.arc(world.player.x,world.player.y,25+progress*250,0,Math.PI*2);
    ctx.strokeStyle='#f3e7ff'; ctx.lineWidth=2; ctx.stroke();
    ctx.globalAlpha=1;
  }
  if (world.flux > 0 && world.flux >= RUN.pulseCost) {
    ctx.beginPath(); ctx.arc(world.player.x, world.player.y, 27 + Math.sin(time * 7) * 3, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(185,155,255,.8)'; ctx.lineWidth = 2; ctx.stroke();
  }
}

function drawTopHud(ctx, world, time) {
  box(ctx, 18, 14, 1244, 94, 9, 'rgba(7,15,24,.96)', 'rgba(123,184,197,.28)');
  glow(ctx, 52, 48, 32, 'rgba(85,240,210,ALPHA)', .18);
  ctx.beginPath(); ctx.arc(52, 49, 13, 0, Math.PI*2); ctx.strokeStyle = COLORS.cyan; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(45,49); ctx.lineTo(52,42); ctx.lineTo(59,49); ctx.lineTo(52,56); ctx.closePath(); ctx.fillStyle = COLORS.cyan; ctx.fill();
  label(ctx, 'NULL VECTOR', 74, 42, 13, COLORS.text, 'left', 900);
  label(ctx, 'THE LAST RELAY', 74, 62, 8, COLORS.muted, 'left', 800);
  ctx.strokeStyle = COLORS.line; ctx.beginPath(); ctx.moveTo(230,28); ctx.lineTo(230,94); ctx.stroke();
  label(ctx, 'BREACH', 253, 37, 8, COLORS.muted, 'left', 900);
  label(ctx, String(world.wave || 1).padStart(2,'0') + ' / 08', 253, 65, 19, COLORS.text, 'left', 850);
  const startX = 347;
  for (let i=1; i<=RUN.waves; i+=1) {
    const x = startX + (i-1)*31;
    const active = i === world.wave;
    const complete = i < world.wave;
    ctx.beginPath(); ctx.arc(x, 63, active ? 8 : 6, 0, Math.PI*2);
    ctx.fillStyle = complete ? COLORS.cyan : active ? COLORS.amber : 'rgba(203,226,233,.12)'; ctx.fill();
    ctx.strokeStyle = i===4||i===8 ? COLORS.coral : active ? '#fff0c4' : 'rgba(203,226,233,.32)'; ctx.lineWidth = i===4||i===8 ? 1.5 : 1; ctx.stroke();
    if (i===4||i===8) label(ctx, 'B', x, 63, 7, complete ? '#06141a' : COLORS.coral, 'center', 900);
  }
  label(ctx, world.wave > 0 ? WAVE_DATA[world.wave - 1]?.threat || 'SIGNAL RESTORED' : 'READY TO DEPLOY', 347, 88, 8, world.wave>=7 ? COLORS.coral : COLORS.muted, 'left', 800);
  ctx.strokeStyle = COLORS.line; ctx.beginPath(); ctx.moveTo(611,28); ctx.lineTo(611,94); ctx.stroke();
  label(ctx, 'SCORE', 638, 36, 8, COLORS.muted, 'left', 900);
  label(ctx, String(world.score).padStart(7,'0'), 638, 65, 20, COLORS.amber, 'left', 900);
  label(ctx, 'BEST ' + String(world.best).padStart(6,'0'), 638, 88, 8, COLORS.muted, 'left', 800);
  label(ctx, 'CHAIN', 779, 36, 8, COLORS.muted, 'center', 900);
  label(ctx, '×' + String(world.combo).padStart(2,'0'), 779, 64, 20, world.combo>1 ? COLORS.amber : '#a0b6bd', 'center', 900);
  if (world.combo > 1) label(ctx, 'LIVE', 779, 88, 7, COLORS.cyan, 'center', 900);
  ctx.strokeStyle = COLORS.line; ctx.beginPath(); ctx.moveTo(835,28); ctx.lineTo(835,94); ctx.stroke();
  label(ctx, 'CORE SHIELD', 862, 36, 8, COLORS.muted, 'left', 900);
  label(ctx, Math.ceil(world.core) + ' / ' + world.coreMax, 862, 65, 16, world.core<35?COLORS.coral:COLORS.text, 'left', 850);
  bar(ctx, 862, 84, 142, 5, world.core, world.coreMax, world.core<35?COLORS.coral:COLORS.cyan);
  ctx.strokeStyle = COLORS.line; ctx.beginPath(); ctx.moveTo(1022,28); ctx.lineTo(1022,94); ctx.stroke();
  label(ctx, 'HULL', 1046, 36, 8, COLORS.muted, 'left', 900);
  for (let i=0;i<world.maxHull;i+=1) {
    ctx.beginPath(); ctx.arc(1054+i*21,67,6,0,Math.PI*2); ctx.fillStyle=i<world.hull?COLORS.coral:'rgba(230,240,242,.1)'; ctx.fill();
  }
  label(ctx, 'SCRAP', 1165, 36, 8, COLORS.muted, 'center', 900);
  label(ctx, String(world.scrap).padStart(3,'0'), 1165, 66, 18, COLORS.amber, 'center', 900);
  label(ctx, world.fluxMode ? 'FLUX' : 'ARC', 1232, 68, 8, world.fluxMode ? COLORS.violet : COLORS.cyan, 'center', 900);
  ctx.globalAlpha = .06 + Math.sin(time * 4) * .015; ctx.fillStyle = COLORS.cyan; ctx.fillRect(18,107,1244,1); ctx.globalAlpha=1;
}

function drawLeftRail(ctx, world) {
  box(ctx, 21, 124, 209, 590, 8, COLORS.panel, 'rgba(123,184,197,.22)');
  label(ctx, 'RELAY STATUS', 38, 147, 9, COLORS.cyan, 'left', 900);
  label(ctx, 'CORE INTEGRITY', 38, 176, 8, COLORS.muted, 'left', 850);
  label(ctx, Math.ceil(world.core) + '%', 211, 176, 11, world.core<35?COLORS.coral:COLORS.text, 'right', 900);
  bar(ctx, 38, 194, 174, 8, world.core, world.coreMax, world.core<35?COLORS.coral:COLORS.cyan);
  label(ctx, 'PILOT HULL', 38, 226, 8, COLORS.muted, 'left', 850);
  label(ctx, world.hull + ' / ' + world.maxHull, 211, 226, 10, COLORS.text, 'right', 900);
  for (let i=0;i<world.maxHull;i+=1) {
    box(ctx, 38+i*30, 241, 23, 6, 3, i<world.hull?COLORS.coral:'rgba(235,246,248,.09)', null);
  }
  ctx.strokeStyle=COLORS.line; ctx.beginPath(); ctx.moveTo(38,268); ctx.lineTo(212,268); ctx.stroke();
  label(ctx, 'CAPACITOR', 38, 290, 8, COLORS.muted, 'left', 850);
  label(ctx, Math.floor(world.flux) + '%', 211, 290, 10, world.flux>=100?COLORS.violet:COLORS.text, 'right', 900);
  bar(ctx, 38, 307, 174, 8, world.flux, RUN.pulseCost, world.flux>=100?COLORS.violet:'#806ec6');
  label(ctx, world.flux>=100?'E · NOVA READY':'E · NOVA', 38, 329, 8, world.flux>=100?COLORS.violet:COLORS.muted, 'left', 850);
  label(ctx, 'INCOMING', 38, 369, 9, COLORS.amber, 'left', 900);
  const active = world.enemies.filter((enemy)=>enemy.alive);
  label(ctx, String(active.length + world.waveSpawnLeft).padStart(2,'0') + ' HOSTILES', 211, 369, 9, COLORS.text, 'right', 900);
  const types = [['mite','SCOUTS',COLORS.coral],['pylon','PYLONS',COLORS.violet],['bulwark','BULWARKS',COLORS.blue]];
  types.forEach(([kind,name,color],index)=>{
    const count=active.filter((enemy)=>enemy.kind===kind).length;
    ctx.beginPath(); ctx.arc(46, 400+index*29, 4,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    label(ctx,name,59,400+index*29,8,COLORS.muted,'left',800);
    label(ctx,String(count).padStart(2,'0'),211,400+index*29,9,COLORS.text,'right',900);
  });
  const boss=active.find((enemy)=>enemy.kind==='boss');
  if (boss) {
    ctx.strokeStyle=COLORS.line; ctx.beginPath(); ctx.moveTo(38,498); ctx.lineTo(212,498); ctx.stroke();
    label(ctx,'BOSS SIGNAL',38,520,8,COLORS.coral,'left',900);
    label(ctx,boss.name,38,540,9,COLORS.text,'left',850);
    label(ctx,boss.phase===2?'PHASE II · BURST RAMPED':'PHASE I · WATCH THE TELEGRAPH',38,553,7,boss.phase===2?COLORS.coral:COLORS.amber,'left',850);
    bar(ctx,38,565,174,7,boss.hp,boss.maxHp,boss.color);
    label(ctx,String(Math.ceil(boss.hp))+' HP',211,582,8,COLORS.muted,'right',800);
  } else {
    ctx.strokeStyle=COLORS.line; ctx.beginPath(); ctx.moveTo(38,498); ctx.lineTo(212,498); ctx.stroke();
    label(ctx,'FIELD NOTE',38,520,8,COLORS.cyan,'left',900);
    const lines = world.fluxMode ? ['FLUX DRAW IS LIVE','ABSORB SHOTS · SIPHON','SCRAP PULLS TO YOU'] : ['ARC FIRE IS LIVE','AIM AT A TARGET','THEN HOLD THE TRIGGER'];
    lines.forEach((line,i)=>label(ctx,line,38,546+i*17,8,i===0?COLORS.text:COLORS.muted,'left',i===0?850:700));
  }
  ctx.strokeStyle=COLORS.line; ctx.beginPath(); ctx.moveTo(38,616); ctx.lineTo(212,616); ctx.stroke();
  label(ctx,'DASH DRIVE',38,639,8,COLORS.muted,'left',850);
  const ready=world.player.dashCooldown<=0;
  label(ctx,ready?'READY':'CHARGING',211,639,8,ready?COLORS.cyan:COLORS.amber,'right',900);
  bar(ctx,38,656,174,6,ready?1:1-world.player.dashCooldown/(1.28*world.rig.dashScale),1,COLORS.cyan);
  label(ctx,'SPACE TO BREAK CONTACT',38,687,7,COLORS.muted,'left',800);
}

function drawRightRail(ctx, world) {
  box(ctx, 1029, 124, 230, 590, 8, COLORS.panel, 'rgba(123,184,197,.22)');
  label(ctx,'RUN BUILD',1047,147,9,COLORS.amber,'left',900);
  label(ctx,world.modules.length+' / 09',1240,147,9,COLORS.text,'right',900);
  const equipped=world.modules.slice(-6);
  if (!equipped.length) {
    label(ctx,'NO MODULES SLOTTED',1047,187,8,COLORS.muted,'left',800);
    label(ctx,'CLEAR A WAVE TO PICK',1047,205,8,COLORS.muted,'left',800);
  }
  equipped.forEach((id,index)=>{
    const module=MODULES.find((item)=>item.id===id);
    const y=178+index*43;
    box(ctx,1046,y,22,22,5,'rgba(85,240,210,.09)','rgba(85,240,210,.22)');
    label(ctx,String(index+1).padStart(2,'0'),1057,y+11,8,module?.color||COLORS.cyan,'center',900);
    label(ctx,module?.name||id.toUpperCase(),1077,y+7,8,COLORS.text,'left',900);
    label(ctx,module?.tag||'MODULE',1077,y+22,7,COLORS.muted,'left',800);
    box(ctx,1231,y+7,8,8,4,module?.color||COLORS.cyan,null);
  });
  const base=equipped.length?178+equipped.length*43:245;
  const hiddenModules=world.modules.length-equipped.length;
  if (hiddenModules>0) label(ctx,'+'+hiddenModules+' EARLIER MODULES',1047,base-7,7,COLORS.muted,'left',750);
  ctx.strokeStyle=COLORS.line; ctx.beginPath(); ctx.moveTo(1047,base+8); ctx.lineTo(1240,base+8); ctx.stroke();
  label(ctx,'RIG READOUT',1047,base+30,8,COLORS.cyan,'left',900);
  const stats=[['ARC DMG',world.rig.damage],['BOLTS',world.rig.bolts],['FLUX RADIUS',Math.round(world.rig.fluxRadius)],['FIRE RATE',Math.round(100/world.rig.fireRate)+'%']];
  stats.forEach(([name,value],index)=>{
    const y=base+54+index*25;
    label(ctx,name,1047,y,7,COLORS.muted,'left',800);
    label(ctx,String(value),1240,y,9,COLORS.text,'right',900);
  });
  const trackY=base+164;
  label(ctx,'FIELD PATCH',1047,trackY,8,COLORS.amber,'left',900);
  label(ctx,String(world.scrap).padStart(3,'0'),1240,trackY,10,COLORS.text,'right',900);
  bar(ctx,1047,trackY+17,193,5,world.scrap,100,COLORS.amber);
  label(ctx,'F · 10 SCRAP → CORE +18',1047,trackY+37,8,COLORS.muted,'left',800);
}

function drawBottomHud(ctx, world) {
  box(ctx,21,728,1238,52,8,'rgba(7,15,24,.95)','rgba(123,184,197,.22)');
  const controls=[['WASD','MOVE'],['LMB','ARC FIRE'],['Q','FLUX / ARC'],['E','NOVA'],['SPACE','DASH'],['F','PATCH'],['P','PAUSE'],['M','SOUND']];
  const starts=[39,160,280,400,520,700,820,940];
  controls.forEach(([key,name],i)=>{
    const x=starts[i];
    box(ctx,x,740,key==='SPACE'?62:35,25,4,'rgba(219,241,243,.065)','rgba(170,210,219,.2)');
    label(ctx,key,x+(key==='SPACE'?31:17.5),752,8,COLORS.text,'center',900);
    label(ctx,name,x+(key==='SPACE'?70:43),752,8,i===2&&world.fluxMode?COLORS.violet:COLORS.muted,'left',800);
  });
  const right=world.fluxMode?'FLUX MODE · SCRAP + PROJECTILES FEED THE CAPACITOR':'ARC MODE · AIM WITH THE POINTER, HOLD LEFT MOUSE TO FIRE';
  label(ctx,right,1237,770,7,world.fluxMode?COLORS.violet:COLORS.cyan,'right',850);
}

function drawNotice(ctx, world) {
  if (world.noticeTimer <= 0 || !world.notice) return;
  const alpha=Math.min(1,world.noticeTimer*2.5);
  ctx.globalAlpha=alpha;
  box(ctx,416,112,448,26,13,'rgba(7,15,24,.93)','rgba(125,204,202,.35)');
  label(ctx,world.notice,640,125,9,world.notice.includes('BREACH')?COLORS.coral:COLORS.amber,'center',900);
  ctx.globalAlpha=1;
}

export function renderWorld(ctx, world, time, pointer) {
  drawBackdrop(ctx,time,world.wave);
  drawTopHud(ctx,world,time);
  drawArena(ctx,time,world);
  drawLeftRail(ctx,world);
  drawRightRail(ctx,world);
  drawCombat(ctx,world,time);
  drawBottomHud(ctx,world);
  drawNotice(ctx,world);
  if (pointer && world.screen==='play') {
    ctx.beginPath(); ctx.arc(pointer.x,pointer.y,7,0,Math.PI*2); ctx.strokeStyle='rgba(238,247,250,.6)'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pointer.x-11,pointer.y); ctx.lineTo(pointer.x-5,pointer.y); ctx.moveTo(pointer.x+5,pointer.y); ctx.lineTo(pointer.x+11,pointer.y); ctx.moveTo(pointer.x,pointer.y-11); ctx.lineTo(pointer.x,pointer.y-5); ctx.moveTo(pointer.x,pointer.y+5); ctx.lineTo(pointer.x,pointer.y+11); ctx.stroke();
  }
}
