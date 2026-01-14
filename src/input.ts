export const REWIND_KEY = 'KeyR';

let keys: { [key: string]: boolean } = {};
let keysJustPressed: { [key: string]: boolean } = {};
let rewindCallback: Function | null = null;

export function initInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (!e.repeat) {
            keysJustPressed[e.code] = true;
            if (e.code === REWIND_KEY && rewindCallback) {
                rewindCallback();
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

export function setRewindCallback(callback: Function) {
    rewindCallback = callback;
}

export function isKeyPressed(keyCode: string): boolean {
    return keys[keyCode] === true;
}

export function isKeyJustPressed(keyCode: string): boolean {
    if (keysJustPressed[keyCode]) {
        keysJustPressed[keyCode] = false;
        return true;
    }
    return false;
}

export function clearJustPressedKeys() {
    keysJustPressed = {};
}

/**
 * For testing purposes only: directly set the state of a "just pressed" key.
 * @param {string} keyCode - The `event.code` of the key.
 * @param {boolean} state - The state to set (true for just pressed, false otherwise).
 */
export function _setKeyJustPressed(keyCode: string, state: boolean) {
    keysJustPressed[keyCode] = state;
}

/**
 * For testing purposes only: clears the internal keys and keysJustPressed states.
 * This is useful for resetting the input system between tests.
 */
export function _clearKeys() {
    keys = {};
    keysJustPressed = {};
}