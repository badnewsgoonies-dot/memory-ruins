"use strict";
const { Player } = require('../../src/platforming/physics');
const C = require('../../src/platforming/constants');
describe('Platforming physics', () => {
    test('gravity causes fall and stops on floor', () => {
        const floorRow = 5; // tile row index where floor begins
        const tilemap = { isSolidAt: (tx, ty) => ty >= floorRow };
        const startY = (floorRow - 3) * C.TILE_SIZE - 16;
        const player = new Player(50, startY);
        const dt = 1 / 60;
        for (let i = 0; i < 300; i++) {
            player.update(dt, tilemap);
            if (player.grounded)
                break;
        }
        expect(player.grounded).toBe(true);
        expect(player.vel.y).toBe(0);
        const bottomY = player.pos.y + player.height;
        expect(Math.abs(bottomY - floorRow * C.TILE_SIZE)).toBeLessThan(2);
    });
    test('jump applies velocity and causes ascent then landing', () => {
        const floorRow = 5;
        const tilemap = { isSolidAt: (tx, ty) => ty >= floorRow };
        const startY = (floorRow - 3) * C.TILE_SIZE - 16;
        const player = new Player(50, startY);
        // settle to ground
        for (let i = 0; i < 300; i++) {
            player.update(1 / 60, tilemap);
            if (player.grounded)
                break;
        }
        expect(player.grounded).toBe(true);
        player.jump();
        expect(player.vel.y).toBe(C.JUMP_VELOCITY);
        const initialY = player.pos.y;
        player.update(1 / 60, tilemap);
        expect(player.pos.y).toBeLessThan(initialY);
        // let player land again
        for (let i = 0; i < 600; i++) {
            player.update(1 / 60, tilemap);
            if (player.grounded)
                break;
        }
        expect(player.grounded).toBe(true);
    });
    test('collision prevents passing through ceiling', () => {
        const tilemap = { isSolidAt: (tx, ty) => ty <= 1 || ty >= 6 };
        const player = new Player(50, 3 * C.TILE_SIZE - 16);
        player.vel.y = -1000; // strong upward velocity trying to pass ceiling
        for (let i = 0; i < 60; i++) {
            player.update(1 / 60, tilemap);
        }
        const topTile = Math.floor(player.pos.y / C.TILE_SIZE);
        expect(topTile).toBeGreaterThanOrEqual(2);
    });
});
