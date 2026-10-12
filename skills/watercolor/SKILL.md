---
name: watercolor
description: Turn any website URL into a complete, evidence-based brand identity toolkit — WATERCOLOR.md (one agent-ready brand file), design tokens (CSS, Tailwind v4, DTCG, Figma), logo kit, favicons, patterns, social/OG templates, slides, motion (MP4/WebM/GIF + Remotion), and an HTML/PDF brand book — by extracting the real colors, type, logo, icons, voice, imagery, shaders, Lottie, videos and motion from the live site. Use when the user gives a URL and wants its brand, brand kit, brand guidelines, design system, style guide, DESIGN.md, design tokens, logo/assets, or wants to extend, evolve or reimagine a brand; also use when building any UI, page, email, deck or copy for a company that already has a brand/WATERCOLOR.md (read it first).
---

# watercolor

URL in, brand system out. You (the agent) are the **brand strategist and design director**; the bundled CLI is your hands — it measures the site precisely and renders every asset deterministically. Your job is the judgment layer the CLI can't do: understanding the company, its market and personality, and writing that into `strategy.json` so every generated file explains *why*, not just *what*.

## 0. If `brand/WATERCOLOR.md` already exists

You're probably building something *for* this brand (a page, component, email, deck, ad). Read `brand/WATERCOLOR.md` §0 (rules) and the sections you need **before writing any UI or copy**, use `brand/tokens/` instead of inventing values, and pull assets from `brand/logo/`, `brand/patterns/`, `brand/motion/`. Never introduce a color, font, radius, shadow or easing that isn't in the file. Skip the rest of this skill unless asked to regenerate.

## 1. Run the extraction

```bash
scripts/watercolor.sh extract <url> -o brand            # add -m extend|evolve|reimagine if asked
```

`scripts/watercolor.sh` (next to this file) resolves the CLI: a global `watercolor`, else this repo's build, else `npx watercolor-cli`. First run may install Chromium (`npx playwright install chromium`). Takes 2–6 minutes: it crawls the homepage plus about/pricing/product/customers/careers/brand-press pages, records canvases and a scroll-through, hovers buttons, downloads fonts, logos, icons, Lottie/Rive, GIFs, videos and WebGL shader sources.

Useful flags: `--pages 8` (crawl more), `--include <urls…>` (specific pages), `--no-videos`, `--headed` (watch it), `--no-recording`.

If the site blocks headless browsers or a page fails, say so plainly and continue with what was captured. Never claim something was extracted that wasn't.

## 2. Study the evidence (don't skip)

1. Read `brand/.watercolor/brief.md` — identity, company signals, the full copy corpus, page excerpts, the measured visual system, and the `strategy.json` schema.
2. **Look at the screenshots** it lists (desktop, mobile, full-page, canvas stills) with your image-viewing tool. Note what the numbers can't tell you: density, image style, how color is *spent*, what feels signature.
3. Read the references — this is your taste:
   - `references/principles.md` — what separates great brand systems from template output
   - `references/anti-slop.md` — the generic-AI tells to avoid (read every time)
   - the category playbook(s) that fit: `references/categories/{b2b-saas,ai,devtools,fintech,consumer}.md`
   - `references/voice.md` for the voice section; `color.md`, `typography.md`, `motion.md` when judging those systems
   - `references/modes.md` if mode ≠ extract
   - `references/examples/*.strategy.json` — two finished strategies (Stripe, Wispr Flow) showing the expected depth and specificity

## 3. Write `brand/strategy.json`

Follow the schema in the brief. Standards:

- **Grounded.** Every trait, principle and claim must be traceable to evidence (quote their copy, cite a measurement). If you can't support it, omit it — an empty field is better than a confident guess.
- **Specific.** "Precise, not pedantic" only if the copy is precise. Personality traits come in `trait` / `notThis` pairs where the `notThis` is the *failure mode of that trait*, not its opposite.
- **Useful to a builder.** Voice principles get a concrete do/don't. Rewrites use real off-brand phrasing a junior writer would produce.
- **Name the colors** (`colorNames`) evocatively but plausibly for this brand ("Blurple", "Downriver", "Ink 900") — 6–10 key hexes only.
- **Company first.** Get `company.oneLiner`, `audience`, `businessModel` and `category` right; the rest flows from who they sell to.

Validate it's parseable JSON. Keep `"version": "1"` and the mode.

## 4. Build

```bash
scripts/watercolor.sh build brand            # --fast for quicker motion renders, --no-motion to skip
```

Produces `WATERCOLOR.md`, `docs/*.md`, `tokens/`, `colors/`, `typography/`, `logo/`, `patterns/`, `social/`, `templates/`, `motion/`, `guidelines/index.html` + `brand-book.pdf`.

## 5. Review like a design director

Open and **look at** the rendered outputs before reporting done: `social/og-default.png`, `social/instagram-post.png`, `patterns/*.png`, `logo/lockups/*.png`, `colors/palette.png`, `typography/specimen.png`, `motion/*-poster.png`, `templates/slides-preview.png`, and screenshot `guidelines/index.html`. Check:

- Is the logo correct (not a customer logo, not a social icon)? If wrong, pick the right file from `captured/logos/` and fix `brand.json → logo.primary.path`, then rebuild.
- Are primary/accent roles right? A brand's primary is what it *spends on actions and identity*, not the most common color. Fix via `strategy.overrides.roles` (in extract mode only to correct mis-detection — say so in `rationale`).
- Do fonts render (captured files) or fall back? Note proprietary faces and their open alternatives.
- Any template text overflowing, clashing, or low-contrast? Adjust copy in `strategy.copy` and rebuild.

Iterate until it's something you'd show the company's head of brand.

## 6. Report

Summarize for the user: what the brand *is* (one paragraph), the key system (primary color, type, shape, motion signature), anything notable you extracted (e.g. "recorded the WebGL gradient + 17 shader sources", "downloaded the official press-kit logos"), what was derived vs measured, warnings (proprietary fonts, blocked pages), and where to start (`brand/guidelines/index.html`, `brand/WATERCOLOR.md`).

## Modes

| Mode | What you do |
|---|---|
| `extract` (default) | Describe the brand exactly as it is. No overrides. |
| `extend` | Keep everything measured; fill gaps (semantic colors, motion signature, extra patterns/icons via `extensions`) strictly inside the brand language. |
| `evolve` | Considered refresh — recognisable, but fix weaknesses (contrast, hierarchy, generic choices). Changes go in `overrides`, each justified in `rationale`. |
| `reimagine` | The company is the brief, not the current design. Propose a distinctive new identity via `overrides` (palette, fonts, radius, gradient) using the category playbook. Zero anti-slop violations. |

Switch modes on an existing kit: `scripts/watercolor.sh mode evolve brand`, update `strategy.json`, rebuild.

After upgrading watercolor, `scripts/watercolor.sh profile brand` re-derives `brand.json` from the saved capture without re-crawling.

## Optional extras

- `scripts/watercolor.sh remotion brand` → a Remotion project (LogoReveal, Headline, Sizzle) wired to the brand. Remotion needs a company license for orgs > 3 people.
- `scripts/watercolor.sh imagine brand [--subjects hero]` → on-brand photography/illustration via an image model (needs `OPENAI_API_KEY` or `FAL_KEY`; costs money — only run when the user asks). Prompts are composed from strategy + palette.
- `scripts/watercolor.sh synthesize brand` → writes strategy.json via Claude (`ANTHROPIC_API_KEY`) or OpenAI (`OPENAI_API_KEY`) when no agent is driving (CI, scripts).

## Ethics

Captured logos, fonts and imagery belong to their owners. The kit is for working *with* or *on* a brand (the user's own, a client's, research). Don't help pass off someone else's brand as the user's, and flag proprietary fonts that need a license before shipping.
