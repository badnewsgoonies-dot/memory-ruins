# Overview — Design Charter (Phase 1)

Genre
- Rogue-lite puzzle-platformer (narrative-driven, single-player).

Core loop
- Enter short runs built from handcrafted rooms + light procedural sequencing.
- Solve environmental and temporal puzzles to retrieve Story Shards.
- Return to meta-progression hub to spend Shards on persistent upgrades and unlock new rooms.
- Repeat: faster, deeper runs with emergent puzzle combinations.

Target playtime
- Primary session: 20–45 minutes per run (core loop).
- Intended completion time: 6–12 hours cumulative to reach late-game content across multiple runs.

High-level tech choices
- Engine: Phaser 3 (TypeScript) for 2D scene, physics, and rendering portability (web + desktop builds).
- Language: TypeScript for deterministic types and shared code between engine and tools.
- Tooling: tsc (build), Jest (unit tests), ts-node (dev runner), Node.js for build/test scripts.
- Packaging: Web-first (HTML5), optional Electron wrapper for desktop distribution.

Design constraints & principles
- No "magic numbers": all gameplay values exposed as named constants in source.
- Deterministic loop: state snapshots for reproducible puzzles and debugging.
- Small, testable systems: isolate physics, puzzle logic, and progression for unit testing.

