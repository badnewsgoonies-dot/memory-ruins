/* Room template data structure and validation
 * Minimal, type-safe definitions for room templates used by the game.
 * No magic numbers: expose named constants for bounds and defaults.
 */

export const MIN_ROOM_DIM = 1;
export const MAX_ROOM_DIM = 256;
export const DEFAULT_TILE = 0;

export type Tile = number;

export interface SpawnPoint {
  x: number; // integer, 0-based
  y: number; // integer, 0-based
  type: string; // semantic type (e.g., 'player', 'enemy')
}

export interface RoomTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  // tiles is a flattened row-major array of length width*height. Using numbers for tiles
  // allows flexible tile ids while keeping the on-disk format compact.
  tiles: Tile[];
  spawnPoints?: SpawnPoint[];
  backgroundMusic?: string | null;
  metadata?: Record<string, unknown>;
}

export function validateRoomTemplate(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['template must be an object'] };
  }
  const t = input as any;
  if (!t.id || typeof t.id !== 'string') errors.push('id: required string');
  if (!t.name || typeof t.name !== 'string') errors.push('name: required string');

  if (typeof t.width !== 'number' || !Number.isInteger(t.width)) errors.push('width: integer required');
  else if (t.width < MIN_ROOM_DIM || t.width > MAX_ROOM_DIM) errors.push(`width: must be between ${MIN_ROOM_DIM} and ${MAX_ROOM_DIM}`);

  if (typeof t.height !== 'number' || !Number.isInteger(t.height)) errors.push('height: integer required');
  else if (t.height < MIN_ROOM_DIM || t.height > MAX_ROOM_DIM) errors.push(`height: must be between ${MIN_ROOM_DIM} and ${MAX_ROOM_DIM}`);

  if (!Array.isArray(t.tiles)) errors.push('tiles: array required');
  else if (typeof t.width === 'number' && typeof t.height === 'number') {
    const expected = t.width * t.height;
    if (t.tiles.length !== expected) errors.push(`tiles: expected length ${expected}, got ${t.tiles.length}`);
    for (let i = 0; i < t.tiles.length; i++) {
      const v = t.tiles[i];
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
        errors.push(`tiles[${i}]: must be non-negative number`);
        break;
      }
    }
  }

  if (t.spawnPoints !== undefined) {
    if (!Array.isArray(t.spawnPoints)) errors.push('spawnPoints: array or undefined');
    else {
      for (let i = 0; i < t.spawnPoints.length; i++) {
        const sp = t.spawnPoints[i];
        if (!sp || typeof sp !== 'object') { errors.push(`spawnPoints[${i}]: object required`); break; }
        if (typeof sp.x !== 'number' || !Number.isInteger(sp.x)) { errors.push(`spawnPoints[${i}].x: integer required`); break; }
        if (typeof sp.y !== 'number' || !Number.isInteger(sp.y)) { errors.push(`spawnPoints[${i}].y: integer required`); break; }
        if (typeof sp.type !== 'string') { errors.push(`spawnPoints[${i}].type: string required`); break; }
        if (typeof t.width === 'number' && (sp.x < 0 || sp.x >= t.width)) { errors.push(`spawnPoints[${i}].x: out of bounds`); break; }
        if (typeof t.height === 'number' && (sp.y < 0 || sp.y >= t.height)) { errors.push(`spawnPoints[${i}].y: out of bounds`); break; }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function parseRoomTemplate(input: unknown): RoomTemplate {
  const { valid, errors } = validateRoomTemplate(input);
  if (!valid) throw new Error('Invalid RoomTemplate: ' + errors.join('; '));
  return input as RoomTemplate;
}
