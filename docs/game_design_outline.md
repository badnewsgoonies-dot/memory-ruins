# Game Design Outline — Puzzle-Adventure (Strategic Phase 2)

## Purpose
Provide a scoped gameplay and content blueprint that supports a coherent 1+ hour single-player experience based on docs/game_concept.md. This document lists major systems, content targets (levels/quests/puzzles), progression, and required features/assets to achieve the deliverable.

---

## High-level Overview
- Genre: Puzzle-Adventure, single-player, narrative-driven.
- Core hook: Localized time-manipulation that affects room/object states plus memory-fragment recovery that branches story state across a small number of meaningful variants.
- Session target: TARGET_PLAYTIME_HOURS = 1.0 (design for 45–90 minutes, target 60 minutes).

---

## Major Systems
1. Time-Anchor System
   - Function: Apply rewind/fast-forward/hold effects limited to a room or interactable object.
   - Constraints: ROOM_TIME_SCOPE (affects only objects and doors in the same room) to limit complexity.
   - Tooling: Time-Anchor device in UI with 3 states: Rewind, Fast-Forward, Anchor.

2. Exploration & Navigation
   - Small interconnected facility: 4–6 themed rooms per session with modular connections (airlock, lab, comms, archive, maintenance, observation).
   - Map: implicit minimal map and visual cues; no large-world traversal.

3. Puzzle & Interaction System
   - Puzzle types: spatial sequencing, state-permutation (object states across time), pattern reconstruction (journal fragments), multi-step machinery resets.
   - Puzzle primitives: switches, movable objects, time-locked doors, energy conduits.
   - Inventory-lite items: Scanner (reveals hidden states), Recorder (captures state), Time-Anchor (applies time effects).

4. Narrative Fragment System
   - Memory fragments are collectible text/audio that reveal lore and alter the facility state if restored.
   - Branching limited to BRANCH_STATES = 3 (e.g., Conservator, Rationalizer, Reckoner) to keep content feasible.

5. State Persistence & Feedback
   - Changes from time manipulation are deterministic within a playthrough and clearly signaled by visual/audio cues.
   - Player can view restored-memory summary and active branch state in a small UI panel.

---

## Content Targets (for 1+ hour experience)
- Areas: 4 distinct rooms with connected traversal and a small hub.
- Puzzles: 8–12 puzzles total (2–3 per room) using permutations of the time mechanic and limited object interactions.
- Narrative: 10–15 short fragments (text or short VO clips) with 5 critical fragments that determine end-state branch.
- Assets: modular environment kits (3 themes), 12 interactable object models, 8 SFX groups, 10–15 VO/text fragments.

---

## Progression & Pacing (45–90 min target)
- Intro (0–10 min): Short tutorial room introducing movement, scanner, and single-object rewind.
- Early (10–25 min): 2 rooms with straightforward puzzles combining object movement + local rewind.
- Mid (25–45 min): 2 rooms with multi-step puzzles requiring setting anchors, using recorder, and combining fragments.
- Climax (45–60+ min): Final room combines two previously learned mechanics into a layered puzzle; final 1–3 memory fragments produce distinct final scene variants.
- Optional pacing buffer: small optional side puzzle or collectible area to extend playtime toward 90 minutes.

---

## Required Features & Content Types
- Core gameplay code: Time-anchor subsystem, room-scoped state manager, puzzle state machine, minimal save/checkpointing.
- UI: compact device HUD, memory fragment log, branch-state indicator, tutorial popups.
- Art: modular environment tiles, 12 interactable object assets, 3 room themes.
- Audio: ambient beds per room, 8–12 SFX, 10–15 short VO lines (or text if VO unavailable).
- Tools: Scanner, Recorder, Time-Anchor device models + animations.
- Data: Puzzle definitions (scriptable), fragment content pack, room layout metadata.

---

## Technical & Production Constraints (scope control)
- Limit branching to BRANCH_STATES (3) and rooms to ROOM_COUNT_TARGET = 4–6 to avoid combinatorial explosion.
- Keep inventory small (<= 3 active tools) to reduce UI/UX scope.
- Use deterministic puzzle states and unit-testable puzzle primitives to reduce QA overhead.
- Avoid global rewinds or physics-reliant solutions; prefer deterministic object-state swaps to simplify engineering.

---

## Acceptance Criteria (Definition of Done for this phase)
- A playthrough delivering TARGET_PLAYTIME_HOURS ≈ 1.0 of coherent gameplay from intro to final resolution.
- At least 4 rooms implemented with 8 puzzles covering core mechanics.
- Narrative fragment set (10–15) integrated, with 5 fragments controlling branch state and final variant.
- Minimal UI to view fragments and active branch state; clear player feedback for time manipulations.

---

## Deliverables & Next Steps
1. Draft first-area one-page level flow and detailed design for 6–8 puzzle interactions (prerequisite for prototyping).
2. Produce asset list and task breakdown for art/audio (modular environment kits, interactables, VO/text fragments).
3. Implement Time-Anchor subsystem and one tutorial room prototype.
4. QA checklist for deterministic puzzle behavior and player feedback.

---

## Constants (design-oriented)
- TARGET_PLAYTIME_HOURS = 1.0
- ROOM_COUNT_TARGET = 4..6
- PUZZLES_TOTAL_TARGET = 8..12
- BRANCH_STATES = 3

---

## Sample Puzzle List (mapped to progression)
- Puzzle 1 — "Diagnostic Rewind" (Intro): teach single-object rewind to restore a power conduit and open the first door.
- Puzzle 2 — "Sequence Relay" (Early room A): align a temporal sequence across two devices using rewind/fast-forward to trigger a relay.
- Puzzle 3 — "Mirror Maintenance" (Early room B): move an object and fast-forward a mechanism to remove an obstruction and reveal a fragment.
- Puzzle 4 — "Recorder Lock" (Mid room A): use the Recorder to capture a desired state, anchor it, then manipulate surroundings to match and unlock a compartment.
- Puzzle 5 — "Energy Routing" (Mid room B): set anchors to re-route energy conduits in the correct time order to power a core node.
- Puzzle 6 — "Fragment Assembly" (Optional mid): collect and arrange 3 memory fragments to reconstruct a pattern that opens a side cache (extends playtime).
- Puzzle 7 — "Dual-Anchor Challenge" (Climax setup): employ two anchors in sequence to synchronize objects across short time windows and open the final chamber.
- Puzzle 8 — "Final Resolution" (Climax): a layered puzzle combining sequence, anchors, and recovered fragments to access the final memory; collected critical fragments determine one of the BRANCH_STATES final variants.

---

Notes: This outline closely follows docs/game_concept.md to respect previous phase decisions and purposefully constrains branching and global mechanics to keep a 1+ hour prototype achievable with limited art/audio scope.