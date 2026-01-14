let keys = {};
let keysJustPressed = {}; // New object to track keys pressed once per frame

export function initInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (!e.repeat) { // Only set justPressed if the key is not being held down
            keysJustPressed[e.code] = true;
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
        // Optionally, clear from keysJustPressed on keyup if you don't clear all at once
        // However, clearing all at the end of the frame is usually sufficient.
    });
}

export function isKeyPressed(keyCode) {
    return keys[keyCode] === true;
}

/**
 * Checks if a key was just pressed (not held down) and consumes the press event.
 * @param {string} keyCode - The `event.code` of the key to check (e.g., 'KeyR', 'Space').
 * @returns {boolean} - True if the key was just pressed, false otherwise.
 */
export function isKeyJustPressed(keyCode) {
    if (keysJustPressed[keyCode]) {
        keysJustPressed[keyCode] = false; // Consume the press
        return true;
    }
    return false;
}

/**
 * Clears all "just pressed" key states. Should be called once per game loop frame.
 */
export function clearJustPressedKeys() {
    keysJustPressed = {}; // Reset all just pressed states
}
