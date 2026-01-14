import { Player } from '../src/player.js';
import { JUMP_VELOCITY, GRAVITY, MAX_FALL_SPEED, TILE_SIZE, EPSILON } from '../src/constants.js';

describe('Player', () => {
  let player;
  let mockTilemap;

  beforeEach(() => {
    player = new Player(0, 0);
    mockTilemap = {
      isSolidAt: jest.fn(() => false), // Assume no solids by default
    };
  });

  test('player jumps when grounded and spacebar is pressed', () => {
    player.grounded = true;
    player.jump();
    expect(player.vel.y).toBe(JUMP_VELOCITY);
    expect(player.grounded).toBe(false);
  });

  test('player does not jump when not grounded', () => {
    player.grounded = false;
    player.vel.y = 100; // Give some initial velocity
    player.jump();
    expect(player.vel.y).toBe(100); // Velocity should not change
  });

  test('applyGravity correctly applies gravity and caps fall speed', () => {
    player.vel.y = 0;
    player.applyGravity(1); // 1 second delta time
    expect(player.vel.y).toBe(GRAVITY);

    player.vel.y = MAX_FALL_SPEED - 100;
    player.applyGravity(1);
    expect(player.vel.y).toBe(MAX_FALL_SPEED); // Should be capped at MAX_FALL_SPEED
  });

  test('player falls if not grounded and no collision below', () => {
    player.pos.y = 0;
    player.vel.y = 0;
    player.grounded = false;
    mockTilemap.isSolidAt.mockReturnValue(false); // No solids below

    player.update(0.1, mockTilemap); // Simulate a small time step
    expect(player.vel.y).toBeGreaterThan(0); // Should be falling
    expect(player.grounded).toBe(false);
  });
});