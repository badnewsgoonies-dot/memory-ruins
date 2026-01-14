// Re-export the canonical world-level loader to avoid duplicate implementations.
// This file provides a stable, small public facade at src/levels that other
// modules can import from without touching src/world/level directly.
export * from '../world/level';
