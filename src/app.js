import { Tilemap } from './tilemap/tilemap.js'; // Assuming tilemap.ts compiles to tilemap.js
import { Player } from './player.js';
import { InputManager } from './input.js';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_START_X, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_MOVE_SPEED } from './constants.js'; // Shared constants

class Game {
  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {CanvasRenderingContext2D} */
  #ctx;
  /** @type {Tilemap} */
  #tilemap;
  /** @type {Player} */
  #player;
  /** @type {InputManager} */
  #inputManager;
  /** @type {number} */
  #lastTime = 0;

  constructor() {
    this.#canvas = document.createElement('canvas');
    this.#canvas.width = CANVAS_WIDTH;
    this.#canvas.height = CANVAS_HEIGHT;
    document.body.appendChild(this.#canvas);
    this.#ctx = this.#canvas.getContext('2d');

    this.#tilemap = new Tilemap('assets/levels/test_room.json');
    this.#player = new Player(PLAYER_START_X, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.#inputManager = new InputManager();

    this.#init();
  }

  async #init() {
    await this.#tilemap.load();
    requestAnimationFrame(this.#gameLoop);
  }

  /**
   * @param {number} currentTime
   */
  #gameLoop = (currentTime) => {
    const dt = (currentTime - this.#lastTime) / 1000; // Delta time in seconds
    this.#lastTime = currentTime;

    this.#update(dt);
    this.#render();

    requestAnimationFrame(this.#gameLoop);
  }

  /**
   * @param {number} dt
   */
  #update(dt) {
    // Player input
    if (this.#inputManager.isKeyPressed('Space')) {
      this.#player.jump();
    }
    // Basic horizontal movement for testing
    if (this.#inputManager.isKeyPressed('ArrowLeft')) {
        this.#player.vel.x = -PLAYER_MOVE_SPEED;
    } else if (this.#inputManager.isKeyPressed('ArrowRight')) {
        this.#player.vel.x = PLAYER_MOVE_SPEED;
    } else {
        this.#player.vel.x = 0;
    }


    this.#player.update(dt, this.#tilemap);
  }

  #render() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#tilemap.render(this.#ctx);

    // Render player
    this.#ctx.fillStyle = 'blue';
    this.#ctx.fillRect(this.#player.pos.x, this.#player.pos.y, this.#player.width, this.#player.height);
  }
}

new Game();