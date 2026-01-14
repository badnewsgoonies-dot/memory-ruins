// Minimal ECS implementation with a small test scaffold

export type EntityId = number;
export const INVALID_ENTITY_ID: EntityId = -1;
export const DEFAULT_WORLD_CAPACITY = 1024;

export type Component = Record<string, any>;

export interface System {
  // Called each frame with dt and world reference
  update(dt: number, world: World): void;
}

export class World {
  private nextEntityId: EntityId = 1; // start at 1 to avoid INVALID_ENTITY_ID
  private componentStores: Map<string, Map<EntityId, Component>> = new Map();
  private systems: System[] = [];

  createEntity(): EntityId {
    const id = this.nextEntityId++;
    return id;
  }

  removeEntity(eid: EntityId): void {
    for (const store of this.componentStores.values()) {
      store.delete(eid);
    }
  }

  addComponent<T extends Component>(eid: EntityId, name: string, component: T): void {
    if (!this.componentStores.has(name)) this.componentStores.set(name, new Map());
    this.componentStores.get(name)!.set(eid, component);
  }

  getComponent<T extends Component>(eid: EntityId, name: string): T | undefined {
    return this.componentStores.get(name)?.get(eid) as T | undefined;
  }

  removeComponent(eid: EntityId, name: string): void {
    this.componentStores.get(name)?.delete(eid);
  }

  // Query for entities that have all requested component names
  query(componentNames: string[]): Array<{ entity: EntityId; components: Component[] }> {
    if (componentNames.length === 0) return [];
    const first = this.componentStores.get(componentNames[0]);
    if (!first) return [];
    const results: Array<{ entity: EntityId; components: Component[] }> = [];
    for (const [eid] of first) {
      let ok = true;
      const comps: Component[] = [];
      for (const name of componentNames) {
        const store = this.componentStores.get(name);
        if (!store) { ok = false; break; }
        const comp = store.get(eid);
        if (!comp) { ok = false; break; }
        comps.push(comp);
      }
      if (ok) results.push({ entity: eid, components: comps });
    }
    return results;
  }

  registerSystem(system: System): void {
    this.systems.push(system);
  }

  update(dt: number): void {
    for (const sys of this.systems) {
      sys.update(dt, this);
    }
  }

  // Serialize world to plain object suitable for JSON storage.
  toSaveObject(): { nextEntityId: number; componentStores: Record<string, Array<{ entity: number; component: Component }>> } {
    const stores: Record<string, Array<{ entity: number; component: Component }>> = {};
    for (const [name, store] of this.componentStores.entries()) {
      stores[name] = [];
      for (const [eid, comp] of store.entries()) {
        stores[name].push({ entity: eid, component: comp });
      }
      // sort for deterministic output by entity id
      stores[name].sort((a, b) => a.entity - b.entity);
    }
    return { nextEntityId: this.nextEntityId, componentStores: stores };
  }

  // Reconstruct a World from a save object produced by toSaveObject
  static fromSaveObject(obj: { nextEntityId: number; componentStores: Record<string, Array<{ entity: number; component: Component }>> }): World {
    const w = new World();
    w.nextEntityId = obj.nextEntityId || 1;
    for (const name of Object.keys(obj.componentStores)) {
      const arr = obj.componentStores[name];
      const map = new Map<EntityId, Component>();
      for (const e of arr) {
        map.set(e.entity, e.component);
      }
      w.componentStores.set(name, map);
    }
    return w;
  }
}

// -- Test scaffolding --
// Expose a small helper that unit test runners can call to perform basic ECS checks.
export function runEcsUnitTestScaffold(): { passed: boolean; messages: string[] } {
  const msgs: string[] = [];
  const world = new World();
  const e = world.createEntity();
  if (e === INVALID_ENTITY_ID) msgs.push('FAIL: created invalid entity id');

  world.addComponent(e, 'position', { x: 0, y: 0 });
  world.addComponent(e, 'velocity', { x: 1, y: 0 });

  const query = world.query(['position', 'velocity']);
  if (query.length !== 1) msgs.push(`FAIL: expected 1 result but got ${query.length}`);
  else msgs.push('PASS: query returns created entity');

  // Test system execution
  let moved = false;
  const sys: System = {
    update(dt: number, w: World) {
      const q = w.query(['position', 'velocity']);
      for (const r of q) {
        const pos = r.components[0] as any;
        const vel = r.components[1] as any;
        pos.x += vel.x * dt;
        pos.y += vel.y * dt;
        moved = true;
      }
    }
  };
  world.registerSystem(sys);
  world.update(1 / 60);
  if (!moved) msgs.push('FAIL: system did not run');
  else msgs.push('PASS: system update ran');

  return { passed: msgs.every(m => m.startsWith('PASS')), messages: msgs };
}

export function createDefaultWorld(): World { return new World(); }
