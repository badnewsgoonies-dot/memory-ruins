# Phase 2 Vision Insights
**Generated:** 2026-01-14 from video research analysis

---

## 1. Level Design (from Celeste GDC)

### Core Principles
- **Fractal stories**: Each room = one clear micro-challenge
- **Teach through death**: Low respawn cost makes failure instructive
- **Safety controls pacing**: Alternate safe rests with tension
- **Hidden tutorial branches**: Side paths for strugglers, invisible to skilled players
- **Short rooms by default**: Reserve long gauntlets for narrative climaxes

### Room Design Rules
- One clear objective per room
- Instant respawn at room start
- Visual clarity > visual complexity
- Test each room in isolation before connecting

---

## 2. Procedural Generation (from Spelunky GMTK)

### Room Template System
- **4×4 grid** of handcrafted templates
- Each template has randomizable sections within fixed structure
- Templates tagged by: entrance position, exit position, difficulty

### Guaranteed Path Algorithm
```
1. Start at random top column
2. Random walk: left, right, or down
3. At edges, force downward
4. Mark path tiles as "must be traversable"
5. Fill non-path with obstacles/rewards
```

### Hybrid Approach
| Fixed | Variable |
|-------|----------|
| Room structure | Template selection |
| Critical path | Enemy spawns |
| Exit locations | Collectible placement |

**Key insight**: "Fun levels the player can't get stuck in" > realism

---

## 3. Time Mechanics (from Braid GDC)

### Technical Implementation
- **Snapshot-based**, not reversible simulation
- Store state each frame; don't run physics backwards
- **Keyframe + Delta compression**: Full snapshots every N frames, deltas between
- **Memory budget**: ~40MB for 30-60 min of rewind at 60fps

### Object Time Categories
| Category | Behavior |
|----------|----------|
| Constant | Never store (collision, decorations) |
| Normal | Full rewind with player |
| Time-immune | Continues forward during rewind |
| Time-dilated | Speed varies by distance to anchor |

### Time-Anchor Implementation
```typescript
interface TimeAnchor {
  position: Vector2;
  radius: number;
  dilationFactor: number;
  timeline: Timeline;
}

interface Timeline {
  keyframes: Snapshot[];  // every N frames
  deltas: Delta[];        // changes between keyframes
}

enum TimeRelation {
  NORMAL,      // rewinds with player
  IMMUNE,      // unaffected by time
  DILATED,     // slowed near anchor
  ANCHORED     // frozen in anchor radius
}
```

### Puzzle Design Principles
- Tension: "You can't reach B from A in time... unless you use time"
- Objects with different time relationships create puzzle depth
- Exact state restoration required (no drift exploitation)

---

## 4. Art Direction (from Dead Cells)

### Pipeline (3D → 2D)
1. Model in 3D (low-poly)
2. Rig and animate
3. Apply toon shader with normal maps
4. Render to pixel resolution
5. Clean up in 2D

### Visual Principles
- **Large readable features** — fine details get lost
- **Normal maps + toon shader** for dynamic lighting
- **Hard 2-color shading** for clarity
- Single artist achieved massive output through this workflow

### Memory Ruins Palette
- Muted earth tones (ruins, decay)
- Neon accents for interactive elements (from design doc)
- High contrast silhouettes for gameplay readability

---

## 5. Audio Design (from Hollow Knight)

### Atmospheric Music
- **Ostinato foundation**: Consistent repeating figure (piano/harp arpeggios)
- **Pedal tones over changing chords**: Atmospheric ambiguity
- **Layered reveal**: Start sparse, swell with strings/choir on discovery
- **Colorful extensions**: 7ths, 9ths, sus2 chords for emotional depth

### Motivic Development
- **Reharmonization**: Same melody in different keys
- **Melodic contour preservation**: Subconscious familiarity
- **Cross-area connections**: Themes recur across locations
- **Texture as motif**: Rhythmic patterns as identity markers

### Memory Ruins Audio Direction
| Location Type | Instruments | Character |
|---------------|-------------|-----------|
| Memory Halls | Piano, bells, synth pad | Melancholic discovery |
| Corrupted Zones | Distorted organ, static | Sinister, fragmented |
| Core Archives | Full orchestra swell | Revelation, triumph |

### Silence Strategy
- Music fades in areas of complete memory loss
- Boss battles: strip atmosphere, expose raw harmonic movement
- Absence signals narrative weight

---

## 6. World Design (from Super Metroid GMTK)

### Progression Structure
- **Two-Act Structure**: Tight guided intro → open exploration
- First area teaches rules; then world opens up
- Each ability unlocks 5-7 visible obstacles across map

### Loop Architecture
- Rooms bend back to hubs
- Never dead-end backtracking
- Shortcuts unlock as you progress

### Visual Telegraphing
- Distinct landmarks make obstacles memorable
- Show locked doors before giving keys
- Color-code by ability type

### Memory Ruins World Map
```
         [Archive Core]
              ↑
    [Data Halls] ← → [Memory Banks]
         ↓               ↓
    [Corrupted    [Processing 
     Sector]       Chambers]
         ↓               ↓
    [Deep Ruins] ← → [Forgotten Depths]
              ↓
         [Origin]
```

---

## Phase 2 Implementation Priorities

### Sprint 1: Foundation (Phases 32-37)
1. **Platforming physics** — Gravity, jump, collision
2. **Tilemap rendering** — Load and display levels
3. **Real sprite assets** — Replace 0-byte stubs
4. **One complete room** — Playable start-to-finish

### Sprint 2: Core Mechanic (Phases 38-43)
1. **Time-anchor system** — Snapshot/rewind
2. **Object time relations** — Normal/immune/dilated
3. **First time puzzle** — Simple proof of concept
4. **Audio foundation** — Ostinato + area themes

### Sprint 3: Content (Phases 44-50)
1. **Room template system** — 8-10 handcrafted templates
2. **Procedural path algorithm** — Guaranteed solvability
3. **3 distinct areas** — With unique visuals/audio
4. **Ability progression** — Unlock gating

### Sprint 4: Polish (Phases 51-60)
1. **Boss encounter** — One major fight
2. **Full audio pass** — All areas scored
3. **Save/load verification** — Migration tested
4. **Playtest & tune** — 1 hour playthrough target

---

## Sources
- Celeste GDC: https://www.youtube.com/watch?v=4RlpMhBKNr0
- Spelunky GMTK: https://www.youtube.com/watch?v=Uqk5Zf0tw3o
- Braid GDC: https://www.youtube.com/watch?v=8dinUbg2h70
- Dead Cells Art: https://www.youtube.com/watch?v=iNDRre6q98g
- Hollow Knight Audio: https://www.youtube.com/watch?v=wzOY3mxTBag
- Super Metroid GMTK: https://www.youtube.com/watch?v=nn2MXwplMZA
