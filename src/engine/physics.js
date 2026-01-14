/**
 * Platforming Physics System for Memory Ruins
 * Phase 32 Implementation
 */

// Physics constants (no magic numbers)
export const PHYSICS = {
  GRAVITY: 980,           // pixels/sec² - standard platformer gravity
  JUMP_VELOCITY: -400,    // pixels/sec - negative = upward
  MAX_FALL_SPEED: 600,    // pixels/sec - terminal velocity
  GROUND_FRICTION: 0.85,  // multiplier when grounded
  AIR_CONTROL: 0.6,       // multiplier for horizontal movement in air
  MOVE_SPEED: 240         // horizontal movement speed pixels/sec
};

/**
 * Apply gravity to an entity
 * @param {Object} entity - Entity with vy property
 * @param {number} dt - Delta time in seconds
 */
export function applyGravity(entity, dt) {
  entity.vy += PHYSICS.GRAVITY * dt;
  // Clamp to max fall speed
  if (entity.vy > PHYSICS.MAX_FALL_SPEED) {
    entity.vy = PHYSICS.MAX_FALL_SPEED;
  }
}

/**
 * Apply jump to an entity if grounded
 * @param {Object} entity - Entity with vy and isGrounded properties
 * @returns {boolean} Whether jump was applied
 */
export function applyJump(entity) {
  if (entity.isGrounded) {
    entity.vy = PHYSICS.JUMP_VELOCITY;
    entity.isGrounded = false;
    return true;
  }
  return false;
}

/**
 * Apply horizontal movement with ground/air control
 * @param {Object} entity - Entity with vx property
 * @param {number} direction - -1, 0, or 1
 * @param {number} dt - Delta time in seconds
 */
export function applyHorizontalMovement(entity, direction, dt) {
  const control = entity.isGrounded ? 1.0 : PHYSICS.AIR_CONTROL;
  entity.vx = direction * PHYSICS.MOVE_SPEED * control;
}

/**
 * Apply friction when grounded
 * @param {Object} entity - Entity with vx and isGrounded properties
 */
export function applyFriction(entity) {
  if (entity.isGrounded) {
    entity.vx *= PHYSICS.GROUND_FRICTION;
  }
}

/**
 * Check ground collision (simple y-threshold for now)
 * @param {Object} entity - Entity with y, height, isGrounded properties
 * @param {number} groundY - Y position of ground
 */
export function checkGroundCollision(entity, groundY) {
  const entityBottom = entity.y + entity.height;
  if (entityBottom >= groundY) {
    entity.y = groundY - entity.height;
    entity.vy = 0;
    entity.isGrounded = true;
  } else {
    entity.isGrounded = false;
  }
}

/**
 * Update entity physics for one frame
 * @param {Object} entity - Game entity
 * @param {number} dt - Delta time in seconds
 * @param {number} groundY - Ground Y position
 */
export function updatePhysics(entity, dt, groundY) {
  // Apply gravity
  applyGravity(entity, dt);
  
  // Update position
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;
  
  // Check ground
  checkGroundCollision(entity, groundY);
  
  // Apply friction if grounded and no input
  if (entity.isGrounded && Math.abs(entity.vx) < 1) {
    entity.vx = 0;
  }
}
