"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindWindowKeys = exports.createKeyMap = void 0;
const createKeyMap = () => ({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false });
exports.createKeyMap = createKeyMap;
const bindWindowKeys = (keys) => {
    window.addEventListener('keydown', (e) => { if (e.key in keys)
        keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { if (e.key in keys)
        keys[e.key] = false; });
};
exports.bindWindowKeys = bindWindowKeys;
