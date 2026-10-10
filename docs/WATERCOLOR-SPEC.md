# The WATERCOLOR.md format · v1

`WATERCOLOR.md` is a single Markdown file that tells humans **and agents** everything needed to design, write and build on-brand for one company. It merges what other tools split across `DESIGN.md`, `BRAND.md`, `STYLEGUIDE.md`, voice docs and token files, and it distinguishes **measured** facts from **derived** suggestions.

It lives at the root of a brand kit (`brand/WATERCOLOR.md`) and is referenced from a project's `CLAUDE.md` / `AGENTS.md` / `.cursorrules`:

```md
All UI, copy and assets must follow brand/WATERCOLOR.md. Use tokens from brand/tokens/. Never invent colors, fonts, radii or easing.
```

## Design goals

1. **One file is enough.** An agent with only this file (and the token files it points to) can produce on-brand work.
2. **Rules first.** §0 is a short numbered list of hard rules; everything after is reference.
3. **Evidence-backed.** Every value is measured from the live brand or explicitly marked *derived*.
4. **Machine-readable head.** YAML front matter carries the essentials for tools that don't parse Markdown.
5. **Stable anchors.** Section numbers and titles are fixed so agents can jump to `#3-color`.

## Front matter

```yaml
---
watercolor: 1            # format version
brand: "Stripe"
url: https://stripe.com/
generated: 2026-10-10
mode: extract            # extract | extend | evolve | reimagine
scheme: light            # light | dark
colors:
  background: "#ffffff"
  foreground: "#061b31"
  primary: "#635bff"
  accent: ["#8087ff"]
fonts:
  display: "Söhne"
  body: "Söhne"
  mono: "Source Code Pro"
radius: { button: "4px", card: "8px" }
spacing_base: 4
motion: { fast: 150, base: 300, slow: 500, ease: "cubic-bezier(0.215, 0.61, 0.355, 1)" }
---
```

All keys are required except `accent`. Colors are lowercase 6-digit hex.

## Sections

| # | Title | Contents |
|---|---|---|
| 0 | The rules | 8–16 numbered, testable rules. Each cites a value. |
| 1 | Brand essence | One-liner, facts table (category, model, audience, customers, proof), positioning, pillars, personality (`We are / We are not`), spectrum, archetype |
| 2 | Voice & copy | Principles with do/don't, measured mechanics table, vocabulary, the brand's own headlines and CTAs, rewrites, taglines |
| 3 | Color | Role table (token, hex, OKLCH, name, use), proportions, contrast (WCAG + APCA), OKLCH scales with pinned brand values, gradient, derived counter-theme, original CSS variables |
| 4 | Typography | Families (human + CSS names, roles, weights, source, open alternative), scale table, ratio, OpenType features |
| 5 | Layout & spacing | Max width, containers, grid, gutter, breakpoints, spacing unit/scale, section rhythm, density, alignment |
| 6 | Shape & depth | Radii, elevation, borders, shape language |
| 7 | Motion | Tokens, measured curves with character, durations, keyframes, scroll/ambient behavior, signature, rendered assets |
| 8 | Components | Exact computed CSS of real components (buttons by variant incl. measured hover, inputs, cards, badges, nav, footer) |
| 9 | Iconography | Style spec (stroke, grid, caps/joins, corners, library) and how to draw new icons |
| 10 | Imagery & media | Mix of photo/illustration/screenshot, captured video/GIF/Lottie/Rive/canvas/shaders, customers shown |
| 11 | Logo | Files, mark source, clear space, minimum size, on-color usage, misuse |
| 12 | Asset index | Every folder in the kit and what's in it |
| 13 | Do / Don't | Brand-specific do's, and the generic-AI tells this brand never shows |
| 14 | Implementation | CSS + Tailwind usage, a reference React component, the agent instruction line |
| 15 | Provenance | Pages crawled, timestamp, tool version, mode, stack detected, warnings, ownership note |

## Conventions

- *derived* (italic) marks any value not observed on the source site.
- Hex values are written uppercase in prose (`#635BFF`) and lowercase in tokens.
- Tokens are named `--color-*`, `--font-*`, `--text-{style}-{size|weight|line-height|tracking}`, `--space-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--ease-*`, `--layout-*`.
- Relative links resolve from the kit root.

## Split docs

Generators may also emit focused views (`docs/BRAND.md`, `VOICE.md`, `DESIGN.md`, `COLOR.md`, `TYPOGRAPHY.md`, `LAYOUT.md`, `MOTION.md`, `COMPONENTS.md`, `ICONOGRAPHY.md`). They are subsets of WATERCOLOR.md and must not contradict it.

## Companion files

| File | Role |
|---|---|
| `brand.json` | The measured profile (source of truth for facts) — see `src/profile/schema.ts` |
| `strategy.json` | The judgment layer (positioning, personality, voice, overrides) — see `src/profile/strategy.ts` |
| `tokens/tokens.json` | W3C Design Tokens (DTCG) |
