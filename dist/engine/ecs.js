"use strict";
// Minimal ECS implementation with a small test scaffold
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = exports.DEFAULT_WORLD_CAPACITY = exports.INVALID_ENTITY_ID = void 0;
exports.runEcsUnitTestScaffold = runEcsUnitTestScaffold;
exports.createDefaultWorld = createDefaultWorld;
exports.INVALID_ENTITY_ID = -1;
exports.DEFAULT_WORLD_CAPACITY = 1024;
class World {
    constructor() {
        this.nextEntityId = 1; // start at 1 to avoid INVALID_ENTITY_ID
        this.componentStores = new Map();
        this.systems = [];
    }
    createEntity() {
        const id = this.nextEntityId++;
        return id;
    }
    removeEntity(eid) {
        for (const store of this.componentStores.values()) {
            store.delete(eid);
        }
    }
    addComponent(eid, name, component) {
        if (!this.componentStores.has(name))
            this.componentStores.set(name, new Map());
        this.componentStores.get(name).set(eid, component);
    }
    getComponent(eid, name) {
        return this.componentStores.get(name)?.get(eid);
    }
    removeComponent(eid, name) {
        this.componentStores.get(name)?.delete(eid);
    }
    // Query for entities that have all requested component names
    query(componentNames) {
        if (componentNames.length === 0)
            return [];
        const first = this.componentStores.get(componentNames[0]);
        if (!first)
            return [];
        const results = [];
        for (const [eid] of first) {
            let ok = true;
            const comps = [];
            for (const name of componentNames) {
                const store = this.componentStores.get(name);
                if (!store) {
                    ok = false;
                    break;
                }
                const comp = store.get(eid);
                if (!comp) {
                    ok = false;
                    break;
                }
                comps.push(comp);
            }
            if (ok)
                results.push({ entity: eid, components: comps });
        }
        return results;
    }
    registerSystem(system) {
        this.systems.push(system);
    }
    update(dt) {
        for (const sys of this.systems) {
            sys.update(dt, this);
        }
    }
    // Serialize world to plain object suitable for JSON storage.
    toSaveObject() {
        const stores = {};
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
    static fromSaveObject(obj) {
        const w = new World();
        w.nextEntityId = obj.nextEntityId || 1;
        for (const name of Object.keys(obj.componentStores)) {
            const arr = obj.componentStores[name];
            const map = new Map();
            for (const e of arr) {
                map.set(e.entity, e.component);
            }
            w.componentStores.set(name, map);
        }
        return w;
    }
}
exports.World = World;
// -- Test scaffolding --
// Expose a small helper that unit test runners can call to perform basic ECS checks.
function runEcsUnitTestScaffold() {
    const msgs = [];
    const world = new World();
    const e = world.createEntity();
    if (e === exports.INVALID_ENTITY_ID)
        msgs.push('FAIL: created invalid entity id');
    world.addComponent(e, 'position', { x: 0, y: 0 });
    world.addComponent(e, 'velocity', { x: 1, y: 0 });
    const query = world.query(['position', 'velocity']);
    if (query.length !== 1)
        msgs.push(`FAIL: expected 1 result but got ${query.length}`);
    else
        msgs.push('PASS: query returns created entity');
    // Test system execution
    let moved = false;
    const sys = {
        update(dt, w) {
            const q = w.query(['position', 'velocity']);
            for (const r of q) {
                const pos = r.components[0];
                const vel = r.components[1];
                pos.x += vel.x * dt;
                pos.y += vel.y * dt;
                moved = true;
            }
        }
    };
    world.registerSystem(sys);
    world.update(1 / 60);
    if (!moved)
        msgs.push('FAIL: system did not run');
    else
        msgs.push('PASS: system update ran');
    return { passed: msgs.every(m => m.startsWith('PASS')), messages: msgs };
}
function createDefaultWorld() { return new World(); }
