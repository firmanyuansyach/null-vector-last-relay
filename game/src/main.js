import { VIEW } from './config.js';
import { bindInput } from './input.js';
import { playSound, toggleMute } from './audio.js';
import { chooseModule, createWorld, startRun, updateWorld } from './world.js';
import { renderWorld } from './render.js';

const canvas = document.querySelector('#field');
const ctx = canvas.getContext('2d', { alpha: false });
const frame = document.querySelector('#frame');
const input = bindInput(canvas);
const overlays = {
  title: document.querySelector('#titleOverlay'),
  upgrade: document.querySelector('#upgradeOverlay'),
  paused: document.querySelector('#pauseOverlay'),
  result: document.querySelector('#resultOverlay'),
};
const world = createWorld();
let previous = performance.now();
let lastScreen = '';
let lastSound = 0;
let panelShownFor = '';

function fitStage() {
  const width = Math.max(320, Math.min(window.innerWidth - 24, (window.innerHeight - 24) * 1.6));
  frame.style.width = width + 'px';
  frame.style.height = width / 1.6 + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = VIEW.width * dpr;
  canvas.height = VIEW.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function begin() {
  startRun(world);
  input.pointer.down = false;
  document.querySelector('#announcement').textContent = 'Breach started. Move with WASD, aim and hold the left mouse button to fire.';
}

function showOffers() {
  const host = document.querySelector('#upgradeGrid');
  host.replaceChildren();
  world.offers.forEach((module, index) => {
    const button = document.createElement('button');
    button.className = 'upgrade-option';
    button.type = 'button';
    button.innerHTML = `<span class="number">${index + 1}</span><span class="tag">${module.tag}</span><strong>${module.name}</strong><small>${module.text}</small>`;
    button.addEventListener('click', () => chooseModule(world, index));
    host.append(button);
  });
  host.querySelector('button')?.focus();
}

function updatePanels() {
  if (world.screen === lastScreen && panelShownFor === world.screen) return;
  Object.entries(overlays).forEach(([key, element]) => element.classList.toggle('hidden', key !== (world.screen === 'win' || world.screen === 'lose' ? 'result' : world.screen)));
  if (world.screen === 'upgrade' && panelShownFor !== 'upgrade') showOffers();
  if (world.screen === 'win' || world.screen === 'lose') {
    const won = world.screen === 'win';
    document.querySelector('#resultKicker').innerHTML = `<i></i> ${won ? 'SIGNAL REPORT · COMPLETE' : 'SIGNAL REPORT · LOST'}`;
    document.querySelector('#resultTitle').textContent = won ? 'RELAY RESTORED.' : 'THE RELAY WENT DARK.';
    document.querySelector('#resultCopy').textContent = won
      ? 'Eight waves broken. Both breach bosses are offline. The signal belongs to the living again.'
      : world.core <= 0
        ? 'The hostiles reached the core. The relay is silent, but the next pilot can learn from this run.'
        : 'Your hull gave out inside the breach. Rebuild the rig and take another line.';
    document.querySelector('#resultScore').textContent = String(world.score).padStart(7, '0');
    document.querySelector('#resultWave').textContent = String(Math.min(world.wave, 8)).padStart(2, '0') + ' / 08';
    document.querySelector('#resultChain').textContent = '×' + world.bestChain;
    document.querySelector('#restartButton').focus();
  }
  if (world.screen === 'title') document.querySelector('#startButton').focus();
  if (world.screen === 'paused') document.querySelector('#resumeButton').focus();
  lastScreen = world.screen;
  panelShownFor = world.screen;
}

document.querySelector('#startButton').addEventListener('click', begin);
document.querySelector('#restartButton').addEventListener('click', begin);
document.querySelector('#resumeButton').addEventListener('click', () => { world.screen = 'play'; panelShownFor = 'paused'; });
window.addEventListener('resize', fitStage);
fitStage();

function frameLoop(now) {
  const dt = Math.min((now - previous) / 1000, .05);
  previous = now;
  const pressed = input.consumePressed();
  const wasPressed = (...keys) => keys.some((key) => pressed.has(key));

  if (wasPressed('m')) world.mute = toggleMute();
  if (world.screen === 'title' && wasPressed('space','enter')) begin();
  else if (world.screen === 'upgrade') {
    if (wasPressed('1')) chooseModule(world, 0);
    else if (wasPressed('2')) chooseModule(world, 1);
    else if (wasPressed('3')) chooseModule(world, 2);
  } else if (world.screen === 'paused') {
    if (wasPressed('p','escape')) world.screen = 'play';
  } else if (world.screen === 'play') {
    if (wasPressed('p','escape')) world.screen = 'paused';
    else updateWorld(world, { pointer: input.pointer, isDown: (...keys) => input.isDown(...keys), wasPressed }, dt);
  } else if ((world.screen === 'win' || world.screen === 'lose') && wasPressed('r','space','enter')) begin();

  if (world.soundSerial !== lastSound) {
    playSound(world.soundEvent);
    lastSound = world.soundSerial;
  }
  updatePanels();
  renderWorld(ctx, world, now / 1000, input.pointer);
  requestAnimationFrame(frameLoop);
}

requestAnimationFrame(frameLoop);
