"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRenderer = createRenderer;
// Renderer with small visual polish helpers (rounded corners, soft shadow, glow)
function createRenderer(canvas) {
    const ctx = canvas.getContext('2d');
    // Named constants to avoid magic numbers and make tuning explicit
    const MIN_SCALE = 0.25;
    const MAX_SCALE = 4;
    const DEFAULT_COLOR = '#1e90ff';
    const SHADOW_COLOR = 'rgba(0,0,0,0.45)';
    const SHADOW_BLUR = 8; // tuned for subtlety
    const CORNER_RATIO = 0.1; // corner radius as fraction of min(width,height)
    // Vignette settings (named constants, no magic numbers)
    const VIGNETTE_INTENSITY = 0.5;
    const VIGNETTE_RADIUS = 0.85; // fraction of max dimension
    // Logical render scale multiplies devicePixelRatio for resolution-independent crispness.
    let scale = 1;
    function resize() {
        // Use device pixels for crisper rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.floor(canvas.clientWidth * dpr * scale));
        const h = Math.max(1, Math.floor(canvas.clientHeight * dpr * scale));
        canvas.width = w;
        canvas.height = h;
        // Apply combined scale so drawing coordinates remain in CSS pixels
        ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();
    function _roundedRectPath(x, y, w, h, r) {
        const path = new Path2D();
        path.moveTo(x + r, y);
        path.arcTo(x + w, y, x + w, y + h, r);
        path.arcTo(x + w, y + h, x, y + h, r);
        path.arcTo(x, y + h, x, y, r);
        path.arcTo(x, y, x + w, y, r);
        path.closePath();
        return path;
    }
    return {
        // Expose a setter so callers can change render scale without magic numbers in multiple places
        setScale(s) { scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(s) || 1)); resize(); },
        get width() { return canvas.clientWidth; },
        get height() { return canvas.clientHeight; },
        clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); },
        // Draw a rectangle with optional rounded corners and soft shadow
        drawRect(x, y, w, h, color, opts = {}) {
            const col = color || DEFAULT_COLOR;
            const radius = (opts.radius != null) ? opts.radius : Math.min(w, h) * CORNER_RATIO;
            const rounded = _roundedRectPath(Math.round(x), Math.round(y), Math.round(w), Math.round(h), Math.round(radius));
            if (opts.shadow) {
                ctx.save();
                ctx.shadowColor = SHADOW_COLOR;
                ctx.shadowBlur = SHADOW_BLUR;
                ctx.shadowOffsetX = opts.shadowOffsetX || 0;
                ctx.shadowOffsetY = opts.shadowOffsetY || 2;
                ctx.fillStyle = col;
                ctx.fill(rounded);
                ctx.restore();
            }
            else {
                ctx.fillStyle = col;
                ctx.fill(rounded);
            }
        },
        // Draw a subtle vignette overlay to focus center
        drawVignette() {
            ctx.save();
            const w = canvas.width, h = canvas.height;
            const cx = w / 2, cy = h / 2;
            const rInner = Math.min(w, h) * 0.1;
            const rOuter = Math.max(w, h) * VIGNETTE_RADIUS;
            const g = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter);
            g.addColorStop(0, 'rgba(0,0,0,0)');
            g.addColorStop(1, `rgba(0,0,0,${VIGNETTE_INTENSITY})`);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        },
        // Helper to draw a subtle glow around a rect (non-destructive; uses globalAlpha)
        drawGlow(x, y, w, h, color, intensity = 0.6) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = Math.max(0, Math.min(1, intensity));
            ctx.fillStyle = color || DEFAULT_COLOR;
            ctx.filter = 'blur(6px)';
            const pad = Math.max(6, Math.round(Math.min(w, h) * 0.08));
            ctx.fillRect(Math.round(x - pad), Math.round(y - pad), Math.round(w + pad * 2), Math.round(h + pad * 2));
            ctx.restore();
        }
    };
}
