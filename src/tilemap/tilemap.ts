import type { Tilemap as TilemapInterface } from "../platforming/physics";
import { TILE_SIZE } from "../constants";

export const EMPTY = 0;
export const SOLID = 1;
export const PLATFORM = 2;

// Ratios used for platform rendering to avoid magic numbers
export const PLATFORM_THICKNESS_RATIO = 0.4;
export const PLATFORM_OFFSET_RATIO = 1 - PLATFORM_THICKNESS_RATIO;

export type CollisionRect = { x: number; y: number; width: number; height: number; type: number };

export interface LevelData {
  width?: number;
  height?: number;
  tiles?: number[][];
  data?: number[]; // flat array row-major
}

export class Tilemap implements TilemapInterface {
  tileSize: number;
  tiles: number[][] = [];
  width = 0;
  height = 0;
  levelPath: string;
  static readonly DEFAULT_LEVEL_PATH = "assets/levels/test_room.json";

  constructor(levelPath?: string, tileSize?: number) {
    this.levelPath = levelPath ?? Tilemap.DEFAULT_LEVEL_PATH;
    this.tileSize = tileSize ?? TILE_SIZE;
  }

  // Load level JSON from configured path. Uses fetch in browser contexts.
  async load(): Promise<void> {
    let json: unknown;
    const path = this.levelPath;
    if (typeof fetch !== "undefined") {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load level: ${path} (status ${res.status})`);
      json = await res.json();
    } else {
      // Fallback for non-browser environments (Node). Attempt require relative to project root.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        json = require(path);
      } catch (e) {
        throw new Error(`Unable to load level at ${path}: ${String(e)}`);
      }
    }
    this._parse(json);
  }

  private _parse(json: unknown) {
    if (!json) {
      this.tiles = [];
      this.width = 0;
      this.height = 0;
      return;
    }

    const obj = json as LevelData & Record<string, unknown>;

    if (Array.isArray(obj.tiles)) {
      // Explicit 2D tiles array
      this.tiles = obj.tiles.map((row: number[]) => row.slice());
      this.height = this.tiles.length;
      this.width = this.height > 0 ? this.tiles[0].length : 0;
      return;
    }

    if (Array.isArray(obj.data) && typeof obj.width === "number") {
      // Flat array with width provided
      const w = obj.width as number;
      const h = Math.ceil(obj.data.length / w);
      this.width = w;
      this.height = h;
      this.tiles = [];
      for (let y = 0; y < h; y++) {
        const row: number[] = [];
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          row.push(obj.data[idx] ?? EMPTY);
        }
        this.tiles.push(row);
      }
      return;
    }

    // Unknown format: attempt to coerce if it's an object with rows
    if (obj.rows && Array.isArray(obj.rows)) {
      this.tiles = obj.rows.map((r: unknown[]) => r.map((v) => (typeof v === "number" ? v : EMPTY)));
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
  isSolidAt(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileY < 0) return false;
    if (tileY >= this.height || tileX >= this.width) return false;
    return this.tiles[tileY][tileX] === SOLID;
  }

  // Render tiles to a CanvasRenderingContext2D using tileSize (derived from TILE_SIZE constant)
  render(ctx: CanvasRenderingContext2D) {
    if (!ctx || !this.tiles) return;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.tiles[y][x];
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        switch (t) {
          case SOLID:
            ctx.fillStyle = "#444";
            ctx.fillRect(px, py, this.tileSize, this.tileSize);
            break;
          case PLATFORM:
            ctx.fillStyle = "#888";
            // Draw platform as a thinner rectangle (no magic numbers: use fraction constant)
            ctx.fillRect(px, py + Math.floor(this.tileSize * PLATFORM_OFFSET_RATIO), this.tileSize, Math.ceil(this.tileSize * PLATFORM_THICKNESS_RATIO));
            break;
          case EMPTY:
          default:
            // clear / transparent - no draw
            break;
        }
      }
    }
  }

  // Return collision rectangles for solid tiles (useful for broad-phase or debugging)
  getCollisionRects(): CollisionRect[] {
    const rects: CollisionRect[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] === SOLID) {
          rects.push({
            x: x * this.tileSize,
            y: y * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            type: SOLID,
          });
        }
      }
    }
    return rects;
  }

  // Utility: get tile at world coordinates
  tileAtWorld(x: number, y: number): number {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    if (tx < 0 || ty < 0 || ty >= this.height || tx >= this.width) return EMPTY;
    return this.tiles[ty][tx];
  }
}
