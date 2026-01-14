Planned file structure for code, assets, and data

Principles
- Clear separation of code, assets, and generated data.
- No magic filenames; use constants/config for critical paths.
- Versioned schemas for saved data and content manifests.

Top-level
- README.md (project overview)
- docs/ (design and architecture docs)
- src/ (source code)
- assets/ (graphics, audio, fonts)
- data/ (game data, manifests, localization)
- tools/ (build, packing, content generation scripts)
- config/ (environment and deployment configs)
- tests/ (unit and integration tests)
- build/ (generated build artifacts)

Suggested src layout
- src/core/
  - bootstrap.ts|py|go (entry point)
  - scheduler.*
  - config.*
  - logger.*
- src/simulation/
  - physics.*
  - collision.*
  - deterministic_rng.*
- src/game/
  - rules.*
  - progression.*
  - events.*
- src/agents/
  - ai_manager.*
  - behaviors/*
- src/ui/
  - renderer.*
  - input.*
  - hud.*
- src/data/
  - persistence_adapters/*
  - schemas/*

Assets and data
- assets/sprites/
- assets/audio/
- assets/shaders/
- data/manifests/content_manifest.json (versioned)
- data/localization/en/*.json
- data/levels/*.json

Tools and scripts
- tools/pack_assets.py (or .js)
- tools/generate_content_manifest.py
- tools/run_deterministic_tests.py

Config and constants
- config/default.yaml (paths, fixed_timestep, seed defaults)
- config/production.yaml

Tests
- tests/unit/
- tests/integration/
- tests/deterministic_replays/ (seed + input logs)

Key files (examples)
- src/core/scheduler.* — fixed-timestep loop implementation and constants (FIXED_TIMESTEP_MS)
- src/simulation/update.* — pure update functions
- src/game/rules.* — deterministic rule application
- data/manifests/content_manifest.json — enumerates asset packs and versions

File ownership and guidelines
- Each top-level module owns its directory and public interface file(s).
- Keep public interfaces minimal; prefer small, well-typed messages for inter-module communication.

Migration and extension notes
- Add new systems as new src/<system>/ directories with tests and an adapter in core bootstrap.
- Maintain backward-compatible schema changes; include migration scripts under tools/ when necessary.

Domain-specific systems and planned files
- src/systems/time_anchor/
  - time_anchor.* (core logic)
  - anchor_state.* (state representation and serialization)
  - tests/
- src/systems/puzzle/
  - puzzle_engine.* (engine and step functions)
  - puzzle_definitions/*.json (data-driven puzzle specs)
  - tests/
- src/systems/narrative/
  - narrative_manager.* (fragment collections, branch manager)
  - fragments/*.json (fragment content pack)
  - tests/

Data
- data/puzzles/ (serialized puzzle instances for level layouts)
- data/fragments/ (narrative fragments, VO/text mappings)

Notes
- Keep file names and manifest keys constant-driven (e.g., CONTENT_MANIFEST_PATH) and document them in config/default.yaml to avoid magic strings.
