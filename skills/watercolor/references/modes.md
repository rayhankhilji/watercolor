# Modes

## extract (default)
Describe what exists. Strategy explains it; no `overrides` except to **correct mis-detection** (wrong primary, wrong logo), noted in `rationale`. Output must survive the head of brand reading it: "yes, that's us."

## extend
Keep every measured value. Add what the site doesn't show but a growing company needs:
- Semantic states (success/warning/danger/info) harmonized to the primary's lightness/chroma — the extractor proposes them; confirm or refine.
- A motion signature if the site is still (subtle, consistent with the type temperament).
- Pattern or icon `extensions` drawn in the brand's language (stroke weight, grid, corner style from `icons.style`). SVG strings must be valid, use `currentColor` or brand hexes only.
- Voice examples for contexts the site lacks (errors, empty states, release notes).
Never change logo, primary, fonts or shape language.

## evolve
A considered refresh — think "the brand three years from now". Keep: name, logo (maybe refined clearspace/usage), core hue family, typographic temperament. Fix: contrast failures, muddy accents, weak hierarchy, generic choices (default Inter, gray shadows, random radii), inconsistent motion. Every change goes in `overrides` and is justified one line each in `rationale`. Prefer 3 strong changes over 12 small ones.

## reimagine
The company (audience, positioning, category) is the brief; the current design is just one data point. Process:
1. Write positioning and personality first (from the company evidence).
2. Pick the category playbook, then find the **one distinctive move** competitors don't make.
3. Choose palette (`overrides.roles` incl. background/foreground/primary/accent), type (`overrides.fonts`, open fonts unless licensed), radius, gradient (only if it serves the idea).
4. Rewrite taglines/headlines in the new voice (`copy`).
5. Run the anti-slop check — zero violations allowed.
The logo stays the company's (we don't redesign marks); the kit recolors it as needed.
