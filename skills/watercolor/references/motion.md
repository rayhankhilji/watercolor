# Motion

## Reading measured motion

`motion.durations` and `motion.easings` are counted from every transition and animation on the crawled pages; `motion.keyframes` lists the `@keyframes` actually in use; `motion.libraries` shows framer-motion / GSAP / Lottie / Rive / three.js / Lenis; `media.canvases` and `captured/shaders/` reveal WebGL surfaces; `captured/recordings/home-scroll.mp4` shows scroll choreography.

Translate numbers into temperament:

| Measured | Temperament |
|---|---|
| 100–200ms, ease-out / easeOutCubic | Responsive, utilitarian, confident |
| 200–400ms, custom out-curves (e.g. `cubic-bezier(.16,1,.3,1)`) | Premium, decisive deceleration |
| 500–900ms, in-out curves | Cinematic, editorial, deliberate |
| Overshoot curves / springs | Playful, physical, friendly |
| `linear` dominant | Mechanical — usually marquees/progress only |
| Smooth-scroll (Lenis/Locomotive) + ScrollTrigger | Story-driven marketing, "scrollytelling" |
| WebGL canvas / shaders | Motion is a signature brand surface, not just UI feedback |

## Writing motion strategy

- `motion.summary`: one paragraph naming the temperament and where motion lives (UI feedback vs. ambient surfaces vs. storytelling).
- `motion.principles`: 3–4, each with a consequence. E.g. *"Decelerate decisively — entrances use the 500ms ease-out; nothing bounces."* *"Ambient, not distracting — the gradient moves slower than reading speed and pauses under reduced-motion."*
- `motion.signature`: the one motion moment people would recognize (the hero gradient flow, the logo-wall marquee, the product UI springing in).

## Principles that hold across brands

1. **Purpose first**: orient (where did this come from?), focus (what changed?), feedback (it worked), delight (rarely).
2. **Enter slower than you exit.** Exits ~70% of entrance duration, accelerating curves.
3. **Distance scales duration.** Small moves 120–200ms; full-screen 400–600ms.
4. **One choreography idea per surface** — stagger *or* sequence, not both everywhere.
5. **Respect `prefers-reduced-motion`**: cut movement, keep opacity.
6. **Never animate layout jank** (width/height/top) — transform and opacity only.

## Generated assets

watercolor renders: logo reveal (16:9, 1:1), living gradient loop (seamless), kinetic headline, loader (transparent), transition wipe, end card — all on the brand's measured curves — plus `motion.css` utilities and an optional Remotion project. When the brand is "still", keep generated motion minimal; when "cinematic", the Remotion sizzle is worth building out.
