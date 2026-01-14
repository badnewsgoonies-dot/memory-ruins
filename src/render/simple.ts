import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE } from '../engine/bootstrap';

export interface Player { x: number; y: number; size: number }

export const createPlayer = (x = CANVAS_WIDTH/2 - PLAYER_SIZE/2, y = CANVAS_HEIGHT/2 - PLAYER_SIZE/2): Player => ({ x, y, size: PLAYER_SIZE });

export const clearScreen = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
