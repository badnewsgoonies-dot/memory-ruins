"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioManager = createAudioManager;
// Simple cross-environment audio manager. In browsers uses HTMLAudioElement; in Node it's a no-op logger.
function createAudioManager() {
    const MUSIC_DEFAULT_VOLUME = 0.6;
    const SFX_DEFAULT_VOLUME = 0.8;
    function clampVolume(v) { return Math.max(0, Math.min(1, Number(v) || 0)); }
    const ASSETS = {
        music_theme: '/assets/audio/music_theme.mp3',
        music_main: '/assets/audio/music_main.ogg',
        background: '/assets/audio/background.ogg',
        hit: '/assets/audio/sfx_hit.wav',
        jump: '/assets/audio/sfx_jump.wav',
        coin: '/assets/audio/sfx_coin.wav',
        click: '/assets/audio/sfx_click.wav'
    };
    let musicAudio = null;
    let musicVolume = MUSIC_DEFAULT_VOLUME;
    let sfxVolume = SFX_DEFAULT_VOLUME;
    function isBrowser() {
        return (typeof window !== 'undefined' && typeof document !== 'undefined');
    }
    function playMusic(name) {
        const src = ASSETS[name];
        if (!src)
            return;
        if (!isBrowser()) {
            console.log('[AudioManager] playMusic', name, src);
            return;
        }
        try {
            if (musicAudio) {
                musicAudio.pause();
                musicAudio = null;
            }
            musicAudio = new Audio(src);
            musicAudio.loop = true;
            musicAudio.volume = clampVolume(musicVolume);
            musicAudio.play().catch((e) => { });
        }
        catch (e) {
            // swallow for environments without audio
        }
    }
    function stopMusic() {
        if (!isBrowser())
            return;
        if (musicAudio) {
            musicAudio.pause();
            musicAudio = null;
        }
    }
    function playSFX(name) {
        const src = ASSETS[name];
        if (!src)
            return;
        if (!isBrowser()) {
            console.log('[AudioManager] playSFX', name, src);
            return;
        }
        try {
            const s = new Audio(src);
            s.volume = clampVolume(sfxVolume);
            s.play().catch(() => { });
        }
        catch (e) { }
    }
    function setMusicVolume(v) {
        musicVolume = clampVolume(v);
        if (musicAudio)
            musicAudio.volume = musicVolume;
    }
    function setSFXVolume(v) { sfxVolume = clampVolume(v); }
    function getMusicVolume() { return musicVolume; }
    function getSFXVolume() { return sfxVolume; }
    return { playMusic, stopMusic, playSFX, setMusicVolume, setSFXVolume, getMusicVolume, getSFXVolume };
}
