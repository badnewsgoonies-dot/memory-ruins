# Dead Cells Art Pipeline Analysis
## Key Insights for Memory Ruins Art Direction

### 1. Character Art Pipeline — "Pseudo Pixel Art"
Dead Cells uses **3D models rendered to 2D sprites**, not hand-drawn pixel art:
- Characters are **modeled, rigged, and animated in 3D**
- A homebrew tool renders meshes at small size **without anti-aliasing** for crisp pixels
- Sprites are captured into sprite sheets alongside **normal maps**
- **Key lesson**: Design characters with **large, readable features** — fine details (glasses, small accessories) don't survive downscaling

### 2. Shader Techniques — Toon Lighting System
- **Unlit color material** for base diffuse capture (no baked lighting)
- **Normal maps** rendered separately using a view-space normal shader
- **Two-color toon shading**: Hard edge threshold at 0.3 dot product
  - Above threshold → directional light color
  - Below threshold → ambient sky color
- **V_FACE semantics** for correct back-face lighting when sprites flip direction

### 3. Color & Lighting
- Lighting applied **dynamically** to sprites via normal maps, not baked
- **Pale blue** (0.5, 0.5, 1.0) used as normal map background color
- Two-tone palette approach creates readable silhouettes
- Ambient + directional light combo provides depth without complexity

### 4. Animation Approach — Frame Sampling
- 3D animations sampled at **fixed intervals** (e.g., 30fps)
- Each frame rendered to atlas position, then time stepped forward
- Loses interpolation between keyframes but gains **silky smooth, consistent motion**
- Single artist produced **hundreds of high-fidelity animations** with this pipeline

---

## Recommendations for Memory Ruins

| Aspect | Recommendation |
|--------|----------------|
| **Pipeline** | Consider 3D-to-2D workflow for faster iteration; use Blender → Unity/Godot render pipeline |
| **Character Design** | Bold silhouettes, exaggerated proportions; avoid fine line details |
| **Shading** | Implement normal-mapped toon shader with 2-3 color bands |
| **Color Palette** | Use limited palette with strong ambient/shadow contrast (warm highlights, cool shadows) |
| **Animation** | Rig characters in 3D for reusable bone animations; sample at 24-30fps |
| **Tool Investment** | Build simple capture tool early — the ROI is massive for iteration speed |

**Core Takeaway**: Dead Cells' fluid feel comes from **3D animation quality** preserved through careful rendering, not pixel-perfect hand animation. This lets a small team produce AAA-feeling sprite work.
