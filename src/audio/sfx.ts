import { createAudioManager } from '../audioManager.js';

// Named SFX to avoid magic strings
const JUMP_SFX = 'jump';

type SfxManagerLike = { playSFX?: (name: string) => void };

/** Play the jump sound effect. Returns the manager used. */
export function playJumpSFX(manager?: SfxManagerLike): SfxManagerLike {
  const mgr = (manager as SfxManagerLike) || (createAudioManager() as SfxManagerLike);
  if (mgr && typeof mgr.playSFX === 'function') {
    mgr.playSFX(JUMP_SFX);
  }
  return mgr;
}
