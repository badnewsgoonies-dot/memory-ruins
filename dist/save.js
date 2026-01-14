"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_SAVE_VERSION = void 0;
exports.serializeWorldToJson = serializeWorldToJson;
exports.deserializeWorldFromJson = deserializeWorldFromJson;
exports.migrateSave = migrateSave;
const ecs_1 = require("./engine/ecs");
exports.CURRENT_SAVE_VERSION = 1;
// Serialize the World into a human-readable, versioned JSON string.
function serializeWorldToJson(world) {
    const obj = world.toSaveObject ? world.toSaveObject() : null;
    if (!obj)
        throw new Error('World does not support toSaveObject()');
    const entitiesMap = new Map();
    for (const [compName, list] of Object.entries(obj.componentStores)) {
        for (const item of list) {
            const eid = item.entity;
            if (!entitiesMap.has(eid))
                entitiesMap.set(eid, {});
            entitiesMap.get(eid)[compName] = item.component;
        }
    }
    const entities = Array.from(entitiesMap.entries()).map(([id, comps]) => ({ id, components: comps }));
    const save = {
        meta: { version: exports.CURRENT_SAVE_VERSION, createdAt: new Date().toISOString() },
        entities,
        nextEntityId: obj.nextEntityId
    };
    return JSON.stringify(save, null, 2);
}
// Deserialize JSON back into a World instance, with migration stub and error handling.
function deserializeWorldFromJson(json) {
    try {
        const parsed = JSON.parse(json);
        if (!parsed.meta || typeof parsed.meta.version !== 'number')
            throw new Error('Invalid save meta');
        const version = parsed.meta.version;
        let data = parsed;
        if (version !== exports.CURRENT_SAVE_VERSION) {
            data = migrateSave(parsed);
        }
        const componentStores = {};
        for (const ent of data.entities || []) {
            const id = ent.id;
            const comps = ent.components || {};
            for (const [name, comp] of Object.entries(comps)) {
                if (!componentStores[name])
                    componentStores[name] = [];
                componentStores[name].push({ entity: id, component: comp });
            }
        }
        const saveObj = { nextEntityId: data.nextEntityId || 1, componentStores };
        if (typeof ecs_1.World.fromSaveObject !== 'function')
            throw new Error('World.fromSaveObject() not available');
        return ecs_1.World.fromSaveObject(saveObj);
    }
    catch (e) {
        throw new Error('Failed to load world: ' + e.message);
    }
}
// Migration stub: implement transformations for older save versions here.
function migrateSave(parsed) {
    // No-op migration: extend with versioned transformations as needed.
    return parsed;
}
