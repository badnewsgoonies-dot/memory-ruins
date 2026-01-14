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
exports.DEFAULT_SAVE_VERSION = exports.DEFAULT_SAVE_PATH = void 0;
exports.saveWorldToFile = saveWorldToFile;
exports.loadWorldFromFile = loadWorldFromFile;
exports.migrateSaveObjectIfNeeded = migrateSaveObjectIfNeeded;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const ecs_1 = require("../engine/ecs");
exports.DEFAULT_SAVE_PATH = 'assets/savegame.json';
exports.DEFAULT_SAVE_VERSION = 1;
async function saveWorldToFile(world, filePath = exports.DEFAULT_SAVE_PATH) {
    try {
        const obj = world.toSaveObject();
        const payload = { meta: { version: exports.DEFAULT_SAVE_VERSION, createdAt: new Date().toISOString() }, payload: obj };
        await fs_1.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs_1.promises.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    }
    catch (err) {
        throw new Error(`Failed to save world to ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
}
async function loadWorldFromFile(filePath = exports.DEFAULT_SAVE_PATH) {
    try {
        const data = await fs_1.promises.readFile(filePath, 'utf8');
        const parsed = JSON.parse(data);
        // Migration stub: inspect parsed.meta.version and convert if necessary
        const obj = parsed.payload ?? parsed;
        const world = ecs_1.World.fromSaveObject(obj);
        return world;
    }
    catch (err) {
        throw new Error(`Failed to load world from ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
}
function migrateSaveObjectIfNeeded(parsed) {
    // Apply migrations based on parsed.meta.version when needed.
    return parsed;
}
