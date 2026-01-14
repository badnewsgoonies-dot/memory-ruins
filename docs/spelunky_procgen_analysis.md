# Spelunky Procedural Generation - Memory Ruins Implementation Notes

## 1. Room Template System

**Structure:** 4×4 grid of 16 rooms, each room is a discrete template.

**Template Types:**
- **Drop-down rooms** - exits on bottom
- **Landing rooms** - exits on top  
- **Corridor rooms** - exits left/right
- **Dead-end rooms** - for non-critical path areas

**Key Insight:** Templates are handcrafted but contain randomizable sections. "Parts of them are randomly generated - sometimes entire chunks of tiles are plastered on at random."

## 2. Guaranteed Path Algorithm

**Critical Path Generation:**
1. Pick random room from top row → **entrance**
2. Randomly move left, right, or down
3. If path hits level edge → force downward
4. Repeat until bottom row reached
5. Next "down" attempt → **exit placed**

**Room Openings:**
- Main path rooms: left/right exits guaranteed
- Drop rooms: bottom exit added
- Landing rooms: top exit added

**Result:** Solvable path without items (ropes/bombs). "You'll always be able to get through."

## 3. Randomness Balance (Controlled Chaos)

**Weighted Spawning:**
- Script checks every tile, rolls dice for monsters/treasure
- Gems/crates: higher probability near walls
- Enemies: don't spawn in cramped spaces
- Loot distribution weighted to prevent jetpack spam

**Template Mutations:** Familiar setups have "unique quirks" - players recognize patterns but never identical layouts.

## 4. Handcrafted + Procedural Hybrid

| Authored (Fixed) | Procedural (Random) |
|------------------|---------------------|
| Room template layouts | Template selection per room |
| Enemy behavior rules | Spawn locations & density |
| Item properties | Item distribution |
| Special rooms (shops, altars, idols) | Placement of special rooms |
| Ghost timer mechanics | Level-specific obstacles |

**Derek Yu's Philosophy:** "Doesn't create the most natural looking caves... but creates fun and engaging levels that the player can't easily get stuck in - something much more valuable than realism."

---

## Memory Ruins Implementation Checklist

- [ ] Define grid size (e.g., 5×4 for dungeon section)
- [ ] Create 8-12 room templates per biome with tagged exit points
- [ ] Implement critical path walker (top→bottom with random horizontal)
- [ ] Tag rooms: `DROP_FROM`, `LAND_INTO`, `CORRIDOR`, `DEAD_END`
- [ ] Add tile mutation zones within templates (30-50% random fill)
- [ ] Weight spawn tables by tile context (walls nearby = treasure)
- [ ] Place authored special rooms (shrine, merchant) on path branches
- [ ] Validate: path walkable without special items
