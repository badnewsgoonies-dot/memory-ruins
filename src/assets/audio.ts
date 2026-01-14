// Auto-generated audio registry — minimal integration
export const AUDIO_DIR = 'assets/audio/';

export const AUDIO = {
  MUSIC_BACKGROUND: `${AUDIO_DIR}background.ogg`,
  SFX_CLICK: `${AUDIO_DIR}sfx_click.wav`,
} as const;

export type AudioKey = keyof typeof AUDIO;

export function getAudioPath(key: AudioKey): string {
  return AUDIO[key];
}
