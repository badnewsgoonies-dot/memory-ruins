let keys = {};

export function initInput() {
    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

export function isKeyPressed(keyCode) {
    return keys[keyCode] === true;
}