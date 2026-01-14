// Physics & gameplay constants
export const GRAVITY = 2000; // pixels per second squared
export const JUMP_VELOCITY = -700; // initial jump velocity (px/s), negative = up
export const MAX_FALL_SPEED = 1200; // terminal velocity (px/s)

// Core layout constants (pulled from various modules to avoid magic numbers)
export const TILE_SIZE = 32; // tile size in pixels
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Player spawn / sizing
export const PLAYER_START_X = 100;
export const PLAYER_START_Y = 100;
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 32;
export const PLAYER_SIZE = 40; // alternative size used by some renderer modules

// Movement
export const PLAYER_MOVE_SPEED = 100;

// Small epsilon for floating comparisons
export const EPSILON = 0.0001; // small value to avoid floating point edge cases

// Server defaults
export const DEFAULT_SERVER_PORT = 3000;
