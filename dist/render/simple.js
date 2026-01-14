"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearScreen = exports.createPlayer = void 0;
const bootstrap_1 = require("../engine/bootstrap");
const createPlayer = (x = bootstrap_1.CANVAS_WIDTH / 2 - bootstrap_1.PLAYER_SIZE / 2, y = bootstrap_1.CANVAS_HEIGHT / 2 - bootstrap_1.PLAYER_SIZE / 2) => ({ x, y, size: bootstrap_1.PLAYER_SIZE });
exports.createPlayer = createPlayer;
const clearScreen = (ctx) => {
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, bootstrap_1.CANVAS_WIDTH, bootstrap_1.CANVAS_HEIGHT);
};
exports.clearScreen = clearScreen;
