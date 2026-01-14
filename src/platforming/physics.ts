import * as C from '../constants';

export interface Tilemap {
  isSolidAt(tileX: number, tileY: number): boolean;
}

export type Vec2 = { x: number; y: number };

export class Player {
  pos: Vec2;
  vel: Vec2;
  width: number;
  height: number;
  grounded: boolean;

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

  applyGravity(dt: number) {
    this.vel.y += C.GRAVITY * dt;
    if (this.vel.y > C.MAX_FALL_SPEED) this.vel.y = C.MAX_FALL_SPEED;
  }

  update(dt: number, tilemap: Tilemap) {
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

  _collidesAt(x: number, y: number, tilemap: Tilemap) {
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
