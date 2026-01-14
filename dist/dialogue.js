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
exports.DialogueManager = exports.DIALOGUE_DIR = void 0;
// Dialogue system: minimal, engine-agnostic manager
exports.DIALOGUE_DIR = 'assets/dialogue';
class DialogueManager {
    constructor() {
        this.data = null;
    }
    // Load a JSON file at runtime. Implementation is resilient across environments.
    async loadFromFile(path = `${exports.DIALOGUE_DIR}/npcs.json`) {
        try {
            // Node.js friendly require (may be compiled away in browser builds)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            // @ts-ignore
            const raw = require(`../../${path}`);
            this._ingest(raw);
            return this.data;
        }
        catch (e) {
            try {
                // Dynamic import fallback
                // @ts-ignore
                const raw = await Promise.resolve(`${`../../${path}`}`).then(s => __importStar(require(s)));
                this._ingest(raw.default || raw);
                return this.data;
            }
            catch (err) {
                console.warn('DialogueManager: failed to load', path, err);
                return null;
            }
        }
    }
    _ingest(raw) {
        this.data = {};
        if (raw && raw.npcs) {
            for (const n of raw.npcs)
                this.data[n.id] = n;
        }
    }
    getNPC(id) {
        return this.data ? this.data[id] : undefined;
    }
}
exports.DialogueManager = DialogueManager;
