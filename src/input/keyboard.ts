export type KeyMap = { [key: string]: boolean };

export const createKeyMap = () => ({ ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false, w:false, a:false, s:false, d:false } as KeyMap);

export const bindWindowKeys = (keys: KeyMap) => {
  window.addEventListener('keydown', (e) => { if (e.key in keys) (keys as any)[e.key] = true; });
  window.addEventListener('keyup', (e) => { if (e.key in keys) (keys as any)[e.key] = false; });
};
