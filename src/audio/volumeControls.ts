export const MIN_VOLUME = 0;
export const MAX_VOLUME = 1;

export function clampVolume(v: number): number {
  if (typeof v !== 'number' || Number.isNaN(v) || v === Infinity || v === -Infinity) throw new Error('Invalid volume');
  return Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, v));
}

export class VolumeControls {
  private _music: number;
  private _sfx: number;

  constructor(music = 1, sfx = 1) {
    this._music = clampVolume(music);
    this._sfx = clampVolume(sfx);
  }

  set music(v: number) { this._music = clampVolume(v); }
  get music(): number { return this._music; }

  set sfx(v: number) { this._sfx = clampVolume(v); }
  get sfx(): number { return this._sfx; }

  toJSON(): { music: number; sfx: number } { return { music: this.music, sfx: this.sfx }; }
}

// Singleton used by AudioManager and other systems that prefer a shared state.
const _volumeState = new VolumeControls();

export const volumeControls = {
  setMusicVolume(v: number): void { _volumeState.music = v; },
  getMusicVolume(): number { return _volumeState.music; },
  setSfxVolume(v: number): void { _volumeState.sfx = v; },
  getSfxVolume(): number { return _volumeState.sfx; },
  getState(): { music: number; sfx: number } { return _volumeState.toJSON(); },
  // helper for tests to reset state
  _reset(music = 1, sfx = 1): void { _volumeState.music = music; _volumeState.sfx = sfx; }
};
