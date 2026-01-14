"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REWIND_KEY = void 0;
exports.initInput = initInput;
exports.setRewindCallback = setRewindCallback;
exports.isKeyPressed = isKeyPressed;
exports.isKeyJustPressed = isKeyJustPressed;
exports.clearJustPressedKeys = clearJustPressedKeys;
exports._setKeyJustPressed = _setKeyJustPressed;
exports._clearKeys = _clearKeys;
exports.REWIND_KEY = 'KeyR';
let keys = {};
let keysJustPressed = {};
let rewindCallback = null;
function initInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (!e.repeat) {
            keysJustPressed[e.code] = true;
            if (e.code === exports.REWIND_KEY && rewindCallback) {
                rewindCallback();
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}
function setRewindCallback(callback) {
    rewindCallback = callback;
}
function isKeyPressed(keyCode) {
    return keys[keyCode] === true;
}
function isKeyJustPressed(keyCode) {
    if (keysJustPressed[keyCode]) {
        keysJustPressed[keyCode] = false;
        return true;
    }
    return false;
}
function clearJustPressedKeys() {
    keysJustPressed = {};
}
/**
 * For testing purposes only: directly set the state of a "just pressed" key.
 * @param {string} keyCode - The `event.code` of the key.
 * @param {boolean} state - The state to set (true for just pressed, false otherwise).
 */
function _setKeyJustPressed(keyCode, state) {
    keysJustPressed[keyCode] = state;
}
/**
 * For testing purposes only: clears the internal keys and keysJustPressed states.
 * This is useful for resetting the input system between tests.
 */
function _clearKeys() {
    keys = {};
    keysJustPressed = {};
}
