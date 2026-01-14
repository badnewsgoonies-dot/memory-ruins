Title: Technical Architecture

Overview
- Purpose: Define module boundaries, main loop, and integration points for the game to ensure modularity, determinism, testability, and clear ownership of systems.
- Non-goals: Implementation details and algorithm micro-optimizations; those belong to design docs per-system.

File layout
- docs/: design and architecture documentation (docs/architecture.md, design/overview.md, game_design.md)
- src/core/: core bootstrap, scheduler, config, and logger
- src/systems/: domain systems (time_anchor, puzzle, narrative), each with its own subdirectory
- src/ui/: rendering, input handling, and HUD adapters
- src/data/: persistence adapters, asset manifests, and data-driven content (puzzles/*.json)
- tests/: deterministic unit and integration tests (seed+inputs scenarios)


Module boundaries
1. Core
   - Responsibilities: Application bootstrap, configuration, lifecycle management, deterministic scheduler, main loop, and global constants.
   - Exposes: Scheduler, Config, Logger interfaces.
2. Simulation (Deterministic Engine)
   - Responsibilities: Physics, collision, deterministic game state updates, fixed-timestep advancement.
   - Contracts: Pure update(delta, state) functions, no side-effects; accepts seeded RNG objects.
3. Game Logic / Rules
   - Responsibilities: High-level rules, progression, state transitions, deterministic decision application.
   - Integrates with Simulation via well-defined state deltas and events.
4. AI / Agents
   - Responsibilities: Decision-making, pathfinding, planning. Must accept state snapshots and return actions; deterministic when given same seed.
5. Data / Persistence
   - Responsibilities: Load/save game state, assets metadata, configuration. Provides import/export adapters and versioned schemas.
6. Assets / Content
   - Responsibilities: Raw assets (audio, sprites, models), content manifests, and packing tools. Accessed read-only at runtime via asset loader.
7. UI / Presentation
   - Responsibilities: Rendering, input handling, HUD. Receives authoritative state from Simulation/Game Logic; should be side-effect free for state queries.
8. Networking (optional multiplayer)
   - Responsibilities: Deterministic replay protocol, authoritative server, sync/reconciliation layer. Network messages are serialized commands/events.

Main loop (authoritative, deterministic)
- Use a fixed-timestep loop with accumulator to decouple render rate from simulation rate.
- Seedable RNG passed explicitly to any subsystem that uses randomness.

Pseudocode
- initialize(config)
- seed = Config.seed || generateSeed()
- scheduler = Core.Scheduler(fixed_timestep)
- while (running) {
    inputs = UI.pollInputs()
    scheduler.accumulate(delta)
    while (scheduler.canStep()) {
      deterministicRNG = RNG(seed, tick)
      state = Simulation.update(state, inputs, deterministicRNG)
      state = GameRules.apply(state)
      AI.step(state, deterministicRNG)
      tick++
    }
    UI.render(state)
  }

Integration points and contracts
- Inputs: well-formed input events with timestamps; validated at Core boundary.
- State snapshots: immutable or copy-on-write snapshots passed between modules.
- Events/Commands: small serializable structs; used for networking, replay, and testing.
- APIs: clear interfaces (e.g., Simulation.update(state, commands, rng) => newState) with unit tests and property tests.

Determinism guarantees
- Fixed timestep, explicit RNG seeding, and pure update semantics for simulation and rules.
- Persisted seed + tick allows full deterministic replays and automated tests.

Testing and observability
- Units: pure functions for rules and simulation.
- Integration: recorded deterministic scenarios (seed+inputs) for regression tests.
- Telemetry: read-only diagnostic hooks to avoid altering state during capture.

Notes on extensibility
- Keep modules small and interface-driven.
- Favor data-driven content and feature toggles via configuration rather than hardcoded logic.

Domain-specific systems (mapping to game_design_outline.md)
- Time-Anchor System (src/systems/time_anchor): encapsulates anchor state, local-scope application (ROOM_TIME_SCOPE), deterministic apply/rollback semantics expressed as pure state transforms; accepts explicit RNG seed when needed.
- Puzzle & Interaction System (src/systems/puzzle): primitive puzzle types and small state machines; puzzle definitions live in data/puzzles/*.json and are exercised via pure step/update functions for unit testing and determinism.
- Narrative Fragment System (src/systems/narrative): fragment storage, collection mechanics, and branch-state manager (BRANCH_STATES constant); deterministic application of fragment effects to game-state and clear adapter to UI.
- State Persistence & Feedback (src/data/persistence_adapters): deterministic save format includes seed + tick; read-only diagnostic hooks and UI adapters for fragment log and branch indicator live at the presentation edge.
- Contracts: each domain module exposes small, well-typed interfaces (e.g., update(state, commands, rng) => newState) and keeps side-effects (IO, asset loads) at the outermost layer to preserve pure core logic and enable replay/testing.
