export function bindInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  const pointer = { x: 630, y: 421, down: false };

  const keyName = (event) => event.key.toLowerCase() === ' ' ? 'space' : event.key.toLowerCase();
  window.addEventListener('keydown', (event) => {
    const key = keyName(event);
    if (['arrowup','arrowdown','arrowleft','arrowright','space'].includes(key)) event.preventDefault();
    if (!held.has(key)) pressed.add(key);
    held.add(key);
  });
  window.addEventListener('keyup', (event) => held.delete(keyName(event)));
  window.addEventListener('blur', () => { held.clear(); pointer.down = false; });
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 1280;
    pointer.y = ((event.clientY - rect.top) / rect.height) * 800;
  });
  canvas.addEventListener('pointerdown', (event) => {
    canvas.focus();
    if (event.button === 0) pointer.down = true;
  });
  window.addEventListener('pointerup', (event) => { if (event.button === 0) pointer.down = false; });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    held,
    pointer,
    isDown(...keys) { return keys.some((key) => held.has(key)); },
    wasPressed(...keys) { return keys.some((key) => pressed.has(key)); },
    consumePressed() { const keys = new Set(pressed); pressed.clear(); return keys; },
  };
}
