# Core Architecture — Modules & Data Flows

This document describes the core architecture for the prototype: the Entity-Component-System (ECS), Event Bus, Asset Pipeline and Save Format, and how these modules are wired into the existing codebase.

Guiding principles
- Single Responsibility: each module owns a clear responsibility (ECS: state & update, Event Bus: decoupled messaging, Assets: loading & lifecycle, Save: deterministic serialization).
- No magic numbers: expose configuration constants with clear names (e.g. DEFAULT_WORLD_CAPACITY).
- Minimal surface area: keep public APIs small and well-typed for easy testing.

1. ECS (Entity-Component-System)

Overview
- The World manages entities (numeric ids), component stores (maps keyed by component name), and registered systems.
- Systems implement a small update(dt, world) interface and are invoked each tick.

Key types / constants
- EntityId: number (INVALID_ENTITY_ID = -1)
- Component: Record<string, any>
- DEFAULT_WORLD_CAPACITY: initial sizing hint for stores (avoid magic numbers)

API summary (existing in src/engine/ecs.ts)
- createEntity(): EntityId
- removeEntity(eid)
- addComponent(eid, name, component)
- getComponent<T>(eid, name): T | undefined
- removeComponent(eid, name)
- query(componentNames: string[]): Array<{ entity, components }>
- registerSystem(system)
- update(dt)

Design notes
- Component stores are keyed by component name string for simple serialization and debug visibility.
- Queries are currently simple and iterative (suitable for prototype). Later improvements: archetypes or sparse sets for performance.
- Systems are deterministic functions of world state and dt; side-effects should be limited and performed through the Event Bus where appropriate.

Testing
- A unit test scaffold is exported (runEcsUnitTestScaffold) inside src/engine/ecs.ts for quick validation by test runners.

2. Event Bus

Overview
- Lightweight pub/sub for decoupled communication between systems, rendering, input and other subsystems.
- Topics are string identifiers; handlers receive Event<T> objects with topic and payload.

API summary (existing in src/engine/events.ts)
- subscribe(topic, handler) -> Subscription
- unsubscribe(subscription)
- publish(topic, payload)

Design notes
- Synchronous dispatch: subscribers are invoked synchronously in the publish call. This is simple and predictable for prototype gameplay code.
- Error isolation: handler errors are caught and suppressed to avoid breaking other subscribers; production code should log or forward errors to a monitoring system.
- If needed, add an async publish variant or a scheduling layer to avoid long-running handlers blocking the main loop.

3. Asset Pipeline

Goals
- Deterministic loading, caching, and lifecycle management for runtime assets (images, audio, levels).
- Clear separation between raw data loader and runtime-ready asset (e.g., Image -> Texture instance).

Suggested components
- Loader registry: map file extensions or mime types to loader functions.
- Asset cache: keyed by canonical asset id (path + options) to avoid duplicate loads.
- Lifecycle hooks: load, ready, release. Emit Event Bus messages (e.g., `asset:loaded`, `asset:error`, `asset:released`).

Integration
- Asset loaders should publish events on the Event Bus so other subsystems (rendering, UI) can respond without direct coupling.

4. Save Format

Requirements
- Human readable (JSON) for prototype, but with versioning metadata.
- Deterministic ordering where necessary (e.g., arrays of entities) and stable keys for components.
- Backwards compatibility: include a `version` field and migration helpers.

Suggested structure
{
  "meta": { "version": 1, "createdAt": "ISO-8601" },
  "entities": [
    {
      "id": 1,
      "components": {
        "position": { "x": 0, "y": 0 },
        "health": { "hp": 10 }
      }
    }
  ]
}

Design notes
- Save/Load logic should live in a dedicated module that can serialize the World component stores.
- Avoid serializing non-essential runtime-only state (e.g., transient timers or ephemeral event subscriptions).

5. Integration & Wiring into Prototype

Current status
- src/engine/ecs.ts provides a minimal World, systems, and a unit test scaffold.
- src/engine/events.ts provides the EventBus implementation.

Wiring recommendations
- Create a single Engine bootstrap that instantiates a World and a global EventBus (or pass instances explicitly into subsystems).
- Systems that need cross-cutting communication (e.g., save/load, asset events) should use the EventBus rather than direct references to subsystems.
- Example (pseudocode):
  const world = new World();
  const events = new EventBus();
  // pass `world` and `events` into systems that need them

6. Unit Tests & Scaffolding

- The existing runEcsUnitTestScaffold exported by src/engine/ecs.ts provides a quick smoke-test for automated test runners.
- Recommended next steps:
  - Add a test harness (jest/mocha) that imports runEcsUnitTestScaffold and asserts success.
  - Add tests for EventBus subscribe/publish/unsubscribe behavior, ensuring handlers are invoked and errors are isolated.

7. Next Steps / Roadmap

- Add an Engine bootstrap module (if not present) that wires World + EventBus + common systems and exposes a lifecycle API (start/stop/update).
- Implement asset loader registry and basic loaders, wire to EventBus for lifecycle events.
- Create a save/load module that serializes World component stores using the suggested JSON format and handles migrations.
- Replace naive query with an archetype/sparse-set backend if performance profiling requires it.

Appendix: constants used in code
- INVALID_ENTITY_ID = -1
- DEFAULT_WORLD_CAPACITY = 1024

Notes
- Work already present in src/engine/ecs.ts and src/engine/events.ts satisfies the minimal ECS and Event Bus requirements for phase-3; this document codifies the intended data flows and next steps.
