"use strict";
// src/time/snapshot.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotManager = exports.MAX_SNAPSHOT_COUNT = void 0;
exports.serializeGameState = serializeGameState;
/**
 * Maximum number of snapshots to retain.
 * This prevents excessive memory usage by pruning older snapshots.
 */
exports.MAX_SNAPSHOT_COUNT = 100; // Configurable constant
/**
 * Manages the recording and retrieval of game state snapshots over time.
 * Snapshots are deterministic and size-bounded.
 */
class SnapshotManager {
    constructor(maxSnapshots = exports.MAX_SNAPSHOT_COUNT) {
        this.snapshots = []; // Stores the recorded game states
        this.currentFrame = 0; // Tracks the frame of the latest snapshot
        this.maxSnapshots = maxSnapshots;
    }
    /**
     * Records the current deterministic game state as a snapshot.
     * Older snapshots are pruned if the maximum count is exceeded.
     * @param state The current game state to record.
     */
    recordSnapshot(state) {
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
    getSnapshot(frame) {
        if (frame === undefined) {
            if (this.snapshots.length === 0)
                return undefined;
            return JSON.parse(JSON.stringify(this.snapshots[this.snapshots.length - 1]));
        }
        const found = this.snapshots.find(snapshot => snapshot.frame === frame);
        return found ? JSON.parse(JSON.stringify(found)) : undefined;
    }
    /**
     * Returns all stored snapshots.
     */
    getAllSnapshots() {
        return this.snapshots.map(snapshot => JSON.parse(JSON.stringify(snapshot))); // Return deep copies
    }
    /**
     * Clears all stored snapshots.
     */
    clearSnapshots() {
        this.snapshots = [];
        this.currentFrame = 0;
    }
    /**
     * Returns the current frame number (based on the last recorded snapshot).
     */
    getCurrentFrame() {
        return this.currentFrame;
    }
    /**
     * Returns the current number of stored snapshots.
     */
    getSnapshotCount() {
        return this.snapshots.length;
    }
    /**
     * Clears all snapshots that occurred after the specified frame number.
     * This is used during rewind to discard "future" history.
     * @param frame The frame number up to which snapshots should be retained (inclusive).
     */
    clearSnapshotsAfterFrame(frame) {
        const index = this.snapshots.findIndex(snapshot => snapshot.frame > frame);
        if (index !== -1) {
            this.snapshots.splice(index); // Remove all elements from index to the end
        }
        // Update currentFrame if it's now beyond the latest snapshot
        if (this.snapshots.length > 0) {
            this.currentFrame = this.snapshots[this.snapshots.length - 1].frame;
        }
        else {
            this.currentFrame = 0;
        }
    }
}
exports.SnapshotManager = SnapshotManager;
/**
 * Utility function to create a deep clone of an object, simulating serialization.
 * In a real game, this would involve a more robust serialization mechanism
 * that handles circular references, custom classes, etc.
 * @param obj The object to serialize/clone.
 * @returns A deep clone of the object.
 */
function serializeGameState(obj) {
    // A simple JSON-based serialization for demonstration.
    // Real game engines would use custom serialization logic.
    return JSON.parse(JSON.stringify(obj));
}
