import { createRenderer } from './renderer.js';
import '../input/controls.js';

const canvas = document.getElementById('gameCanvas');
const renderer = createRenderer(canvas);

const player = { x: 100, y: 100, w: 40, h: 40, speed: 200 };

let lastTime = performance.now();

function gameLoop(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  if (window.inputState.left) player.x -= player.speed * dt;
  if (window.inputState.right) player.x += player.speed * dt;
  if (window.inputState.up) player.y -= player.speed * dt;
  if (window.inputState.down) player.y += player.speed * dt;

  player.x = Math.max(0, Math.min(renderer.width - player.w, player.x));
  player.y = Math.max(0, Math.min(renderer.height - player.h, player.y));

  renderer.clear();
  renderer.drawRect(player.x, player.y, player.w, player.h, '#1e90ff');

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
