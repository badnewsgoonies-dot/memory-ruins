// tests/time/snapshot.test.js

import { SnapshotManager, MAX_SNAPSHOT_COUNT } from '../../src/time/snapshot';

describe('SnapshotManager', () => {
  let snapshotManager;

  beforeEach(() => {
    snapshotManager = new SnapshotManager(3); // Use a small maxSnapshots for easier testing
  });

  // Helper to create a simple game state
  const createGameState = (frame, playerHealth = 100) => ({
    frame,
    player: { position: { x: frame * 10, y: frame * 5 }, health: playerHealth },
    enemies: [{ id: 'goblin-1', position: { x: 100, y: 100 }, health: 50 }],
  });

  test('should record and retrieve a single snapshot', () => {
    const state = createGameState(1);
    snapshotManager.recordSnapshot(state);
    const retrieved = snapshotManager.getSnapshot();
    expect(retrieved).toEqual(state);
    expect(snapshotManager.getCurrentFrame()).toBe(1);
  });

  test('should record multiple snapshots and retrieve the latest', () => {
    snapshotManager.recordSnapshot(createGameState(1));
    snapshotManager.recordSnapshot(createGameState(2));
    const latest = createGameState(3);
    snapshotManager.recordSnapshot(latest);

    expect(snapshotManager.getSnapshot()).toEqual(latest);
    expect(snapshotManager.getCurrentFrame()).toBe(3);
  });

  test('should return correct snapshot by frame number', () => {
    const state1 = createGameState(1);
    const state2 = createGameState(2);
    snapshotManager.recordSnapshot(state1);
    snapshotManager.recordSnapshot(state2);
    snapshotManager.recordSnapshot(createGameState(3));

    expect(snapshotManager.getSnapshot(1)).toEqual(state1);
    expect(snapshotManager.getSnapshot(2)).toEqual(state2);
    expect(snapshotManager.getSnapshot(999)).toBeUndefined(); // Non-existent frame
  });

  test('should prune older snapshots when MAX_SNAPSHOT_COUNT is exceeded', () => {
    // Record more than the maxSnapshots (which is 3 for this test)
    snapshotManager.recordSnapshot(createGameState(1));
    snapshotManager.recordSnapshot(createGameState(2));
    snapshotManager.recordSnapshot(createGameState(3));
    snapshotManager.recordSnapshot(createGameState(4)); // This should cause state 1 to be pruned

    const allSnapshots = snapshotManager.getAllSnapshots();
    expect(allSnapshots.length).toBe(3);
    expect(allSnapshots[0].frame).toBe(2); // The oldest remaining snapshot
    expect(snapshotManager.getSnapshot(1)).toBeUndefined(); // Confirm pruned
    expect(snapshotManager.getSnapshot(2)).toBeDefined();
  });

  test('should return a deep copy of the snapshot and not be mutable', () => {
    const originalState = createGameState(1, 100);
    snapshotManager.recordSnapshot(originalState);

    const retrievedState = snapshotManager.getSnapshot();
    retrievedState.player.health = 50; // Mutate the retrieved state

    const storedSnapshot = snapshotManager.getSnapshot(0); // Corrected from index 1 to 0
    expect(storedSnapshot.player.health).toBe(100); // Original stored state should be unchanged
    expect(storedSnapshot).not.toBe(retrievedSnapshot); // Should be different objects
  });

  test('should clear all snapshots', () => {
    snapshotManager.takeSnapshot({ a: 1 });
    snapshotManager.takeSnapshot({ b: 2 });
    expect(snapshotManager.getSnapshotCount()).toBe(2);
    snapshotManager.clearSnapshots();
    expect(snapshotManager.getSnapshotCount()).toBe(0);
  });


  test('should use the default MAX_SNAPSHOT_COUNT if not provided in constructor', () => {
    const defaultManager = new SnapshotManager();
    expect(defaultManager['maxSnapshots']).toBe(MAX_SNAPSHOT_COUNT); // Access private for testing default
  });
});