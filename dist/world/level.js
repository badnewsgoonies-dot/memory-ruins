"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_FILE_VERSION = exports.LEVELS_DIR = void 0;
exports.loadLevelFile = loadLevelFile;
exports.instantiateLevel = instantiateLevel;
const fs_1 = require("fs");
const path = __importStar(require("path"));
// Named constants to avoid magic values
exports.LEVELS_DIR = path.join(process.cwd(), 'assets', 'levels');
exports.LEVEL_FILE_VERSION = 1;
async function loadLevelFile(fileName) {
    const p = path.join(exports.LEVELS_DIR, fileName);
    const raw = await fs_1.promises.readFile(p, 'utf-8');
    const parsed = JSON.parse(raw);
    // Basic validation and normalization (root cause checks)
    if (!parsed || typeof parsed.version !== 'number') {
        throw new Error(`Invalid level file: ${fileName} (missing or invalid version)`);
    }
    if (parsed.version !== exports.LEVEL_FILE_VERSION) {
        // For now, allow version mismatch but warn (future migrations should be implemented)
        console.warn(`Warning: level file ${fileName} has version ${parsed.version}, expected ${exports.LEVEL_FILE_VERSION}`);
    }
    parsed.entities = parsed.entities || [];
    return parsed;
}
// Instantiate level data into the provided World instance.
// This performs a minimal, deterministic mapping from level entity definitions
// to ECS entities and components.
function instantiateLevel(world, level) {
    for (const ent of level.entities) {
        const eid = world.createEntity();
        const comps = ent.components || {};
        for (const [name, value] of Object.entries(comps)) {
            world.addComponent(eid, name, value);
        }
    }
}
