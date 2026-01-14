// src/time/rewind.ts
import { SnapshotManager, GameState, serializeGameState } from './snapshot';
import { Player } from '../player'; // Assuming player is a primary entity
// import { Enemy } from '../enemy'; // If you have an Enemy class

/**
 * Manages the process of restoring game state from snapshots, effectively "rewinding" the game.
 */
export class RewindManager {
  private snapshotManager: SnapshotManager;
  private currentGameState: GameState; // Reference to the actual game state being managed

  /**
   * @param snapshotManager An instance of SnapshotManager to retrieve historical states.
   * @param initialGameState A reference to the current, mutable game state object.
   */
  constructor(snapshotManager: SnapshotManager, initialGameState: GameState) {
    this.snapshotManager = snapshotManager;
    this.currentGameState = initialGameState;
  }

  /**
   * Applies a given snapshot's state to the current game state.
   * This method performs a deep copy of the snapshot's properties onto the current game state
   * to ensure all aspects are restored correctly.
   * @param snapshot The GameState object to restore from.
   */
  public applySnapshot(snapshot: GameState): void {
    // Deep copy properties from the snapshot to the current game state
    // This assumes currentGameState is the actual, mutable object that the game loop operates on.
    // If GameState is a large, complex object, this might need optimization or more targeted updates.

    // Clear existing collections or complex objects before re-populating
    // This example assumes 'player' and 'enemies' are direct properties.
    // For more complex structures (e.g., dynamic entity lists), careful merging/replacement is needed.

    // Example for player:
    if (this.currentGameState.player && snapshot.player) {
        Object.assign(this.currentGameState.player, serializeGameState(snapshot.player));
    }
    // Example for enemies:
    // This assumes enemies are managed as an array that needs to be completely replaced
    if (this.currentGameState.enemies && snapshot.enemies) {
        this.currentGameState.enemies = serializeGameState(snapshot.enemies);
    }
    // General approach for other top-level properties
    Object.keys(snapshot).forEach(key => {
        if (key !== 'player' && key !== 'enemies' && Object.prototype.hasOwnProperty.call(this.currentGameState, key)) {
            // Only assign if the property already exists on currentGameState
            // This prevents adding unexpected properties from snapshots.
            this.currentGameState[key] = serializeGameState(snapshot[key]);
        }
    });

    // Crucially, update the current frame to match the restored snapshot's frame
    this.currentGameState.frame = snapshot.frame;
  }

  /**
   * Rewinds the game state to the previous available snapshot.
   * It retrieves the snapshot *before* the current game state's frame.
   * If no previous snapshot is available, the state remains unchanged.
   * @returns true if rewind was successful, false otherwise.
   */
  public rewind(): boolean {
    const currentFrame = this.currentGameState.frame;
    const allSnapshots = this.snapshotManager.getAllSnapshots();

    // Find the snapshot that was recorded immediately before the current frame
    // This ensures we're stepping back one logical game tick/state.
    let previousSnapshot: GameState | undefined;
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
  public resetToFirstSnapshot(): boolean {
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