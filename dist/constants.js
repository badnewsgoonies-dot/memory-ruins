"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPSILON = exports.TILE_SIZE = exports.MAX_FALL_SPEED = exports.JUMP_VELOCITY = exports.GRAVITY = void 0;
exports.GRAVITY = 2000; // pixels per second squared
exports.JUMP_VELOCITY = -700; // initial jump velocity (px/s), negative = up
exports.MAX_FALL_SPEED = 1200; // terminal velocity (px/s)
exports.TILE_SIZE = 32; // tile size in pixels
exports.EPSILON = 0.0001; // small value to avoid floating point edge cases
