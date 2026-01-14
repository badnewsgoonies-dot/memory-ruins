"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewindManager = void 0;
// src/time/rewind.ts
const snapshot_1 = require("./snapshot");
// import { Enemy } from '../enemy'; // If you have an Enemy class
/**
 * Manages the process of restoring game state from snapshots, effectively "rewinding" the game.
 */
class RewindManager {
    /**
     * @param snapshotManager An instance of SnapshotManager to retrieve historical states.
     * @param initialGameState A reference to the current, mutable game state object.
     */
    constructor(snapshotManager, initialGameState) {
        this.snapshotManager = snapshotManager;
        this.currentGameState = initialGameState;
    }
    /**
     * Applies a given snapshot's state to the current game state.
     * This method performs a deep copy of the snapshot's properties onto the current game state
     * to ensure all aspects are restored correctly.
     * @param snapshot The GameState object to restore from.
     */
    applySnapshot(snapshot) {
        // Deserialize the snapshot to ensure a deep copy, then apply its properties
        // to the currentGameState. This correctly handles nested objects and arrays.
        const restoredState = (0, snapshot_1.serializeGameState)(snapshot);
        // Update player state
        if (this.currentGameState.player && restoredState.player) {
            Object.assign(this.currentGameState.player, restoredState.player);
        }
        else {
            this.currentGameState.player = restoredState.player;
        }
        // Update enemies state (assuming it's an array that should be replaced)
        if (this.currentGameState.enemies && restoredState.enemies) {
            this.currentGameState.enemies = [...restoredState.enemies];
        }
        else {
            this.currentGameState.enemies = restoredState.enemies;
        }
        // Update other top-level properties.
        // Iterate over all keys in the restored state and assign them to the current state.
        // This ensures all aspects of the game state, including new properties or changed structures,
        // are fully restored.
        for (const key in restoredState) {
            if (Object.prototype.hasOwnProperty.call(restoredState, key) &&
                key !== 'player' && key !== 'enemies') {
                this.currentGameState[key] = (0, snapshot_1.serializeGameState)(snapshot[key]);
            }
        }
        // Crucially, update the current frame to match the restored snapshot's frame
        this.currentGameState.frame = restoredState.frame;
    }
    /**
     * Rewinds the game state to the previous available snapshot.
     * It retrieves the snapshot *before* the current game state's frame.
     * If no previous snapshot is available, the state remains unchanged.
     * @returns true if rewind was successful, false otherwise.
     */
    rewind() {
        const currentFrame = this.currentGameState.frame;
        const allSnapshots = this.snapshotManager.getAllSnapshots();
        // Find the snapshot that was recorded immediately before the current frame
        // This ensures we're stepping back one logical game tick/state.
        let previousSnapshot;
        for (let i = allSnapshots.length - 1; i >= 0; i--) {
            if (allSnapshots[i].frame < currentFrame) {
                previousSnapshot = allSnapshots[i];
                break;
            }
        }
        if (previousSnapshot) {
            this.applySnapshot(previousSnapshot);
            // After rewinding, clear all snapshots that are now "future" relative to the new current state
            this.snapshotManager.clearSnapshotsAfterFrame(this.currentGameState.frame);
            return true;
        }
        return false;
    }
    /**
     * Resets the game to the very first available snapshot, if any.
     * @returns true if reset was successful, false otherwise.
     */
    resetToFirstSnapshot() {
        const allSnapshots = this.snapshotManager.getAllSnapshots();
        if (allSnapshots.length > 0) {
            this.applySnapshot(allSnapshots[0]);
            // Clear all future snapshots relative to the first one
            this.snapshotManager.clearSnapshotsAfterFrame(this.currentGameState.frame);
            return true;
        }
        return false;
    }
}
exports.RewindManager = RewindManager;
