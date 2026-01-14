"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const C = __importStar(require("../constants"));
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
        if (this.vel.y > C.MAX_FALL_SPEED)
            this.vel.y = C.MAX_FALL_SPEED;
    }
    update(dt, tilemap) {
        this.applyGravity(dt);
        // Horizontal movement and collision
        const targetX = this.pos.x + this.vel.x * dt;
        if (!this._collidesAt(targetX, this.pos.y, tilemap)) {
            this.pos.x = targetX;
        }
        else {
            this.vel.x = 0;
        }
        // Vertical movement and collision (separate axis for robust resolution)
        const targetY = this.pos.y + this.vel.y * dt;
        if (!this._collidesAt(this.pos.x, targetY, tilemap)) {
            this.pos.y = targetY;
            this.grounded = false;
        }
        else {
            // Resolve collision: if moving down, snap to tile top; if moving up, snap to tile bottom
            if (this.vel.y > 0) {
                const tileY = Math.floor((this.pos.y + this.height + this.vel.y * dt) / C.TILE_SIZE);
                this.pos.y = tileY * C.TILE_SIZE - this.height - C.EPSILON;
                this.grounded = true;
            }
            else {
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
                if (tilemap.isSolidAt(tx, ty))
                    return true;
            }
        }
        return false;
    }
}
exports.Player = Player;
