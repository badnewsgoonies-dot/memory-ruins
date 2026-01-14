import { VolumeControls, volumeControls } from './volumeControls';

export type AudioManagerLike = {
  playMusic?: (name: string) => void;
  stopMusic?: () => void;
  playSFX?: (name: string) => void;
  setMusicVolume?: (v: number) => void;
  setSfxVolume?: (v: number) => void;
  getVolumeState?: () => { music: number; sfx: number };
};

// AudioManagerClass provides an instance-based API (constructable) for
// consumers that prefer an isolated manager.
export class AudioManagerClass {
  private controls: VolumeControls;

  constructor(opts?: { music?: number; sfx?: number }) {
    if (opts && (opts.music !== undefined || opts.sfx !== undefined)) {
      this.controls = new VolumeControls(opts.music === undefined ? 1 : opts.music, opts.sfx === undefined ? 1 : opts.sfx);
    } else {
      this.controls = new VolumeControls();
    }
  }

  setMusicVolume(v: number): void {
    this.controls.music = v;
  }

  getMusicVolume(): number {
    return this.controls.music;
  }

  setSfxVolume(v: number): void {
    this.controls.sfx = v;
  }

  getSfxVolume(): number {
    return this.controls.sfx;
  }

  getVolumeState(): { music: number; sfx: number } {
    return this.controls.toJSON();
  }
}

// Provide a shared singleton-backed API for legacy/centralized usage.
export const AudioManager = {
  setMusicVolume(v: number): void { volumeControls.setMusicVolume(v); },
  getMusicVolume(): number { return volumeControls.getMusicVolume(); },
  setSfxVolume(v: number): void { volumeControls.setSfxVolume(v); },
  getSfxVolume(): number { return volumeControls.getSfxVolume(); },
  getVolumeState(): { music: number; sfx: number } { return volumeControls.getState(); }
};

export default AudioManager;
