import { World } from './engine/ecs';

export const CURRENT_SAVE_VERSION = 1;

export interface SaveMeta { version: number; createdAt: string }

// Serialize the World into a human-readable, versioned JSON string.
export function serializeWorldToJson(world: World): string {
  const obj = (world as any).toSaveObject ? (world as any).toSaveObject() : null;
  if (!obj) throw new Error('World does not support toSaveObject()');

  const entitiesMap: Map<number, Record<string, any>> = new Map();
  for (const [compName, list] of Object.entries(obj.componentStores)) {
    for (const item of list as Array<{ entity: number; component: any }>) {
      const eid = item.entity;
      if (!entitiesMap.has(eid)) entitiesMap.set(eid, {});
      entitiesMap.get(eid)![compName] = item.component;
    }
  }

  const entities = Array.from(entitiesMap.entries()).map(([id, comps]) => ({ id, components: comps }));
  const save = {
    meta: { version: CURRENT_SAVE_VERSION, createdAt: new Date().toISOString() },
    entities,
    nextEntityId: obj.nextEntityId
  };
  return JSON.stringify(save, null, 2);
}

// Deserialize JSON back into a World instance, with migration stub and error handling.
export function deserializeWorldFromJson(json: string): World {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.meta || typeof parsed.meta.version !== 'number') throw new Error('Invalid save meta');
    const version = parsed.meta.version;
    let data = parsed;
    if (version !== CURRENT_SAVE_VERSION) {
      data = migrateSave(parsed);
    }

    const componentStores: Record<string, Array<{ entity: number; component: any }>> = {};
    for (const ent of data.entities || []) {
      const id = ent.id;
      const comps = ent.components || {};
      for (const [name, comp] of Object.entries(comps)) {
        if (!componentStores[name]) componentStores[name] = [];
        componentStores[name].push({ entity: id, component: comp });
      }
    }

    const saveObj = { nextEntityId: data.nextEntityId || 1, componentStores };
    if (typeof (World as any).fromSaveObject !== 'function') throw new Error('World.fromSaveObject() not available');
    return (World as any).fromSaveObject(saveObj);
  } catch (e) {
    throw new Error('Failed to load world: ' + (e as Error).message);
  }
}

// Migration stub: implement transformations for older save versions here.
export function migrateSave(parsed: any): any {
  // No-op migration: extend with versioned transformations as needed.
  return parsed;
}
