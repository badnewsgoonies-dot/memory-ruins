"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIO = exports.AUDIO_DIR = void 0;
exports.getAudioPath = getAudioPath;
// Auto-generated audio registry — minimal integration
exports.AUDIO_DIR = 'assets/audio/';
exports.AUDIO = {
    MUSIC_BACKGROUND: `${exports.AUDIO_DIR}background.ogg`,
    SFX_CLICK: `${exports.AUDIO_DIR}sfx_click.wav`,
};
function getAudioPath(key) {
    return exports.AUDIO[key];
}
