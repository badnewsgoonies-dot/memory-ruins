import { AudioManager } from '../../src/audio/audioManager';
import { volumeControls, VolumeControls } from '../../src/audio/volumeControls';

describe('AudioManager volume controls', () => {
  beforeEach(() => {
    // reset shared singleton to defaults
    volumeControls._reset(1, 1);
  });

  test('default volumes are 1', () => {
    expect(AudioManager.getMusicVolume()).toBe(1);
    expect(AudioManager.getSfxVolume()).toBe(1);
  });

  test('set and get volumes', () => {
    AudioManager.setMusicVolume(0.5);
    AudioManager.setSfxVolume(0.25);
    expect(AudioManager.getMusicVolume()).toBe(0.5);
    expect(AudioManager.getSfxVolume()).toBe(0.25);
  });

  test('clamps out of range', () => {
    AudioManager.setMusicVolume(2 as any);
    AudioManager.setSfxVolume(-1 as any);
    expect(AudioManager.getMusicVolume()).toBe(1);
    expect(AudioManager.getSfxVolume()).toBe(0);
  });

  test('invalid volume throws', () => {
    expect(() => new VolumeControls(NaN, 1)).toThrow();
  });
});
