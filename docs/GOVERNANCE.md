# Memory Ruins - Production Governance

## 1. Core Loop Lock (FROZEN)

These systems are **LOCKED** - any changes require migration plan + tests:

| System | Status | Lock Date |
|--------|--------|-----------|
| Player movement | 🔒 LOCKED | 2026-01-14 |
| Rewind mechanics | 🔒 LOCKED | 2026-01-14 |
| Snapshot system | 🔒 LOCKED | 2026-01-14 |
| Object time relations | 🔒 LOCKED | 2026-01-14 |
| Save/Load format | 🔒 LOCKED | TBD |

### To modify a locked system:
1. Create `docs/migrations/MIGRATION_XXX.md`
2. Write migration tests FIRST
3. Get approval (add to ORCH_JOURNAL with rationale)
4. Implement with backward compatibility

---

## 2. Production Blocks (Phase Compression)

Instead of micro-phases, use validated gameplay milestones:

### Block A: Core Playable Loop ✅
- Movement, jump, collision
- Rewind mechanic
- Object time immunity
- Audio feedback

### Block B: Vertical Slice (CURRENT)
- 3 connected rooms
- 1 puzzle using time mechanics
- Start → puzzle → exit flow
- 5-minute playable experience

### Block C: Content Expansion
- 8 room templates
- 3 area themes
- Enemy encounters
- Boss fight

### Block D: Polish & Ship
- Menus (main, pause)
- Save/load
- HUD
- Audio pass

---

## 3. Gameplay Assertions

Before completing a Production Block, these must be TRUE:

### Block B Assertions (Vertical Slice):
- [ ] Player can move left/right and jump
- [ ] Player can enter Room 1, solve puzzle, exit to Room 2
- [ ] Rewind changes observable game state
- [ ] Time-immune objects behave correctly during rewind
- [ ] No soft-locks (player can always progress or restart)
- [ ] Audio plays on jump and rewind
- [ ] Game runs for 5 minutes without crash

### Verification Method:
```bash
npm run test:gameplay  # Automated assertions
# OR manual: load game, play 5 minutes, check assertions
```

---

## 4. Phase Budget Rules

| Rule | Limit |
|------|-------|
| Max new files per phase | 5 |
| Max lines of code per phase | 300 |
| Max new systems per block | 2 |
| Mandatory test ratio | 1 test per 50 LOC |

If a phase exceeds limits → REPLAN into sub-phases.

---

## 5. Creative Freeze Windows

After every Production Block completion:

**FREEZE PERIOD (2 phases):**
- ❌ No new mechanics
- ❌ No new systems  
- ✅ Bug fixes only
- ✅ Polish and UX
- ✅ Performance
- ✅ Documentation

---

## 6. Orchestrator Authority

The Strategic Orchestrator CAN:
- ✅ Skip phases (mark unnecessary)
- ✅ Merge phases (combine related work)
- ✅ Cut features (declare out of scope)
- ✅ Roll back (revert to last stable)
- ✅ Declare SHIP (block is playable enough)

The Orchestrator CANNOT:
- ❌ Modify locked systems without migration
- ❌ Exceed phase budget without REPLAN
- ❌ Complete block without gameplay assertions

---

## 7. Ship Criteria

**Minimum Viable Game (MVP):**
- [ ] 3 unique rooms
- [ ] 1 complete puzzle
- [ ] Working rewind mechanic
- [ ] Start and end state
- [ ] No crashes in 10-minute session
- [ ] Runs in browser at 60fps

**When MVP is met → STOP BUILDING, START SHIPPING**
