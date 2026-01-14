"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInput = createInput;
function createInput() {
    const keys = { left: false, right: false, up: false, down: false, jump: false };
    function keyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
                keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
                keys.down = true;
                break;
            case ' ':
                keys.jump = true;
                e.preventDefault();
                break;
            default: break;
        }
    }
    function keyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
                keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
                keys.down = false;
                break;
            case ' ':
                keys.jump = false;
                break;
            default: break;
        }
    }
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    // Return a small API surface for the input system
    return { keys };
}
