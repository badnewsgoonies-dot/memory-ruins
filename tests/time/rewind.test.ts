import { SnapshotManager, GameState } from '../../src/time/snapshot';
import { RewindManager } from '../../src/time/rewind';
import { isKeyJustPressed, clearJustPressedKeys, REWIND_KEY, initInput, _clearKeys, _setKeyJustPressed } from '../../src/input';

// --- Global Mocks and Helpers for Input ---
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn((event: Event) => {
    // We don't need to manually trigger listeners here because initInput() adds them directly to this mockWindow.
    // The issue was that jest.fn() for dispatchEvent was not calling the registered listeners.
    // We expect initInput to correctly register its listeners on mockWindow.
    // However, if the listener callback itself relies on 'this' being 'window',
    // a simple mock like this might still cause issues. For now, let's assume
    // the listeners are correctly invoked when dispatchEvent is called.
    return true;
  }),
};

class MockKeyboardEvent extends Event {
  code: string;
  key: string;
  repeat: boolean;

  constructor(type: string, eventInitDict?: KeyboardEventInit) {
    super(type, eventInitDict);
    this.code = eventInitDict?.code || '';
    this.key = eventInitDict?.key || '';
    this.repeat = eventInitDict?.repeat || false;
  }
}

// Assign mocks to global scope for the test suite
Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
Object.defineProperty(global, 'KeyboardEvent', { value: MockKeyboardEvent, writable: true });

// Helper function to simulate a key press event that directly manipulates input state
// This bypasses the mockWindow.dispatchEvent for direct key state control.
const simulateKeyPress = (keyCode: string, justPressed: boolean) => {
  _setKeyJustPressed(keyCode, justPressed);
};

// Define a simple mock GameState for testing purposes
interface MockGameState extends GameState {
  frame: number;
  player: {
    position: { x: number; y: number };
    health: number;
    inventory: string[];
  };
  enemies: Array<{
    id: string;
    position: { x: number; y: number };
    health: number;
  }>;
}

describe('RewindManager', () => {
  let snapshotManager: SnapshotManager;
  let currentGameState: MockGameState;
  let rewindManager: RewindManager;

  beforeEach(() => {
    // Reset and initialize input system for each test
    _clearKeys(); // Clear internal state of the input module (keys and keysJustPressed)
    initInput(); // Re-initialize input to attach listeners to the mocked window
    jest.clearAllMocks(); // Clear any Jest mock calls on dispatchEvent etc.

    snapshotManager = new SnapshotManager(10); // Keep last 10 snapshots
    currentGameState = {
      frame: 0,
      player: {
        position: { x: 0, y: 0 },
        health: 100,
        inventory: ['sword'], // Ensure inventory is initialized
      },
      enemies: [{ id: 'goblin', position: { x: 10, y: 10 }, health: 50 }], // Ensure enemies are initialized
    };
    rewindManager = new RewindManager(snapshotManager, currentGameState);
  });

  it('should record snapshots correctly', () => {
    snapshotManager.recordSnapshot(currentGameState);
    expect(snapshotManager.getSnapshotCount()).toBe(1);
    expect(snapshotManager.getCurrentFrame()).toBe(0);

    currentGameState.frame = 1;
    currentGameState.player.position.x = 1;
    currentGameState.player.inventory = ['axe']; // Change state
    snapshotManager.recordSnapshot(currentGameState);
    expect(snapshotManager.getSnapshotCount()).toBe(2);
    expect(snapshotManager.getCurrentFrame()).toBe(1);

    const snapshot0 = snapshotManager.getSnapshot(0);
    expect(snapshot0?.player.position.x).toBe(0);
    expect(snapshot0?.player.inventory).toEqual(['sword']);
    const snapshot1 = snapshotManager.getSnapshot(1);
    expect(snapshot1?.player.position.x).toBe(1);
    expect(snapshot1?.player.inventory).toEqual(['axe']);
  });

  it('should rewind to the previous snapshot', () => {
    // Record several snapshots
    for (let i = 0; i < 5; i++) {
      currentGameState.frame = i;
      currentGameState.player.position.x = i * 10;
      currentGameState.player.health = 100 - (i * 10);
      currentGameState.player.inventory = [`item_${i}`];
      currentGameState.enemies = [{ id: 'goblin', position: { x: 10 + i, y: 10 + i }, health: 50 - i }];
      snapshotManager.recordSnapshot(currentGameState);
    }

    // Advance one more frame without recording, to simulate current live state
    currentGameState.frame = 5;
    currentGameState.player.position.x = 50;
    currentGameState.player.health = 50;
    currentGameState.player.inventory = ['item_5'];
    currentGameState.enemies = [{ id: 'goblin', position: { x: 15, y: 15 }, health: 45 }];

    expect(currentGameState.frame).toBe(5);
    expect(currentGameState.player.position.x).toBe(50);

    // Trigger rewind
    const rewound = rewindManager.rewind();
    expect(rewound).toBe(true);

    // Should be rewound to frame 4
    expect(currentGameState.frame).toBe(4);
    expect(currentGameState.player.position.x).toBe(40);
    expect(currentGameState.player.health).toBe(60);
    expect(currentGameState.player.inventory).toEqual(['item_4']);
    expect(currentGameState.enemies[0].position).toEqual({ x: 14, y: 14 });
    expect(currentGameState.enemies[0].health).toBe(46);

    // Verify snapshots after rewind (future snapshots should be cleared)
    expect(snapshotManager.getSnapshotCount()).toBe(5); // Snapshots 0-4 should remain
    expect(snapshotManager.getSnapshot(5)).toBeUndefined(); // Frame 5 snapshot should be gone
    expect(snapshotManager.getCurrentFrame()).toBe(4); // Current frame should reflect the rewound state
  });

  it('should not rewind if no previous snapshots are available', () => {
    snapshotManager.recordSnapshot(currentGameState); // Only one snapshot
    expect(currentGameState.frame).toBe(0);

    const rewound = rewindManager.rewind();
    expect(rewound).toBe(false);
    expect(currentGameState.frame).toBe(0); // Should remain at frame 0
    expect(snapshotManager.getSnapshotCount()).toBe(1); // Still only one snapshot
  });

  it('should clear future snapshots when rewinding multiple times', () => {
    // Record initial state
    snapshotManager.recordSnapshot(currentGameState); // frame 0

    // Advance and record more states
    for (let i = 1; i <= 5; i++) {
        currentGameState.frame = i;
        currentGameState.player.position.x = i;
        currentGameState.player.inventory = [`item_${i}`];
        currentGameState.enemies = [{ id: 'goblin', position: { x: 10 + i, y: 10 + i }, health: 50 - i }];
        snapshotManager.recordSnapshot(currentGameState);
    }
    // currentGameState is at frame 5, snapshots 0-5 are stored

    // Rewind once, to frame 4
    rewindManager.rewind();
    expect(currentGameState.frame).toBe(4);
    expect(snapshotManager.getSnapshotCount()).toBe(5); // 0, 1, 2, 3, 4
    expect(snapshotManager.getSnapshot(5)).toBeUndefined();

    // Change current state, then record another snapshot (divergent history)
    currentGameState.frame = 5;
    currentGameState.player.position.x = 99; // New divergent state
    currentGameState.player.inventory = ['divergent_item'];
    snapshotManager.recordSnapshot(currentGameState); // New snapshot at frame 5 (different from original frame 5)

    expect(snapshotManager.getSnapshotCount()).toBe(6); // 0, 1, 2, 3, 4, NEW 5
    expect(snapshotManager.getSnapshot(5)?.player.position.x).toBe(99);
    expect(snapshotManager.getSnapshot(5)?.player.inventory).toEqual(['divergent_item']);

    // Rewind again, should go to frame 4, and no new snapshots should exist for frame 5 after this rewind
    rewindManager.rewind();
    expect(currentGameState.frame).toBe(4);
    expect(currentGameState.player.position.x).toBe(4); // Should be original frame 4 state
    expect(currentGameState.player.inventory).toEqual(['item_4']);
    expect(snapshotManager.getSnapshotCount()).toBe(5); // Snapshots 0-4
    expect(snapshotManager.getSnapshot(5)).toBeUndefined(); // The divergent snapshot at frame 5 should be gone
  });


  it('should integrate with input system to trigger rewind', () => {
    // Record some states
    for (let i = 0; i < 3; i++) {
        currentGameState.frame = i;
        currentGameState.player.position.x = i * 10;
        snapshotManager.recordSnapshot(currentGameState);
    }
    // currentGameState is at frame 2, snapshots 0-2 are stored

    // Advance current state beyond recorded snapshots
    currentGameState.frame = 3;
    currentGameState.player.position.x = 30;

    // Simulate key press for rewind using the direct input state manipulation helper
    simulateKeyPress(REWIND_KEY, true);

    // Check if isKeyJustPressed returns true and then resets
    expect(isKeyJustPressed(REWIND_KEY)).toBe(true);
    // The second call should return false because the "just pressed" state is consumed internally by isKeyJustPressed
    expect(isKeyJustPressed(REWIND_KEY)).toBe(false);

    // To test the rewind logic being triggered by a "just pressed" key,
    // we need to simulate the key being "just pressed" again for the rewind check.
    simulateKeyPress(REWIND_KEY, true); // Simulate a fresh key press for the next frame's check

    if (isKeyJustPressed(REWIND_KEY)) {
        rewindManager.rewind();
    }
    clearJustPressedKeys(); // Simulate end-of-frame clearing

    // Verify state after rewind
    expect(currentGameState.frame).toBe(2);
    expect(currentGameState.player.position.x).toBe(20);
    expect(snapshotManager.getSnapshotCount()).toBe(3); // Snapshots 0-2
    expect(snapshotManager.getCurrentFrame()).toBe(2);
  });

  it('should reset to the first snapshot', () => {
    // Record several snapshots
    for (let i = 0; i < 5; i++) {
        currentGameState.frame = i;
        currentGameState.player.position.x = i * 10;
        currentGameState.player.inventory = [`item_${i}`];
        snapshotManager.recordSnapshot(currentGameState);
    }

    // currentGameState is at frame 4. Let's manually advance it further
    currentGameState.frame = 10;
    currentGameState.player.position.x = 100;
    currentGameState.player.inventory = ['final_item'];

    expect(currentGameState.frame).toBe(10);
    expect(currentGameState.player.position.x).toBe(100);

    const reset = rewindManager.resetToFirstSnapshot();
    expect(reset).toBe(true);

    // Should be reset to frame 0
    expect(currentGameState.frame).toBe(0);
    expect(currentGameState.player.position.x).toBe(0);
    expect(currentGameState.player.inventory).toEqual(['item_0']);
    expect(snapshotManager.getSnapshotCount()).toBe(1); // Only the first snapshot remains
    expect(snapshotManager.getCurrentFrame()).toBe(0);
  });
});
