const C = require('./constants');

class Player {
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

  applyGravity(dt) {
    this.vel.y += C.GRAVITY * dt;
    if (this.vel.y > C.MAX_FALL_SPEED) this.vel.y = C.MAX_FALL_SPEED;
  }

  update(dt, tilemap) {
    this.applyGravity(dt);

    const targetX = this.pos.x + this.vel.x * dt;
    if (!this._collidesAt(targetX, this.pos.y, tilemap)) {
      this.pos.x = targetX;
    } else {
      this.vel.x = 0;
    }

    const targetY = this.pos.y + this.vel.y * dt;
    if (!this._collidesAt(this.pos.x, targetY, tilemap)) {
      this.pos.y = targetY;
      this.grounded = false;
    } else {
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

module.exports = { Player };
