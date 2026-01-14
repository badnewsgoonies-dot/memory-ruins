import { playBackgroundLoop, stopBackgroundLoop } from '../../src/audio/backgroundMusic';
import { playJumpSFX } from '../../src/audio/sfx';

describe('Audio integration - background music and jump SFX', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('plays background music (non-browser logs)', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    playBackgroundLoop();
    // createAudioManager logs in non-browser: first arg contains the marker
    expect(log).toHaveBeenCalled();
    const calledWith = log.mock.calls.find(c => typeof c[0] === 'string' && c[0].includes('[AudioManager] playMusic'));
    expect(calledWith).toBeDefined();
  });

  test('stops background music without throwing', () => {
    expect(() => stopBackgroundLoop()).not.toThrow();
  });

  test('plays jump sfx (non-browser logs)', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    playJumpSFX();
    expect(log).toHaveBeenCalled();
    const calledWith = log.mock.calls.find(c => typeof c[0] === 'string' && c[0].includes('[AudioManager] playSFX'));
    expect(calledWith).toBeDefined();
  });
});
