"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tilemap = exports.PLATFORM_OFFSET_RATIO = exports.PLATFORM_THICKNESS_RATIO = exports.PLATFORM = exports.SOLID = exports.EMPTY = void 0;
const constants_1 = require("../constants");
exports.EMPTY = 0;
exports.SOLID = 1;
exports.PLATFORM = 2;
// Ratios used for platform rendering to avoid magic numbers
exports.PLATFORM_THICKNESS_RATIO = 0.4;
exports.PLATFORM_OFFSET_RATIO = 1 - exports.PLATFORM_THICKNESS_RATIO;
class Tilemap {
    constructor(levelPath, tileSize) {
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        this.levelPath = levelPath ?? Tilemap.DEFAULT_LEVEL_PATH;
        this.tileSize = tileSize ?? constants_1.TILE_SIZE;
    }
    // Load level JSON from configured path. Uses fetch in browser contexts.
    async load() {
        let json;
        const path = this.levelPath;
        if (typeof fetch !== "undefined") {
            const res = await fetch(path);
            if (!res.ok)
                throw new Error(`Failed to load level: ${path} (status ${res.status})`);
            json = await res.json();
        }
        else {
            // Fallback for non-browser environments (Node). Attempt require relative to project root.
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                json = require(path);
            }
            catch (e) {
                throw new Error(`Unable to load level at ${path}: ${String(e)}`);
            }
        }
        this._parse(json);
    }
    _parse(json) {
        if (!json) {
            this.tiles = [];
            this.width = 0;
            this.height = 0;
            return;
        }
        if (Array.isArray(json.tiles)) {
            // Explicit 2D tiles array
            this.tiles = json.tiles.map((row) => row.slice());
            this.height = this.tiles.length;
            this.width = this.height > 0 ? this.tiles[0].length : 0;
            return;
        }
        if (Array.isArray(json.data) && typeof json.width === "number") {
            // Flat array with width provided
            const w = json.width;
            const h = Math.ceil(json.data.length / w);
            this.width = w;
            this.height = h;
            this.tiles = [];
            for (let y = 0; y < h; y++) {
                const row = [];
                for (let x = 0; x < w; x++) {
                    const idx = y * w + x;
                    row.push(json.data[idx] ?? exports.EMPTY);
                }
                this.tiles.push(row);
            }
            return;
        }
        // Unknown format: attempt to coerce if it's an object with rows
        if (json.rows && Array.isArray(json.rows)) {
            this.tiles = json.rows.map((r) => r.map((v) => (typeof v === "number" ? v : exports.EMPTY)));
            this.height = this.tiles.length;
            this.width = this.height > 0 ? this.tiles[0].length : 0;
            return;
        }
        // As a last resort, leave empty
        this.tiles = [];
        this.width = 0;
        this.height = 0;
    }
    // Physics integration: required by src/platforming/physics.Tilemap
    isSolidAt(tileX, tileY) {
        if (tileX < 0 || tileY < 0)
            return false;
        if (tileY >= this.height || tileX >= this.width)
            return false;
        return this.tiles[tileY][tileX] === exports.SOLID;
    }
    // Render tiles to a CanvasRenderingContext2D using tileSize (derived from TILE_SIZE constant)
    render(ctx) {
        if (!ctx || !this.tiles)
            return;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const t = this.tiles[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                switch (t) {
                    case exports.SOLID:
                        ctx.fillStyle = "#444";
                        ctx.fillRect(px, py, this.tileSize, this.tileSize);
                        break;
                    case exports.PLATFORM:
                        ctx.fillStyle = "#888";
                        // Draw platform as a thinner rectangle (no magic numbers: use fraction constant)
                        ctx.fillRect(px, py + Math.floor(this.tileSize * exports.PLATFORM_OFFSET_RATIO), this.tileSize, Math.ceil(this.tileSize * exports.PLATFORM_THICKNESS_RATIO));
                        break;
                    case exports.EMPTY:
                    default:
                        // clear / transparent - no draw
                        break;
                }
            }
        }
    }
    // Return collision rectangles for solid tiles (useful for broad-phase or debugging)
    getCollisionRects() {
        const rects = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === exports.SOLID) {
                    rects.push({
                        x: x * this.tileSize,
                        y: y * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: exports.SOLID,
                    });
                }
            }
        }
        return rects;
    }
    // Utility: get tile at world coordinates
    tileAtWorld(x, y) {
        const tx = Math.floor(x / this.tileSize);
        const ty = Math.floor(y / this.tileSize);
        if (tx < 0 || ty < 0 || ty >= this.height || tx >= this.width)
            return exports.EMPTY;
        return this.tiles[ty][tx];
    }
}
exports.Tilemap = Tilemap;
Tilemap.DEFAULT_LEVEL_PATH = "assets/levels/test_room.json";
