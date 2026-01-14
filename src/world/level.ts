import { promises as fs } from 'fs';
import * as path from 'path';
import { World } from '../engine/ecs';

// Named constants to avoid magic values
export const LEVELS_DIR = path.join(process.cwd(), 'assets', 'levels');
export const LEVEL_FILE_VERSION = 1;

export type LevelEntity = {
  id?: string;
  components: Record<string, any>;
};

export type Level = {
  version: number;
  name: string;
  entities: LevelEntity[];
};

export async function loadLevelFile(fileName: string): Promise<Level> {
  const p = path.join(LEVELS_DIR, fileName);
  const raw = await fs.readFile(p, 'utf-8');
  const parsed = JSON.parse(raw);

  // Basic validation and normalization (root cause checks)
  if (!parsed || typeof parsed.version !== 'number') {
    throw new Error(`Invalid level file: ${fileName} (missing or invalid version)`);
  }
  if (parsed.version !== LEVEL_FILE_VERSION) {
    // For now, allow version mismatch but warn (future migrations should be implemented)
    console.warn(`Warning: level file ${fileName} has version ${parsed.version}, expected ${LEVEL_FILE_VERSION}`);
  }
  parsed.entities = parsed.entities || [];
  return parsed as Level;
}

// Instantiate level data into the provided World instance.
// This performs a minimal, deterministic mapping from level entity definitions
// to ECS entities and components.
export function instantiateLevel(world: World, level: Level): void {
  for (const ent of level.entities) {
    const eid = world.createEntity();
    const comps = ent.components || {};
    for (const [name, value] of Object.entries(comps)) {
      world.addComponent(eid, name, value);
    }
  }
}
