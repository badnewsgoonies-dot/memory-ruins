import { parseRoomTemplate, validateRoomTemplate, MIN_ROOM_DIM, MAX_ROOM_DIM } from '../../src/rooms/roomTemplate';

describe('RoomTemplate parsing and validation', () => {
  test('valid template parses successfully', () => {
    const tpl = {
      id: 'room1',
      name: 'Test Room',
      width: 2,
      height: 2,
      tiles: [0, 1, 2, 3],
      spawnPoints: [{ x: 0, y: 0, type: 'player' }],
      backgroundMusic: null,
    };
    expect(() => parseRoomTemplate(tpl)).not.toThrow();
    const res = validateRoomTemplate(tpl);
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  test('tiles length mismatch is reported', () => {
    const tpl = {
      id: 'bad1',
      name: 'Bad Tiles',
      width: 2,
      height: 2,
      tiles: [0, 1, 2], // wrong length
    };
    const res = validateRoomTemplate(tpl);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.startsWith('tiles: expected length'))).toBe(true);
    expect(() => parseRoomTemplate(tpl)).toThrow();
  });

  test('spawn point out of bounds is invalid', () => {
    const tpl = {
      id: 'bad2',
      name: 'Bad Spawn',
      width: 2,
      height: 2,
      tiles: [0, 0, 0, 0],
      spawnPoints: [{ x: 3, y: 0, type: 'player' }],
    };
    const res = validateRoomTemplate(tpl);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.includes('out of bounds'))).toBe(true);
  });

  test('rejects non-object inputs', () => {
    const res = validateRoomTemplate(null);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  test('enforces min/max dimensions', () => {
    const small = { id: 's', name: 's', width: 0, height: 1, tiles: [] };
    const big = { id: 'b', name: 'b', width: MAX_ROOM_DIM + 1, height: 1, tiles: [] };
    expect(validateRoomTemplate(small).valid).toBe(false);
    expect(validateRoomTemplate(big).valid).toBe(false);
  });
});
