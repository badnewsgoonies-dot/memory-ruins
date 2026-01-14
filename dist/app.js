"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Game_instances, _Game_canvas, _Game_ctx, _Game_tilemap, _Game_player, _Game_inputManager, _Game_lastTime, _Game_init, _Game_gameLoop, _Game_update, _Game_render;
Object.defineProperty(exports, "__esModule", { value: true });
const tilemap_js_1 = require("./tilemap/tilemap.js"); // Assuming tilemap.ts compiles to tilemap.js
const player_js_1 = require("./player.js");
const input_js_1 = require("./input.js");
const constants_js_1 = require("./constants.js"); // Assuming constants.ts compiles to constants.js
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_START_X = 100;
const PLAYER_START_Y = 100;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
class Game {
    constructor() {
        _Game_instances.add(this);
        /** @type {HTMLCanvasElement} */
        _Game_canvas.set(this, void 0);
        /** @type {CanvasRenderingContext2D} */
        _Game_ctx.set(this, void 0);
        /** @type {Tilemap} */
        _Game_tilemap.set(this, void 0);
        /** @type {Player} */
        _Game_player.set(this, void 0);
        /** @type {InputManager} */
        _Game_inputManager.set(this, void 0);
        /** @type {number} */
        _Game_lastTime.set(this, 0);
        /**
         * @param {number} currentTime
         */
        _Game_gameLoop.set(this, (currentTime) => {
            const dt = (currentTime - __classPrivateFieldGet(this, _Game_lastTime, "f")) / 1000; // Delta time in seconds
            __classPrivateFieldSet(this, _Game_lastTime, currentTime, "f");
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_update).call(this, dt);
            __classPrivateFieldGet(this, _Game_instances, "m", _Game_render).call(this);
            requestAnimationFrame(__classPrivateFieldGet(this, _Game_gameLoop, "f"));
        }
        /**
         * @param {number} dt
         */
        );
        __classPrivateFieldSet(this, _Game_canvas, document.createElement('canvas'), "f");
        __classPrivateFieldGet(this, _Game_canvas, "f").width = CANVAS_WIDTH;
        __classPrivateFieldGet(this, _Game_canvas, "f").height = CANVAS_HEIGHT;
        document.body.appendChild(__classPrivateFieldGet(this, _Game_canvas, "f"));
        __classPrivateFieldSet(this, _Game_ctx, __classPrivateFieldGet(this, _Game_canvas, "f").getContext('2d'), "f");
        __classPrivateFieldSet(this, _Game_tilemap, new tilemap_js_1.Tilemap('assets/levels/test_room.json'), "f");
        __classPrivateFieldSet(this, _Game_player, new player_js_1.Player(PLAYER_START_X, PLAYER_START_Y, PLAYER_WIDTH, PLAYER_HEIGHT), "f");
        __classPrivateFieldSet(this, _Game_inputManager, new input_js_1.InputManager(), "f");
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_init).call(this);
    }
}
_Game_canvas = new WeakMap(), _Game_ctx = new WeakMap(), _Game_tilemap = new WeakMap(), _Game_player = new WeakMap(), _Game_inputManager = new WeakMap(), _Game_lastTime = new WeakMap(), _Game_gameLoop = new WeakMap(), _Game_instances = new WeakSet(), _Game_init = async function _Game_init() {
    await __classPrivateFieldGet(this, _Game_tilemap, "f").load();
    requestAnimationFrame(__classPrivateFieldGet(this, _Game_gameLoop, "f"));
}, _Game_update = function _Game_update(dt) {
    // Player input
    if (__classPrivateFieldGet(this, _Game_inputManager, "f").isKeyPressed('Space')) {
        __classPrivateFieldGet(this, _Game_player, "f").jump();
    }
    // Basic horizontal movement for testing
    if (__classPrivateFieldGet(this, _Game_inputManager, "f").isKeyPressed('ArrowLeft')) {
        __classPrivateFieldGet(this, _Game_player, "f").vel.x = -100;
    }
    else if (__classPrivateFieldGet(this, _Game_inputManager, "f").isKeyPressed('ArrowRight')) {
        __classPrivateFieldGet(this, _Game_player, "f").vel.x = 100;
    }
    else {
        __classPrivateFieldGet(this, _Game_player, "f").vel.x = 0;
    }
    __classPrivateFieldGet(this, _Game_player, "f").update(dt, __classPrivateFieldGet(this, _Game_tilemap, "f"));
}, _Game_render = function _Game_render() {
    __classPrivateFieldGet(this, _Game_ctx, "f").clearRect(0, 0, __classPrivateFieldGet(this, _Game_canvas, "f").width, __classPrivateFieldGet(this, _Game_canvas, "f").height);
    __classPrivateFieldGet(this, _Game_tilemap, "f").render(__classPrivateFieldGet(this, _Game_ctx, "f"));
    // Render player
    __classPrivateFieldGet(this, _Game_ctx, "f").fillStyle = 'blue';
    __classPrivateFieldGet(this, _Game_ctx, "f").fillRect(__classPrivateFieldGet(this, _Game_player, "f").pos.x, __classPrivateFieldGet(this, _Game_player, "f").pos.y, __classPrivateFieldGet(this, _Game_player, "f").width, __classPrivateFieldGet(this, _Game_player, "f").height);
};
new Game();
