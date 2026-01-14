import { createAudioManager } from '../audioManager.js';

// Constants for asset names to avoid magic strings
const BACKGROUND_MUSIC_NAME = 'background';

type AudioManagerLike = {
  playMusic?: (name: string) => void;
  stopMusic?: () => void;
};

/**
 * Play the background music in a loop.
 * Returns the audio manager instance used so callers can control it (stop, set volume).
 */
export function playBackgroundLoop(manager?: AudioManagerLike): AudioManagerLike | undefined {
  const mgr = (manager as AudioManagerLike) || (createAudioManager as unknown as () => AudioManagerLike)();
  if (mgr && typeof mgr.playMusic === 'function') {
    mgr.playMusic(BACKGROUND_MUSIC_NAME);
  }
  return mgr;
}

/**
 * Stop the background music if supported by the provided manager.
 */
export function stopBackgroundLoop(manager?: AudioManagerLike): AudioManagerLike | undefined {
  const mgr = (manager as AudioManagerLike) || (createAudioManager as unknown as () => AudioManagerLike)();
  if (mgr && typeof mgr.stopMusic === 'function') {
    mgr.stopMusic();
  }
  return mgr;
}
