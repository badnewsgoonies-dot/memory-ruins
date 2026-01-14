# Video Frame Analysis - Visual Design Insights

Generated: 2026-01-14 from extracted video frames

---

## Celeste GDC - Level Design Visuals

### Frame Analysis

**Frame 10 - "Multiple Approaches"**
- Shows climbing wall metaphor for level design
- Key insight: Players should have multiple valid paths through challenges

**Frame 20 - Actual Gameplay Level**
- Clear tilemap-based design with distinct tile types:
  - Dark brown solid blocks
  - Light blue ice/crystal platforms
  - White spike hazards at bottom
  - Distinct player character (red/pink, small)
- **Color coding**: Hazards are white/light, safe platforms are colored
- **Negative space**: Dark background makes platforms pop
- Level shows vertical AND horizontal traversal options

**Frame 35 - "Celestial Resort" Full Map**
- Shows how rooms connect horizontally
- Tight corridors with branching paths
- Small individual rooms that chain together
- **Key**: Each room is self-contained but flows into next

### Takeaways for Memory Ruins
1. Use dark backgrounds with bright, distinct platform colors
2. Keep rooms small (1-2 screens max)
3. Color-code hazards vs safe zones
4. Player sprite should contrast strongly with environment

---

## Spelunky GMTK - Procedural Generation Visuals

### Frame Analysis

**Frame 3 - Actual Gameplay**
- HUD: HP (heart icon), bombs, ropes, gold, timer, level indicator (3-2)
- Ice cave tileset with distinct cyan/blue ice blocks
- Platforms are chunky, readable blocks
- Snow particle effects for atmosphere
- **Enemies visible**: Small creatures at bottom

**Frame 5 - Room Template Grid**
- Shows 4x4 grid of room templates
- ENTRANCE at top, EXIT at bottom-left
- Red rooms = selected path
- Black corridors = connections between rooms
- **Critical**: Guaranteed path from entrance to exit

**Frame 8 - Derek Yu Quote**
> "This system doesn't create the most natural-looking caves ever... But with enough templates and random mutations, there's still plenty of variability. More importantly, it creates fun and engaging levels that the player can't easily get stuck in, something much more valuable than realism."

### Takeaways for Memory Ruins
1. Use 4x4 grid of room templates
2. Mark guaranteed path first, then fill rest
3. Each template has entrance/exit points
4. Prioritize playability over realism

---

## Dead Cells - Art Pipeline Visuals

### Frame Analysis

**Frame 4 - "FBX-to-Sprite Renderer"**
- Custom tool that converts 3D models to 2D sprites
- Shows parameter controls for:
  - Animation frames
  - Sprite dimensions
  - Export settings
- Character preview on right side
- **Pipeline**: Model in 3D → Animate → Render to pixel sprite

**Frame 8 - "Toon Lighting Sprite Shader"**
- Actual shader code shown:
```hlsl
half3 toonLight = saturate(dot(N, _WorldSpaceLightPos0)) > 0.3 ? _LightColor0 : unity_AmbientSky;
half3 diffuse = diffuseTex * (toonLight);
```
- Uses normal maps for dynamic lighting
- Hard cutoff (0.3 threshold) for toon shading
- Two-tone lighting: lit vs ambient

**Frame 12 - Unity 3D Character Setup**
- Shows 3D character model being animated in Unity
- Blue shirt character with rig visible
- Animation capture system
- **Key**: Animate once in 3D, render multiple angles/frames

### Takeaways for Memory Ruins
1. Consider 3D→2D pipeline for faster iteration
2. Use toon shaders with hard light cutoff
3. Normal maps enable dynamic lighting on sprites
4. If hand-drawing: mimic 2-tone shading style

---

## Visual Style Summary for Memory Ruins

### Color Palette
| Element | Color Range |
|---------|-------------|
| Background | Dark (#111, #1a1a2e) |
| Solid Platforms | Earth tones (brown, gray) |
| Interactive | Neon accents (cyan, magenta) |
| Hazards | White, red |
| Player | High contrast (pink/cyan) |

### Tile Specifications
- **Tile Size**: 32x32 pixels (matches our TILE_SIZE constant)
- **Grid**: Clean, readable edges
- **Decoration**: Layer on top, don't obscure gameplay

### Sprite Guidelines
- Player: 32x40 pixels (slightly taller than wide)
- Strong silhouette readable at distance
- 2-3 animation frames minimum (idle, run, jump)

### Lighting Approach
- Flat base colors with toon shading
- Optional: Normal maps for dynamic light
- Vignette on screen edges for atmosphere

---

## Reference Frames Saved
- /tmp/video_analysis/frames/celeste/ (63 frames)
- /tmp/video_analysis/frames/spelunky/ (14 frames)
- /tmp/video_analysis/frames/deadcells/ (16 frames)
