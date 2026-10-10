# Brand system principles

What separates a brand system people remember from a template with a logo on it. Use these as the lens for every judgment in `strategy.json` — and as the standard the generated kit is held to.

## 1. A brand is a set of decisions, not a set of assets

Assets are the residue of decisions. Stripe's identity isn't "purple + gradient"; it's *"we make infrastructure feel beautiful and precise"*, which then produces light-weight display type, meticulous spacing, a single saturated action color, and gradients that move like engineered fluid. When you write strategy, name the **decision** first, then show how the assets prove it.

> Test: could a designer who never saw the site make a new on-brand page from your strategy alone? If they'd still need to guess, the strategy is describing assets, not decisions.

## 2. Distinctiveness beats polish

Most AI-era sites are polished and indistinguishable. The valuable part of a brand is whatever a competitor *couldn't* plausibly use. Hunt for it:

- A proprietary or unusual typeface, or an unusual *setting* of a common one (light weights at huge sizes, extreme tracking, all-lowercase).
- A color spent unusually (a single hot accent on a monochrome page; a dark brand in a light category).
- A signature surface (Stripe's WebGL gradient, Linear's dark glass, Notion's hand-drawn illustration, Vercel's black-and-white with geometric triangles).
- A writing tic (Mailchimp's warmth, Stripe's precise long-sentence headlines, Apple's fragments).
- A motion fingerprint (spring vs. ease-out; snappy 150ms vs. cinematic 800ms).

Write these into `visual.principles`, `motion.signature` and `voice.principles`. If the brand has **no** distinctive element, say so honestly in `extract` mode, and make finding one the core of `evolve`/`reimagine`.

## 3. Restraint is a system property

Great systems use few things, consistently. Count: how many colors actually carry meaning? How many type sizes? How many radii? Measured palettes often have 30 colors; the *system* usually has 1 primary, 1–2 accents, a neutral ramp and semantic states. Your job is to find the system inside the noise, not to document the noise.

- Color has a **budget**: say what share of the surface each role gets (the extractor measures it — use `colorRatio`).
- Type has a **ladder**: one display face (sometimes two), one text face, one mono — and a scale with a ratio.
- Shape has a **language**: sharp, subtle, rounded or pill — and mixing them is a decision, not an accident.

## 4. Hierarchy comes from contrast in one dimension at a time

Size *or* weight *or* color — strong systems lead with one. Light-weight brands (Stripe, Apple marketing) make hierarchy with size and space; heavy brands (Figma, Gumroad) with weight; monochrome brands (Vercel, Notion) with contrast and space. Identify which axis this brand uses and write it as a rule ("weight never carries hierarchy; size does").

## 5. Proximity to the product

The best B2B brands look like their product; the best consumer brands feel like their promise. Check: do the marketing surfaces use the product's UI language (Linear, Raycast, Vercel) or an editorial/illustrative language separate from it (Notion, Mailchimp, Headspace)? That determines whether imagery should be screenshots or art.

## 6. Systems over one-offs

Every rule in WATERCOLOR.md should generate *many* correct outcomes: a token, a ratio, a curve, a constraint. "Use the gradient sparingly" is weak; "the gradient appears once per page, as a surface behind the hero or as a 2px accent rule — never behind body text" is a system.

## 7. Motion is behavior, not decoration

Motion should express the brand's temperament: confident brands decelerate decisively (ease-out, short), playful brands overshoot (spring), premium brands take their time (long, smooth in-out). Measured durations/curves are the truth; your job is to name the temperament and when *not* to animate.

## 8. Voice is the cheapest place to be distinctive

Every company can write "Build faster. Ship smarter." Look at their real copy: sentence length, person, specificity, numerals, punctuation, humor. A voice principle is useful only if it changes what someone writes tomorrow.

## 9. Accessibility is part of the brand

Contrast failures aren't a separate checklist — they're a brand flaw. Report them (the contrast table has WCAG and APCA). In `evolve`, fix them while preserving the feel (darken the muted text 1–2 ramp steps, not to black).

## 10. Evidence, then interpretation, then rules

1. **Evidence** — what was measured (brand.json, screenshots, copy).
2. **Interpretation** — what it means (strategy.json).
3. **Rules** — what to do (WATERCOLOR.md §0).

Never skip a level. Never invent evidence.

## Calibration: what "great" looks like

| Brand | The decision | How it shows up |
|---|---|---|
| Stripe | Infrastructure can be beautiful | Söhne Light at large sizes, blurple spent only on actions, WebGL gradient as signature surface, blue-tinted layered shadows, long precise headlines |
| Linear | Software built with craft | Dark, dense, Inter Display tight tracking, subtle glows only in product shots, monochrome UI with a single violet accent, 1px borders over shadows |
| Notion | A tool that gets out of the way | Off-white canvas, black ink, hand-drawn character illustrations, serif accent headlines, near-zero color |
| Vercel | Developer speed, rendered as minimalism | Pure black/white, Geist, triangle geometry, 1px grid lines, no shadows, monospace accents |
| Mailchimp | Friendly expertise for small business | Cavendish yellow, Means font, quirky illustration, warm human copy with jokes |
| Apple | Product as hero | Huge product photography, SF Pro Display with tight tracking, sentence fragments, black/white with product color |

These are calibration points for *quality of reasoning*, not templates to copy.
