# Memory Ruins - AI Agent Instructions

## CRITICAL: Read docs/GOVERNANCE.md First

Before any phase work:
1. Check if touching a LOCKED system → require migration plan
2. Check phase budget (max 5 files, 300 LOC)
3. Check if in FREEZE WINDOW → only bug fixes allowed

## Production Block Status

**Current Block: B (Vertical Slice)**

Goal: 3 connected rooms, 1 puzzle, 5-minute playable experience

## Code Quality Rules (ENFORCED)

- ❌ NO magic numbers → use src/constants.ts
- ❌ NO `any` types → define proper interfaces
- ❌ NO console.log → remove or use proper logger
- ✅ Every function needs type annotations
- ✅ 1 test per 50 lines of code

## Locked Systems (DO NOT MODIFY)

- src/time/snapshot.ts
- src/time/rewind.ts
- src/time/objectTime.ts
- src/platforming/physics.ts
- src/player.ts (movement logic)

To modify: Create docs/migrations/MIGRATION_XXX.md first.

## Before Completing Any Phase

Run: `npm test`
Check: tests/gameplay/assertions.test.js passes

## Ship Criteria

When these are ALL true, declare SHIP:
- 3 rooms playable
- 1 puzzle works
- Rewind works
- No crashes in 10 min
- Runs at 60fps
