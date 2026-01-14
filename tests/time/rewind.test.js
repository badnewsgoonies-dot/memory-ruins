// tests/time/rewind.test.js
import { SnapshotManager, serializeGameState } from '../src/time/snapshot';
import { RewindManager } from '../src/time/rewind';
import { Player } from '../src/player'; // Assuming player.js provides a Player class

describe('RewindManager', () => {
  let snapshotManager;
  let mockGameState;
  let rewindManager;

  beforeEach(() => {
    snapshotManager = new SnapshotManager(3); // Keep only 3 snapshots
    // Mock the game state, including a Player instance
    mockGameState = {
      frame: 0,
      player: new Player(0, 0, 28, 28), // Initial player position
      enemies: [],
      // Add other relevant game state properties here for testing if needed
    };
    rewindManager = new RewindManager(snapshotManager, mockGameState);
  });

  // Helper to advance game state and record a snapshot
  const advanceGameState = (frames = 1, playerX = 0, playerY = 0) => {
    for (let i = 0; i < frames; i++) {
      mockGameState.frame++;
      mockGameState.player.pos.x = playerX + mockGameState.frame; // Simulate movement
      mockGameState.player.pos.y = playerY + mockGameState.frame;
      mockGameState.player.health = 100 - mockGameState.frame; // Simulate health decrease
      snapshotManager.recordSnapshot(mockGameState);
    }
  };

  test('should restore player position and health after a single rewind', () => {
    // Advance state to frame 1, then to frame 2
    advanceGameState(1, 10, 20); // frame 1, player (11, 21), health 99
    const snapshot1 = serializeGameState(mockGameState); // Capture state after frame 1

    advanceGameState(1, 10, 20); // frame 2, player (12, 22), health 98

    // Verify current state is frame 2
    expect(mockGameState.frame).toBe(2);
    expect(mockGameState.player.pos).toEqual({ x: 12, y: 22 });
    expect(mockGameState.player.health).toBe(98);

    // Rewind
    const success = rewindManager.rewind();
    expect(success).toBe(true);

    // Verify state is restored to snapshot1
    expect(mockGameState.frame).toBe(snapshot1.frame);
    expect(mockGameState.player.pos).toEqual(snapshot1.player.pos);
    expect(mockGameState.player.health).toBe(snapshot1.player.health);
    expect(snapshotManager.getSnapshotCount()).toBe(1); // Only snapshot1 should remain
  });

  test('should restore player position and health after multiple rewinds', () => {
    advanceGameState(1, 10, 20); // frame 1, player (11, 21), health 99
    const snapshot1 = serializeGameState(mockGameState);

    advanceGameState(1, 10, 20); // frame 2, player (12, 22), health 98
    const snapshot2 = serializeGameState(mockGameState);

    advanceGameState(1, 10, 20); // frame 3, player (13, 23), health 97

    // Current state is frame 3
    expect(mockGameState.frame).toBe(3);

    // Rewind once to frame 2
    rewindManager.rewind();
    expect(mockGameState.frame).toBe(snapshot2.frame);
    expect(mockGameState.player.pos).toEqual(snapshot2.player.pos);
    expect(mockGameState.player.health).toBe(snapshot2.player.health);
    expect(snapshotManager.getSnapshotCount()).toBe(2); // snapshot1, snapshot2

    // Rewind again to frame 1
    rewindManager.rewind();
    expect(mockGameState.frame).toBe(snapshot1.frame);
    expect(mockGameState.player.pos).toEqual(snapshot1.player.pos);
    expect(mockGameState.player.health).toBe(snapshot1.player.health);
    expect(snapshotManager.getSnapshotCount()).toBe(1); // snapshot1
  });

  test('should handle rewinding when no previous snapshots are available', () => {
    // Advance to frame 1, which is the only snapshot
    advanceGameState(1, 10, 20); // frame 1

    // Attempt to rewind
    const success = rewindManager.rewind();
    expect(success).toBe(false); // Should not succeed

    // State should remain unchanged (at frame 1)
    expect(mockGameState.frame).toBe(1);
    expect(mockGameState.player.pos).toEqual({ x: 11, y: 21 });
    expect(snapshotManager.getSnapshotCount()).toBe(1); // Still only snapshot1
  });

  test('should clear future snapshots after a rewind', () => {
    advanceGameState(1, 10, 20); // frame 1
    const snapshot1 = serializeGameState(mockGameState);

    advanceGameState(1, 10, 20); // frame 2
    const snapshot2 = serializeGameState(mockGameState);

    advanceGameState(1, 10, 20); // frame 3
    const snapshot3 = serializeGameState(mockGameState);

    expect(snapshotManager.getSnapshotCount()).toBe(3); // All 3 snapshots recorded

    // Rewind to frame 2
    rewindManager.rewind(); // State is now at frame 2

    // Record new history from frame 2
    advanceGameState(1, 30, 40); // new frame 3, player (33, 43), health 97
    expect(mockGameState.frame).toBe(3);
    expect(mockGameState.player.pos).toEqual({ x: 33, y: 43 });

    // The snapshots should now contain original snapshot1, original snapshot2, and the new snapshot for frame 3
    expect(snapshotManager.getSnapshotCount()).toBe(3);
    expect(snapshotManager.getAllSnapshots()[0].frame).toBe(snapshot1.frame);
    expect(snapshotManager.getAllSnapshots()[1].frame).toBe(snapshot2.frame);
    expect(snapshotManager.getAllSnapshots()[2].frame).toBe(mockGameState.frame); // The new snapshot
  });

  test('should not rewind past the oldest snapshot', () => {
    // Record more snapshots than MAX_SNAPSHOTS (which is 3)
    advanceGameState(5, 10, 10); // Frames 1 through 5 recorded. Only 3, 4, 5 are kept.
    // Snapshots: [frame3, frame4, frame5]
    expect(snapshotManager.getSnapshotCount()).toBe(3);
    expect(snapshotManager.getAllSnapshots()[0].frame).toBe(3);

    // Current state is frame 5
    expect(mockGameState.frame).toBe(5);

    // Rewind once to frame 4
    rewindManager.rewind();
    expect(mockGameState.frame).toBe(4);
    expect(snapshotManager.getSnapshotCount()).toBe(2); // [frame3, frame4]

    // Rewind again to frame 3
    rewindManager.rewind();
    expect(mockGameState.frame).toBe(3);
    expect(snapshotManager.getSnapshotCount()).toBe(1); // [frame3]

    // Attempt to rewind past frame 3 (the oldest retained snapshot)
    const success = rewindManager.rewind();
    expect(success).toBe(false); // Should not succeed
    expect(mockGameState.frame).toBe(3); // State remains at frame 3
    expect(snapshotManager.getSnapshotCount()).toBe(1); // Still [frame3]
  });

  test('should reset to the first available snapshot', () => {
    advanceGameState(1); // frame 1
    const snapshot1 = serializeGameState(mockGameState);
    advanceGameState(1); // frame 2
    advanceGameState(1); // frame 3
    advanceGameState(1); // frame 4 (with MAX_SNAPSHOTS=3, this means frame2, frame3, frame4 are kept)

    // Current state is frame 4
    expect(mockGameState.frame).toBe(4);
    expect(snapshotManager.getAllSnapshots()[0].frame).toBe(2); // Oldest retained snapshot is frame 2

    // Rewind to first available (frame 2)
    const success = rewindManager.resetToFirstSnapshot();
    expect(success).toBe(true);
    expect(mockGameState.frame).toBe(2);
    expect(mockGameState.player.pos).toEqual(snapshotManager.getAllSnapshots()[0].player.pos);
    expect(snapshotManager.getSnapshotCount()).toBe(1); // Only frame 2 should remain
  });

  test('should not reset if no snapshots are available', () => {
    const initialFrame = mockGameState.frame;
    const initialPlayerPos = serializeGameState(mockGameState.player.pos);

    const success = rewindManager.resetToFirstSnapshot();
    expect(success).toBe(false);
    expect(mockGameState.frame).toBe(initialFrame);
    expect(mockGameState.player.pos).toEqual(initialPlayerPos);
    expect(snapshotManager.getSnapshotCount()).toBe(0);
  });
});