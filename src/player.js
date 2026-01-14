import * as C from './constants.js'; // Assuming constants.ts will be compiled to constants.js

export class Player {
  /** @type {{x: number, y: number}} */
  pos;
  /** @type {{x: number, y: number}} */
  vel;
  /** @type {number} */
  width;
  /** @type {number} */
  height;
  /** @type {boolean} */
  grounded;

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(x = 0, y = 0, width = 28, height = 28) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.width = width;
    this.height = height;
    this.grounded = false;
  }

  jump() {
    if (this.grounded) {
      this.vel.y = C.JUMP_VELOCITY;
      this.grounded = false;
    }
  }

  /**
   * @param {number} dt
   */
  applyGravity(dt) {
    this.vel.y += C.GRAVITY * dt;
    if (this.vel.y > C.MAX_FALL_SPEED) this.vel.y = C.MAX_FALL_SPEED;
  }

  /**
   * @param {number} dt
   * @param {{isSolidAt: (tileX: number, tileY: number) => boolean}} tilemap
   */
  update(dt, tilemap) {
    this.applyGravity(dt);

    // Horizontal movement and collision
    const targetX = this.pos.x + this.vel.x * dt;
    if (!this._collidesAt(targetX, this.pos.y, tilemap)) {
      this.pos.x = targetX;
    } else {
      this.vel.x = 0;
    }

    // Vertical movement and collision (separate axis for robust resolution)
    const targetY = this.pos.y + this.vel.y * dt;
    if (!this._collidesAt(this.pos.x, targetY, tilemap)) {
      this.pos.y = targetY;
      this.grounded = false;
    } else {
      // Resolve collision: if moving down, snap to tile top; if moving up, snap to tile bottom
      if (this.vel.y > 0) {
        const tileY = Math.floor((this.pos.y + this.height + this.vel.y * dt) / C.TILE_SIZE);
        this.pos.y = tileY * C.TILE_SIZE - this.height - C.EPSILON;
        this.grounded = true;
      } else {
        const tileY = Math.floor((this.pos.y + this.vel.y * dt) / C.TILE_SIZE);
        this.pos.y = (tileY + 1) * C.TILE_SIZE + C.EPSILON;
      }
      this.vel.y = 0;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {{isSolidAt: (tileX: number, tileY: number) => boolean}} tilemap
   */
  _collidesAt(x, y, tilemap) {
    const left = Math.floor(x / C.TILE_SIZE);
    const right = Math.floor((x + this.width - C.EPSILON) / C.TILE_SIZE);
    const top = Math.floor(y / C.TILE_SIZE);
    const bottom = Math.floor((y + this.height - C.EPSILON) / C.TILE_SIZE);

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (tilemap.isSolidAt(tx, ty)) return true;
      }
    }
    return false;
  }
}
