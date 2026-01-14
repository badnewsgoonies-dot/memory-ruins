import { promises as fs } from 'fs';
import * as path from 'path';
import { World } from '../engine/ecs';

export const DEFAULT_SAVE_PATH = 'assets/savegame.json';
export const DEFAULT_SAVE_VERSION = 1;

export async function saveWorldToFile(world: World, filePath: string = DEFAULT_SAVE_PATH): Promise<void> {
  try {
    const obj = (world as any).toSaveObject();
    const payload = { meta: { version: DEFAULT_SAVE_VERSION, createdAt: new Date().toISOString() }, payload: obj };
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Failed to save world to ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function loadWorldFromFile(filePath: string = DEFAULT_SAVE_PATH): Promise<World> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    // Migration stub: inspect parsed.meta.version and convert if necessary
    const obj = parsed.payload ?? parsed;
    const world = (World as any).fromSaveObject(obj);
    return world as World;
  } catch (err) {
    throw new Error(`Failed to load world from ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export function migrateSaveObjectIfNeeded(parsed: any): any {
  // Apply migrations based on parsed.meta.version when needed.
  return parsed;
}
