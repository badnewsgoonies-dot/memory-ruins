Title: Memory Ruins — Game Design Brief

Overview
--------
Memory Ruins is a 2D rogue-lite puzzle-platformer where the player, a sentient Archivist, explores fragmented memory-ruins to recover lost narrative shards. Short, replayable runs emphasize tight platforming, environmental puzzles, and modular progression that persists between runs.

Genre
-----
- Primary: Puzzle-Platformer
- Secondary: Rogue-lite, Light RPG progression

Plot
----
The world has been fragmented into corrupted memory-ruins. The player is an Archivist AI tasked with restoring the worlds narrative by collecting Story Shards. Each shard unlocks context, NPC fragments, and mechanical variants that change level generation and challenge types.

Core Mechanics
--------------
- Movement & Platforming: precise run-and-jump controls, wall-slide, short dash (STAMINA is a named constant), and contextual interactions.
- Environmental Puzzles: switches, rewiring circuits, light manipulation, time-locked platforms. Puzzles scale in complexity across zones.
- Companion Drone: a small detachable unit that can remote-activate switches, carry single objects, and provide short-range shielding.
- Rogue-lite Progression: runs are short (TARGET_RUN_TIME = 10-20 minutes), with persistent upgrades (named constants: BASE_HEALTH, UPGRADE_SLOT_COUNT). Death resets the run but grants Legacy Tokens used for permanent unlocks.
- Resource Management: Energy (ENERGY_MAX) consumed by abilities; pickups and upgrades alter thresholds.

Systems & Progression
---------------------
- Procedural Level Seeds: levels assembled from handcrafted rooms with parameterized modifiers (enemy density, puzzle complexity).
- Upgrade Trees: three branches — Mobility, Utility (drone), and Systems (HP/energy). Upgrades are described by IDs and constants to avoid magic numbers.
- Economy: Story Shards (collectible), Repair Scrap (currency for mid-run purchases), Legacy Tokens (meta-currency).

Combat & Enemies
----------------
- Combat is secondary; enemies are obstacles that pressure puzzle-solving rather than extended fights.
- Enemy types: Corrupted Echo (patrol), Static Warden (zone guardian), Phase Glitch (teleporting harasser).
- Encounters are short and designed to complement puzzles.

Visual Style
------------
- Art Direction: stylized hand-painted 2D with high-contrast silhouettes and soft, textured brushes.
- Palette: muted earth tones with neon accents for interactive elements (INTERACTIVE_ACCENT_COLOR constant). Visual clarity prioritized for gameplay readability.
- Animation: keyframe + procedural blending for responsive control.

Audio & UI
----------
- Audio: ambient, layered soundtrack that changes as shards are recovered; subtle mechanical SFX for interactions.
- UI: minimal, diegetic where possible. Use readable, high-contrast HUD for critical stats only.

Target Platforms & Scope
------------------------
- Target: Desktop (Windows, macOS, Linux) for MVP; controller and keyboard supported.
- MVP Scope: core movement, 6 room templates, 3 puzzle types, companion drone, 8 upgrade nodes, and 6 enemy variants.

MVP Success Metrics
-------------------
- Core movement feels responsive (target input latency <= 60ms).
- Play session length ~15 minutes with meaningful progression choices.
- Players can complete first zone and unlock at least one permanent upgrade within 3 runs.

Development Notes & Constants
-----------------------------
- No magic numbers: express gameplay values as named constants in code (e.g., BASE_HEALTH, ENERGY_MAX, UPGRADE_SLOT_COUNT, TARGET_RUN_TIME).
- Level generation uses weighted room pools with configuration JSONs.
- Keep art assets modular (tileset + decorative layers) to accelerate iteration.

See ORCH_JOURNAL.md for the short design summary and decisions log.
