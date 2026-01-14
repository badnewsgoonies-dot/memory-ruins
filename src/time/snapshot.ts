// src/time/snapshot.ts

/**
 * Interface representing a serializable game state.
 * This should be extended or replaced with your actual game state structure.
 */
export interface GameState {
  frame: number;
  // Add other relevant game state properties here
  player: {
    position: { x: number; y: number };
    health: number;
    // ...
  };
  enemies: Array<{
    id: string;
    position: { x: number; y: number };
    health: number;
    // ...
  }>;
  // ... other game entities and world data
}

/**
 * Maximum number of snapshots to retain.
 * This prevents excessive memory usage by pruning older snapshots.
 */
export const MAX_SNAPSHOT_COUNT = 100; // Configurable constant

/**
 * Manages the recording and retrieval of game state snapshots over time.
 * Snapshots are deterministic and size-bounded.
 */
export class SnapshotManager {
  private maxSnapshots: number;

  constructor(maxSnapshots: number = MAX_SNAPSHOT_COUNT) {
    this.maxSnapshots = maxSnapshots;
  }

  /**
   * Records the current deterministic game state as a snapshot.
   * Older snapshots are pruned if the maximum count is exceeded.
   * @param state The current game state to record.
   */
  public recordSnapshot(state: GameState): void {
    // Ensure the snapshot is a deep copy to prevent mutation issues
    const serializedState = JSON.parse(JSON.stringify(state));
    this.snapshots.push(serializedState);
    this.currentFrame = state.frame;

    // Prune older snapshots if the limit is exceeded
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift(); // Remove the oldest snapshot
    }
  }

  /**
   * Retrieves a snapshot for a specific frame, or the latest snapshot if frame is not provided.
   * @param frame The frame number of the desired snapshot. If not provided, returns the latest.
   * @returns The GameState snapshot, or undefined if not found.
   */
  public getSnapshot(frame?: number): GameState | undefined {
    if (frame === undefined) {
      if (this.snapshots.length === 0) return undefined;
      return JSON.parse(JSON.stringify(this.snapshots[this.snapshots.length - 1]));
    }
    const found = this.snapshots.find(snapshot => snapshot.frame === frame);
    return found ? JSON.parse(JSON.stringify(found)) : undefined;
  }

  /**
   * Returns all stored snapshots.
   */
  public getAllSnapshots(): GameState[] {
    return this.snapshots.map(snapshot => JSON.parse(JSON.stringify(snapshot))); // Return deep copies
  }

  /**
   * Clears all stored snapshots.
   */
  public clearSnapshots(): void {
    this.snapshots = [];
    this.currentFrame = 0;
  }

  /**
   * Returns the current frame number (based on the last recorded snapshot).
   */
  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * Returns the current number of stored snapshots.
   */
  public getSnapshotCount(): number {
    return this.snapshots.length;
  }

  /**
   * Clears all snapshots that occurred after the specified frame number.
   * This is used during rewind to discard "future" history.
   * @param frame The frame number up to which snapshots should be retained (inclusive).
   */
  public clearSnapshotsAfterFrame(frame: number): void {
    const index = this.snapshots.findIndex(snapshot => snapshot.frame > frame);
    if (index !== -1) {
      this.snapshots.splice(index); // Remove all elements from index to the end
    }
    // Update currentFrame if it's now beyond the latest snapshot
    if (this.snapshots.length > 0) {
      this.currentFrame = this.snapshots[this.snapshots.length - 1].frame;
    } else {
      this.currentFrame = 0;
    }
  }
}

/**
 * Utility function to create a deep clone of an object, simulating serialization.
 * In a real game, this would involve a more robust serialization mechanism
 * that handles circular references, custom classes, etc.
 * @param obj The object to serialize/clone.
 * @returns A deep clone of the object.
 */
export function serializeGameState<T>(obj: T): T {
  // A simple JSON-based serialization for demonstration.
  // Real game engines would use custom serialization logic.
  return JSON.parse(JSON.stringify(obj));
}