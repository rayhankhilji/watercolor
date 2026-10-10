---
watercolor: 1
brand: "Plot"
url: https://plot.so/
generated: 2026-10-10
mode: extract
scheme: light
colors:
  background: "#faf3ec"
  foreground: "#000000"
  primary: "#800532"
  accent: ["#d49b2e", "#f2d192", "#9d762e"]
fonts:
  display: "Goodsans"
  body: "Goodsans"
  mono: "ui-monospace"
radius: { button: "9999px", card: "48px" }
spacing_base: 4
motion: { fast: 150, base: 200, slow: 500, ease: "cubic-bezier(0.4, 0, 0.2, 1)" }
---

# Plot — WATERCOLOR.md

> The single source of truth for designing, writing and building **on-brand for Plot**. Measured from [plot.so](https://plot.so/) by [watercolor](https://github.com/rayhankhilji/watercolor), then distilled into rules. When this file and your instincts disagree, **this file wins**.
>
> **For agents:** read §0 before generating anything. Tokens live in `tokens/`; assets are indexed in §12. Values marked *derived* were generated to complete the system; everything else was observed on the live site.

0. [The rules](#0-the-rules) · 1. [Brand essence](#1-brand-essence) · 2. [Voice & copy](#2-voice-copy) · 3. [Color](#3-color) · 4. [Typography](#4-typography) · 5. [Layout & spacing](#5-layout-spacing) · 6. [Shape & depth](#6-shape-depth) · 7. [Motion](#7-motion) · 8. [Components](#8-components) · 9. [Iconography](#9-iconography) · 10. [Imagery & media](#10-imagery-media) · 11. [Logo](#11-logo) · 12. [Asset index](#12-asset-index) · 13. [Do / Don't](#13-do-dont) · 14. [Implementation](#14-implementation) · 15. [Provenance](#15-provenance)

## 0. The rules

1. **Primary is `#800532`** (Oxblood). Spend it on actions, focus and key accents — it covers only ~18% of the surface. Text on it is `#FFFFFF`.
2. **Headlines are sentence case.** Capitalize only the first word and proper nouns.
3. **Display type is Goodsans 400** at 48px / 1.2 with -0.020em tracking (tight). Light, not bold — weight never carries hierarchy, size does.
4. **Body copy is Goodsans 400, 20px / 1.4** in `#6B6B6B`.
5. **Spacing sits on a 4px grid.** Use the scale: 4 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24.
6. **Shape language is mixed.** Buttons use fully rounded (pill) corners; cards 48px. Don't exceed 48px except for pills.
7. **Shadows are tinted** (`rgb(250 243 236)`), never neutral black. Elevation is soft and layered.
8. **Interactions take 150–200ms on `cubic-bezier(0.4, 0, 0.2, 1)`.** Reveals 500ms on `cubic-bezier(0.445, 0.05, 0.55, 0.95)`. Motion intensity: expressive.
9. **Flat color.** The site uses no meaningful gradients — don't introduce decorative ones.
10. **No exclamation marks.** Confidence is quiet.
11. **No emoji** in product or marketing copy.
12. Use cream backgrounds and oxblood CTAs.
13. Pair every bold claim with a gold supporting line that quantifies it.
14. Show real social video in phone frames.

## 1. Brand essence

**Plot** — AI video social listening — Plot watches social video 24/7 so brand, community and creator teams find every mention, tagged or not.

|  |  |
| --- | --- |
| Category | Video social listening (marketing AI) |
| Model | B2B · sales-led |
| Primary audience | Social, community and creator teams at consumer brands |
| Buyer | Heads of social, brand marketing and consumer insights at enterprise consumer companies |
| User | Social media managers, community managers and creator-partnership leads |
| Stage | Venture-backed growth stage ($10M+ raised; enterprise consumer-brand customers) |
| Competitive set | Brandwatch, Sprinklr, Talkwalker, Dash Hudson |
| Customers shown | Lululemon, Empire State Building, Cava, La Roche Posai, Mastercard, Listerine, Dutch Bros, Indeed, Benefit Cosmetics, Anthropologie, Stubhub, Canva |

**Positioning.** For social teams at consumer brands, Plot is the AI that actually watches social video — catching the 80% of brand mentions that text-based listening misses, so teams can engage, source creators and prove impact without doomscrolling.

**Promise.** AI that watches social video 24/7 so you don't have to.

**Pillars**

- **Capture it all, tagged or not** — Audio, visuals and captions — not just @handles.
- **Understand the full context** — 360° analysis of every video: who, what and why.
- **Prove your impact** — Views, engagement, EMV and sentiment across every mention.

**What makes it different**

- Video-native listening — reads audio, visuals and captions, not just text and @handles
- Built by social media marketers for social media marketers
- Purpose-built workflows per team: community, creator, research

### Personality

Plot feels like a beauty-and-lifestyle magazine that happens to be an AI company: warm cream pages, oxblood and honey-gold accents, huge light headlines and real creator videos front and centre. It speaks like a colleague who has done the job — 'Built with heart, by people who've done the work', 'Let's talk :)' — confident about the tech but never cold.

| We are | We are not |  |
| --- | --- | --- |
| **Warm** | Saccharine | Cream backgrounds, '24/7 so you don't have to', a smiley in the contact headline — friendly without gushing. |
| **Culture-fluent** | Trend-chasing | Speaks UGC, creators, doomscrolling — and shows real creator content, not stock. |
| **Confident** | Aggressive | 'The era of text based social listening is over.' — a bold claim backed by '80% of brand mentions happen in video'. |
| **Polished** | Corporate | Luxury-adjacent palette and type that fit the beauty and retail brands it serves. |

|  |  |  |
| --- | --- | --- |
| Formal | `──────●────` | Casual |
| Serious | `─────●─────` | Playful |
| Technical | `────────●──` | Accessible |
| Restrained | `──────●────` | Expressive |
| Classic | `──────●────` | Modern |
| Quiet | `────●──────` | Loud |

**Archetype:** The Insider — a social marketer's peer who understands the culture as well as the data.

## 2. Voice & copy

Conversational, benefit-first and fluent in social-team language. Headlines are centered, mid-length statements; supporting lines in honey-gold make the claim concrete with a number. Second person, contractions, and the occasional emoticon in human moments.

**Say the pain out loud.** Name what social teams hate doing.
  - ✓ Less doomscrolling. Less manual performance tracking.
  - ✗ Optimize your social media monitoring workflows.
**Claim, then quantify.** Bold statement followed by a specific number.
  - ✓ Uncover 8x more user generated content with video social listening.
  - ✗ Discover more content than ever before.
**Speak like a peer.** Built by social marketers — use their words.
  - ✓ Finding the UGC that never tags the brand.
  - ✗ Leverage multimodal AI for brand intelligence.
**A little heart.** Warmth in human touchpoints (about, contact, careers).
  - ✓ Let's talk :)
  - ✗ Submit an inquiry.

### Mechanics (measured)

|  |  |
| --- | --- |
| Heading case | sentence |
| Average headline length | 5.9 words |
| Average sentence length | 19.4 words |
| Reading grade (Flesch-Kincaid) | 9.9 |
| Addresses the reader (you/your) | 1.5 per 100 words |
| Speaks as we/our | 3.7 per 100 words |
| Exclamation marks | never |
| Emoji | never |
| Periods on headlines | 50% of headlines |
| Em dashes | yes |
| Oxford comma | yes |

- Sentence case headlines, usually with a period.
- Numerals and multipliers ('8x', '80%', '24/7').
- Contractions always (don't, you're, we've).
- Primary CTA is 'Schedule Demo' (title case on buttons).

### Vocabulary

**Say:** `social video` · `UGC` · `untagged` · `creators` · `community` · `social listening` · `EMV` · `doomscrolling` · `social teams`

**Don't say:** ~~leverage~~ · ~~synergy~~ · ~~omnichannel~~ · ~~revolutionize~~ · ~~harness~~ · ~~cutting-edge~~

### The brand in its own words

**Headlines**

> AI that watches social video 24/7 so you don’t have to.
> The era of text based social listening is over.
> One AI video social listening platform. Purpose built workflows for your community, creator, and research teams.
> Home
> Products
> Legal
> Plot Newsroom
> About Plot
> We believe social teams deserve tools as powerful as their impact.
> Built by social media marketers, made for social media marketers.

**Calls to action:** `Schedule Demo` · `Products` · `Contact sales`

**Recurring terms:** social, home products, products legal, plot, built, teams, home, products, legal, social listening, social media, media marketers, video, video social, listening, platform

### Rewrites

| Context | On brand ✓ | Off brand ✗ |
| --- | --- | --- |
| Hero | AI that watches social video 24/7 so you don't have to. | Next-generation AI-powered social intelligence platform |
| Feature | Find the creators already talking about you — tagged or not. | Advanced creator discovery capabilities |
| Case study title | How Chefman turned untagged UGC into a creator growth engine | Chefman Case Study: Driving ROI Through Social |
| Empty state | No mentions yet today. We're still watching. | No data available for the selected period. |
| Social post | 80% of brand mentions on TikTok never tag the brand. We found them. | 🚀 Unlock the power of social listening with AI! 🚀 |

### Tagline options

- “AI that watches social video so you don't have to.”
- “Every mention. Tagged or not.”
- “Social listening, for the video era.”

## 3. Color

Cream dominates; black for type; oxblood for actions and the announcement bar; honey gold for supporting statements; pastels as panel backgrounds. Dark chocolate #230603 for inverse sections.

Scheme: **light**. Primary `#800532` is the one color that means "Plot".

|  | Token | Hex | OKLCH | Name | Use |
| --- | --- | --- | --- | --- | --- |
| ![#faf3ec](https://img.shields.io/badge/-%20%20%20%20%20-faf3ec?style=flat-square) | `--color-background` | `#FAF3EC` | `oklch(96.77% 0.012 67.68)` | Cream | Page background |
| ![#fbf6ef](https://img.shields.io/badge/-%20%20%20%20%20-fbf6ef?style=flat-square) | `--color-surface` | `#FBF6EF` | `oklch(97.51% 0.0107 76.6)` | Linen | Raised / alternate section background |
| ![#f6e1e6](https://img.shields.io/badge/-%20%20%20%20%20-f6e1e6?style=flat-square) | `--color-surface-alt` | `#F6E1E6` | `oklch(92.81% 0.0239 1.36)` | Light Tinted Gray | Second surface tier |
| ![#000000](https://img.shields.io/badge/-%20%20%20%20%20-000000?style=flat-square) | `--color-foreground` | `#000000` | `oklch(0% 0 0)` | Ink | Primary text & ink |
| ![#6b6b6b](https://img.shields.io/badge/-%20%20%20%20%20-6b6b6b?style=flat-square) | `--color-muted` | `#6B6B6B` | `oklch(52.78% 0 0)` | Graphite | Secondary text |
| ![#7d7a76](https://img.shields.io/badge/-%20%20%20%20%20-7d7a76?style=flat-square) | `--color-subtle` | `#7D7A76` | `oklch(58.09% 0.0071 75.37)` | Warm Gray | Tertiary text, placeholders |
| ![#c2b6ab](https://img.shields.io/badge/-%20%20%20%20%20-c2b6ab?style=flat-square) | `--color-border` | `#C2B6AB` | `oklch(78.32% 0.0206 65.07)` | Taupe | Hairlines, dividers, input borders |
| ![#800532](https://img.shields.io/badge/-%20%20%20%20%20-800532?style=flat-square) | `--color-primary` | `#800532` | `oklch(38.62% 0.1508 9.48)` | Oxblood | Brand primary — CTAs, focus, key accents |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-primary-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text/icons on primary |
| ![#800532](https://img.shields.io/badge/-%20%20%20%20%20-800532?style=flat-square) | `--color-link` | `#800532` | `oklch(38.62% 0.1508 9.48)` | Oxblood | Inline links |
| ![#d49b2e](https://img.shields.io/badge/-%20%20%20%20%20-d49b2e?style=flat-square) | `--color-accent` | `#D49B2E` | `oklch(72.63% 0.1361 78.92)` | Honey | Secondary brand color |
| ![#f2d192](https://img.shields.io/badge/-%20%20%20%20%20-f2d192?style=flat-square) | `--color-accent-2` | `#F2D192` | `oklch(87.43% 0.0883 83.12)` | Butter | Secondary brand color |
| ![#9d762e](https://img.shields.io/badge/-%20%20%20%20%20-9d762e?style=flat-square) | `--color-accent-3` | `#9D762E` | `oklch(59.08% 0.1008 79.71)` | Amber | Secondary brand color |
| ![#baa1cd](https://img.shields.io/badge/-%20%20%20%20%20-baa1cd?style=flat-square) | `--color-accent-4` | `#BAA1CD` | `oklch(74.56% 0.0679 310.36)` | Purple | Secondary brand color |
| ![#230603](https://img.shields.io/badge/-%20%20%20%20%20-230603?style=flat-square) | `--color-inverse-background` | `#230603` | `oklch(17.62% 0.0519 31.81)` | Espresso | Inverted sections (footer, dark bands) |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-inverse-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text on inverse background |
| ![#1a9246](https://img.shields.io/badge/-%20%20%20%20%20-1a9246?style=flat-square) | `--color-success` | `#1A9246` | `oklch(58.01% 0.1512 149.89)` | Green | Positive states |
| ![#f2d192](https://img.shields.io/badge/-%20%20%20%20%20-f2d192?style=flat-square) | `--color-warning` | `#F2D192` | `oklch(87.43% 0.0883 83.12)` | Butter | Caution states |
| ![#cc4543](https://img.shields.io/badge/-%20%20%20%20%20-cc4543?style=flat-square) | `--color-danger` | `#CC4543` | `oklch(57.98% 0.1715 24.96)` | Red | Errors & destructive |

**Proportion** (share of painted surface on the live site):

- Light surfaces: **45%**
- Ink & text: **33%**
- Primary: **18%**
- Accents: **4%**

### Contrast

| Foreground | on Background | WCAG | APCA Lc | Pass |
| --- | --- | --- | --- | --- |
| `#000000` | `#FAF3EC` | 19.1:1 | 99.5 | AAA |
| `#6B6B6B` | `#FAF3EC` | 4.85:1 | 70 | AA |
| `#7D7A76` | `#FAF3EC` | 3.88:1 | 63 | AA large |
| `#000000` | `#FBF6EF` | 19.53:1 | 101 | AAA |
| `#FFFFFF` | `#800532` | 10.58:1 | -96.7 | AAA |
| `#800532` | `#FAF3EC` | 9.62:1 | 86 | AAA |
| `#FFFFFF` | `#230603` | 19.11:1 | -107.3 | AAA |
| `#D49B2E` | `#FAF3EC` | 2.24:1 | 41.7 | ✗ decorative only |
| `#F2D192` | `#FAF3EC` | 1.33:1 | 15.6 | ✗ decorative only |
| `#9D762E` | `#FAF3EC` | 3.77:1 | 61.8 | AA large |

### Scales

OKLCH ramps generated around each brand color. The brand's exact value is pinned (●) at its nearest step, so tints and shades stay in family.

|  | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | #f7f7f7 | #ededed | #d7d7d7 | #bcbcbc | #9f9f9f | #858585 | #6b6b6b ● | #545454 | #404040 | #2d2d2d | #1b1b1b |
| primary | #fff1f6 | #ffe0e9 | #ffc1d2 | #ff97b2 | #fc6a91 | #e84575 | #c8285c | #a41145 | #800532 ● | #5d0121 | #3d0010 |
| accent | #fff7eb | #fdecd3 | #f5d6a9 | #e8ba70 | #d49b2e ● | #bd8000 | #9b6800 | #7b5200 | #5e3d00 | #432a00 | #2a1800 |
| accent2 | #faf5eb | #f4e9d4 | #f2d192 ● | #d6b97e | #c09b4c | #aa831f | #8e6b00 | #725400 | #574000 | #3e2c00 | #261a00 |
| accent3 | #fdf6ee | #f7ebda | #eed8ba | #dfbf8f | #cba364 | #b78d44 | #9d762e ● | #7d5c1a | #5f450d | #432f05 | #291b00 |
| accent4 | #fbf8fe | #f4eefb | #e6d9f1 | #d1bee2 | #baa1cd ● | #a185b4 | #856a96 | #6a5278 | #503c5b | #37283f | #221627 |
| success | #f0fbf0 | #ddf4de | #bee8c0 | #92d79a | #63c175 | #3bab5a | #1a9246 ● | #007533 | #005925 | #003f18 | #00260a |
| warning | #faf5eb | #f4e9d4 | #f2d192 ● | #d6b97e | #c09b4c | #aa831f | #8e6b00 | #725400 | #574000 | #3e2c00 | #261a00 |
| danger | #fff2f1 | #ffe2e0 | #ffc7c4 | #ffa29e | #fd7b78 | #ea5c5a | #cc4543 ● | #a62f2e | #81201e | #5d1310 | #3c0504 |

### Gradient

*Derived* from the palette: `#800532` → `#D49B2E` → `#F2D192` → `#9D762E`

```css
background: linear-gradient(120deg, #800532, #d49b2e, #f2d192, #9d762e);
```

### Dark theme (*derived*)

The site ships one theme. This counterpart is built from the brand's own neutrals; apply with `[data-theme="dark"]`.

| Token | Value |
| --- | --- |
| `--color-background` | `#0F0F0F` |
| `--color-surface` | `#181818` |
| `--color-surface-alt` | `#202020` |
| `--color-foreground` | `#EFE8E2` |
| `--color-muted` | `#A6A19D` |
| `--color-subtle` | `#797673` |
| `--color-border` | `#282828` |
| `--color-primary` | `#A55060` |
| `--color-primary-foreground` | `#FFFFFF` |
| `--color-link` | `#B26774` |

<details><summary>Original CSS variables found on the site</summary>

| Variable | Value |
| --- | --- |
| `--accent` | `oklch(87.4% .088 83.11)` |
| `--accent-foreground` | `oklch(17.6% .052 31.81)` |
| `--background` | `oklch(97.5% .011 76.58)` |
| `--blue--blue-1` | `#d9e3f3` |
| `--blue--blue-4` | `#697b88` |
| `--brand-primary` | `#230603` |
| `--brown` | `#800532` |
| `--card` | `oklch(92.8% .024 1.44)` |
| `--card-foreground` | `oklch(0% 0 0)` |
| `--color-black` | `#000` |
| `--color-neutral-400` | `oklch(70.8% 0 0)` |
| `--color-ploy-magazine-black` | `#230603` |
| `--color-ploy-magazine-brand` | `#800532` |
| `--color-ploy-magazine-button` | `#f1f1f1` |
| `--color-ploy-magazine-card` | `#fff` |
| `--color-ploy-magazine-line` | `#ececec` |
| `--color-ploy-magazine-maroon` | `#f2e6ea` |
| `--color-ploy-magazine-muted` | `#494949` |
| `--color-primary` | `#faf3ec` |
| `--color-white` | `#fff` |
| `--color-zinc-200` | `oklch(92% .004 286.32)` |
| `--color-zinc-500` | `oklch(55.2% .016 285.938)` |
| `--destructive` | `oklch(52.8% 0 0)` |
| `--foreground` | `oklch(0% 0 0)` |

</details>

## 4. Typography

Good Sans (regular/medium) for headlines and UI with tight tracking at large sizes; TT Commons Pro for body. Weight stays at 400–500 — hierarchy comes from size.

| Family | CSS name | Roles | Weights | Source | Open alternative |
| --- | --- | --- | --- | --- | --- |
| **Goodsans** | `Goodsans` | display, heading, body | 400 500 | self-hosted | — |
| **TT Commons Pro** | `TT Commons Pro` | body | 400 500 600 700 | self-hosted | Figtree, Manrope |

> Proprietary faces are captured to `captured/fonts/` **for reference and local rendering only**. License them from the foundry before shipping; until then use the open alternative, which the token stacks already include as the first fallback.

### Scale

| Style | Family | Size | Weight | Line height | Tracking | Case | Sample |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | Goodsans | 168.75px | 400 | 1.1 | -0.010em | — | “Less operations, more creativity” |
| `h1` | Goodsans | 48px | 400 | 1.2 | -0.020em | — | “The era of text based social listening is over.” |
| `h2` | Goodsans | 32px | 400 | 1.2 | -0.040em | — | “80% of brand mentions happen in video and most g” |
| `h3` | Goodsans | 25.6px | 400 | 1.25 | -0.025em | — | “"Since using Plot, I've been seeing a 30%- 50% l” |
| `h4` | TT Commons Pro | 20px | 600 | 1.4 | 0.000em | — | “Capture it all, tagged or not” |
| `body-lg` | Goodsans | 23px | 400 | 1.55 | 0.000em | — |  |
| `body` | TT Commons Pro | 20px | 400 | 1.4 | 0.000em | — | “Our AI reads audio, visuals, and captions, not j” |
| `body-sm` | TT Commons Pro | 18px | 400 | 1.556 | 0.000em | — | “AI Video Social Listening” |
| `label` | Goodsans | 19px | 500 | 1.2 | 0.000em | — |  |
| `caption` | TT Commons Pro | 16px | 500 | 1.5 | 0.000em | — | “Plot raises $10M from XYZ and Mischief Ventures.” |
| `eyebrow` | Goodsans | 15px | 600 | 1.2 | 0.080em | uppercase |  |
| `code` | ui-monospace | 18px | 400 | 1.6 | 0.000em | — |  |

Base **20px**; measured ratio ≈ **1.238** (Major Third). Sizes in use: 11, 14, 16, 18, 19, 20, 24, 26, 30, 32, 48, 64, 78, 84, 150, 169.

```css
.display { font: 400 168.75px/1.1 var(--font-display); letter-spacing: -0.01em; }
.body { font: 400 20px/1.4 var(--font-body); }
```

## 5. Layout & spacing

Centered hero and section headers, 1184px measure, generous vertical rhythm, large 24–48px radius panels, pill buttons.

|  |  |
| --- | --- |
| Content max-width | 1184px |
| Other containers | 1184px, 1120px, 1536px, 480px, 624px |
| Grid columns in use | 3, 2, 12 |
| Gutter | 32px |
| Breakpoints | 376px · 480px · 768px · 960px · 992px · 1921px |
| Spacing unit | 4px |
| Spacing scale | 3, 4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 40, 42, 44, 48, 52 |
| Section padding | 48px, 52px |
| Density | balanced |
| Alignment | centered |

## 6. Shape & depth

Mixed by design: pill buttons, 24–48px radius panels, 12–16px cards.

Shape language: **mixed**.

| Radius | Value | Uses |
| --- | --- | --- |
| xs | `1px` | 4 |
| sm | `12px` | 25 |
| md | `16px` | 6 |
| lg | `24px` | 7 |
| xl | `32px` | 2 |
| 2xl | `48px` | 18 |
| full | `9999px` | 17 |

**Elevation**

| Level | box-shadow |
| --- | --- |
| xs | `rgba(250, 243, 236, 0.4) 0px 0px 0px 10px` |
| sm | `rgba(163, 163, 163, 0.25) 0px 0.03125px 3px 2px` |
| md | `rgba(163, 163, 163, 0.25) 0.38px 2.26px 1.51px 0px` |
| lg | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px` |
| xl | `rgba(163, 163, 163, 0.25) 0px 0.66px 3.97px 2.65px` |
| 2xl | `rgba(163, 163, 163, 0.25) 0px 0.68px 4.7px 3.13px` |
| 3xl | `rgba(163, 163, 163, 0.25) 0px 0.91px 5.47px 3.65px` |
| 4xl | `rgba(24, 39, 75, 0.5) 0px 16px 32px -16px` |

**Borders**

| Width | Style | Color | Uses |
| --- | --- | --- | --- |
| 1px | solid | `#C2B6AB` | 2 |
| 1px | solid | `#FEFCFA` | 1 |

## 7. Motion

Scroll-led storytelling with GSAP ScrollTrigger: product panels pin and sequence as you scroll, videos autoplay, and a Lottie animation illustrates the product. UI transitions are quick (150–300ms) on a soft standard curve.

Intensity: **expressive**. Stack: GSAP, GSAP ScrollTrigger, Lottie.

- **Video is the motion** — Autoplaying creator videos carry most of the movement; UI motion stays quiet.
- **Scroll tells the story** — Workflows (community, creator, research) reveal as pinned scroll sections.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 150ms | Hover, press, color changes |
| `--duration-base` | 200ms | Small movement, dropdowns, toggles |
| `--duration-slow` | 500ms | Reveals, page-level transitions |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for on-screen movement |
| `--ease-entrance` | `cubic-bezier(0.445, 0.05, 0.55, 0.95)` | Elements arriving |
| `--ease-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements leaving (*derived*) |
| `--ease-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebratory / attention moments |

**Curves measured on the site**

| Curve | Character | Uses |
| --- | --- | --- |
| `cubic-bezier(0.4, 0, 0.2, 1)` | standard (Material) — Material standard curve — quick start, long settle. | 74 |
| `cubic-bezier(0.39, 0.575, 0.565, 1)` | cubic-bezier(0.39, 0.575, 0.565, 1) — Custom curve | 32 |
| `ease` | ease — Browser default; gentle and generic. | 19 |
| `ease-in-out` | ease-in-out — Symmetric and smooth — for on-screen movement. | 10 |
| `cubic-bezier(0.445, 0.05, 0.55, 0.95)` | ease-in-out — Symmetric and smooth — for on-screen movement. | 6 |
| `linear` | linear — Mechanical, constant velocity — loops, marquees, progress. | 5 |
| `cubic-bezier(0.19, 1, 0.22, 1)` | easeOutExpo — Dramatic, product-launch deceleration. | 2 |

**Durations measured:** 300ms (44), 270ms (21), 150ms (17), 200ms (16), 280ms (15), 400ms (10), 500ms (8), 240ms (7), 700ms (4), 320ms (3)

**Scroll & ambient motion:** Scroll-linked timelines (GSAP ScrollTrigger); Infinite marquee.

**Keyframes in use**

| Name | What it does | Uses |
| --- | --- | --- |
| `marquee-loop` | move | 2 |

**Signature motion.** Pinned, scroll-driven walkthrough of the three team workflows alongside autoplaying creator videos.

**Rendered motion assets** (`motion/`):

- `logo-reveal` — Logo reveal (16:9): Glyph-by-glyph rise with scale on the brand's entrance curve (cubic-bezier(0.445, 0.05, 0.55, 0.95)), 45ms stagger.
- `logo-reveal-square` — Logo reveal (1:1): Glyph-by-glyph rise with scale on the brand's entrance curve (cubic-bezier(0.445, 0.05, 0.55, 0.95)), 45ms stagger.
- `gradient-loop` — Living gradient (seamless loop): The brand's chromatic palette flowing through domain-warped noise. Loops perfectly every 6s.
- `type-reveal` — Kinetic headline: Word-by-word reveal with blur-to-sharp focus — for launch videos, ads and social cuts.
- `loader` — Loader (transparent): Mark breathing on the brand's standard curve; 1.6s loop. Transparent WebM for apps; GIF fallback.
- `transition-wipe` — Transition wipe: Three brand-color panels sweep across — a cut between scenes in product videos.
- `end-card` — End card: Logo, call to action and URL — the closing frame for every video.

Always honor `prefers-reduced-motion` (see `motion/motion.css`).

## 8. Components

Exact computed styles captured from the live site. Hover states were measured by actually hovering.

### Button — primary

Seen as “Schedule Demo” (4×)

```css
.btn-primary {
  background: rgb(128, 5, 50);
  color: rgb(255, 255, 255);
  font: 500 14.4px/18px Goodsans;
  letter-spacing: -0.8px;
  padding: 8px 16px 8px 16px;
  border-radius: 60px;
  height: 34px;
  transition: background-color 0.24s cubic-bezier(0.39, 0.575, 0.565, 1);
}
.btn-primary:hover {
  background-color: rgb(96, 4, 38);
}
```

### Button — ghost

Seen as “Products” (4×)

```css
.btn-ghost {
  background: rgba(250, 243, 236, 0);
  color: rgb(34, 34, 34);
  font: 400 16px/24px "TT Commons Pro";
  padding: 0px 30px 0px 0px;
  border-radius: 1px;
  height: 24px;
}
```

### Button — accent

Seen as “Contact sales” (1×)

```css
.btn-accent {
  background: rgb(35, 6, 3);
  color: rgb(250, 243, 236);
  font: 500 23.08px/28.85px Goodsans;
  letter-spacing: -0.923px;
  padding: 21.4301px 40px 21.4301px 41px;
  border-radius: 60px;
  height: 71.6875px;
  transition: background-color 0.24s cubic-bezier(0.39, 0.575, 0.565, 1);
}
```

### Button — primary-2

Seen as “Schedule Demo” (1×)

```css
.btn-primary-2 {
  background: oklch(0.386 0.151 9.48);
  color: oklch(0.975 0.011 76.58);
  font: 500 16px/20px Goodsans;
  letter-spacing: -0.8px;
  padding: 10px 20px 10px 20px;
  border-radius: 67.5008px;
  height: 40px;
  transition: background-color 0.24s cubic-bezier(0.39, 0.575, 0.565, 1);
}
```

### Card — filled


```css
.card {
  background: rgb(246, 225, 230);
  color: rgba(35, 6, 3, 0.8);
  font: 400 16px/24px "TT Commons Pro";
  padding: 48px 48px 43px 48px;
  border-radius: 48px;
  height: 550.047px;
}
```

### Badge

```css
.badge {
  background: oklch(0.975 0.011 76.58);
  color: oklch(0.386 0.151 9.48);
  font: 500 9px/14px "Azeret Mono";
  letter-spacing: 1.08px;
  text-transform: uppercase;
  padding: 2px 8px 2px 8px;
  border-radius: 3.35544e+07px;
  height: 18px;
}
```

### Navigation


Items: Customers Customers · Blog Blog · Research Research

## 9. Iconography

Phosphor-style 2px line icons in small sizes above feature labels.

|  |  |
| --- | --- |
| Style | fill |
| Stroke width | 2px |
| Grid | 24×24 |
| Line caps / joins | round / round |
| Corners | rounded |
| Library | Phosphor |
| Captured | 10 icons in `captured/icons/` |

**Drawing a new icon:** 24px grid, solid fills, consistent optical weight, color `currentColor`. Keep ≥ 2px between parallel strokes and align to whole pixels.

## 10. Imagery & media

Vertical creator videos (TikTok/Reels) in phone frames, annotated with Plot UI chips; customer logo marquee in muted tones.

Mix on site: 13 photos · 7 illustrations · 5 product screenshots · 15 other.

| Media |  |
| --- | --- |
| Videos | 4 (4 downloaded to `captured/videos/`) |
| Lottie | 1 in `captured/lottie/` |
| Scroll recording | `captured/recordings/home-scroll.mp4` |

**Customer logos shown:** 21 captured to `captured/customer-logos/` — Lululemon, Empire State Building, Cava, La Roche Posai, Mastercard, Listerine, Dutch Bros, Indeed, Benefit Cosmetics, Anthropologie, Stubhub, Canva, Hourglass, Gnc, Warby Parker, Starface, Turbotax, Tory Burch, Goodles, Yahoo!, Pf Chang.

## 11. Logo

Primary: `captured/logos/header-62a09f6844.svg` (wordmark, svg, from the header; confidence signals: home link, named logo, in header, links home, top of page).

Mark: taken from the favicon.

Files in `logo/`: SVG (original, black, white, ink, primary), PNG at 512/1024/2048, favicon set, app icons, and lockups on light/dark/brand/gradient.

- **Clear space:** The height of the 'P' on all sides.
- **Minimum size:** 18px tall.
- **On color:** use the white version on `#230603` and on the primary; the ink version on light surfaces.

**Never:**
- Recolor outside black, oxblood or cream
- Place on busy video frames without a cream backing
- Add effects

## 12. Asset index

| Folder | Contents |
| --- | --- |
| `tokens/` | `tokens.json` (W3C DTCG) · `tokens.css` · `tailwind.css` (v4) · `tokens.figma.json` (Tokens Studio) · `tokens.ts` · `tokens.scss` |
| `colors/` | `palette.png` spec sheet · `palette.ase` (Adobe) · `palette.gpl` · `palette.json` |
| `typography/` | `specimen.png` |
| `logo/` | 0 files — SVG/PNG variants, lockups, `favicon/` (ico, svg, png, manifest, head.html), `app-icon/` |
| `patterns/` | watercolor-wash, mesh-gradient, signature-gradient, contours, dot-grid, grid, mark-lattice, orbits, wordmark-wall (SVG + PNG, seamless tiles in `tiles/`) |
| `social/` | og-default, og-announcement, og-article, x-header, linkedin-banner, instagram-post, instagram-story, youtube-thumbnail, quote-card, avatar — PNG + editable HTML in `social/templates/` |
| `motion/` | logo-reveal, logo-reveal-square, gradient-loop, type-reveal, loader, transition-wipe, end-card (MP4 · WebM · GIF · poster) · `motion.css` · `loader.svg` · `easing-curves.svg` · HTML sources |
| `templates/` | email signature · business cards · slide deck (HTML + PDF) · letterhead (PDF) · video-call background |
| `guidelines/` | `index.html` brand book · `brand-book.pdf` |
| `captured/` | Everything taken from the live site: screenshots, logos, fonts, icons, images, videos, GIFs, Lottie, Rive, shaders, canvas recordings, components, scroll recording |

**Patterns**

- `watercolor-wash` — Translucent glazes in the brand's own hues, with wet edges, pooled pigment rims, granulation and cold-press paper. Hero backgrounds, covers, editorial and campaign moments. *(derived)*
- `mesh-gradient` — Soft overlapping color fields with film grain — the brand's gradient as a surface. Use full-bleed behind light type. *(derived)*
- `signature-gradient` — A gradient composed from the brand's chromatic colors (derived — the site uses none). *(derived)*
- `contours` — Topographic hairlines in the brand's neutrals with a single accent line. Quiet texture for data, infrastructure and editorial contexts. *(derived)*
- `dot-grid` — Dots on a 24px lattice (6× the 4px spacing unit). Product backgrounds, diagrams, empty states. *(derived)*
- `grid` — Minor lines every 24px, major every 96px — derived from the spacing system. Technical diagrams, docs headers. *(derived)*
- `mark-lattice` — The brand mark repeated on a staggered lattice at low contrast. Packaging, merch, swag, app splash. *(derived)*
- `orbits` — Concentric rings with accent rhythm every fifth ring. Works behind product shots, AI features, announcements. *(derived)*
- `wordmark-wall` — The name "Plot" set in the display face as an all-over texture. Event backdrops, merch, social covers. *(derived)*

## 13. Do / Don't

**Do**

- ✓ Use cream backgrounds and oxblood CTAs.
- ✓ Pair every bold claim with a gold supporting line that quantifies it.
- ✓ Show real social video in phone frames.

**Don't** — the generic-AI tells this brand never shows:

- ✗ Don't use pure white pages or cold grays.
- ✗ Don't use stock photography or AI-generated people.
- ✗ Don't use heavy (700+) weights for headlines.
- ✗ Don't default to Inter. The brand's type is part of its identity — use the brand faces (or their listed alternatives).
- ✗ No purple-to-blue "AI gradient". It isn't in this palette.
- ✗ No mesh-gradient blobs or aurora backgrounds behind content.
- ✗ No glassmorphism, frosted cards or glowing borders unless the component spec below shows them.
- ✗ No ✨ sparkles, 🚀 rockets or emoji bullets.
- ✗ Avoid generic SaaS verbs the brand never uses: "unlock", "empower", "revolutionize", "supercharge", "seamless", "cutting-edge", "game-changer", "next-level".
- ✗ Don't use large rounded corners (16–24px "bubbly" cards). The brand is mixed.
- ✗ Don't center everything. Follow the measured alignment and grid.
- ✗ Don't mix icon styles. Icons here are fill at 2px stroke.
- ✗ No stock 3D illustrations, isometric people or abstract 3D shapes unless they appear in the captured imagery.

## 14. Implementation

```css
@import "./tokens/tokens.css";

body { background: var(--color-background); color: var(--color-foreground); font-family: var(--font-body); }
h1 { font: var(--text-h1-weight) var(--text-h1-size)/var(--text-h1-line-height) var(--font-display); letter-spacing: var(--text-h1-tracking); }
```

Tailwind v4:

```css
@import "tailwindcss";
@import "./tokens/tailwind.css";
```

```tsx
export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-[length:var(--text-label-size)] font-medium text-primary-foreground transition-colors duration-[150ms] ease-standard hover:bg-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}
```

Measured hover on the live primary button: `background-color: rgb(96, 4, 38)`.

**Using this file with an agent.** Add one line to your `CLAUDE.md` / `AGENTS.md` / `.cursorrules`:

```md
All UI, copy and assets must follow brand/WATERCOLOR.md. Use tokens from brand/tokens/. Never invent colors, fonts, radii or easing.
```

## 15. Provenance

- Source: [home](https://plot.so/) · [brand](https://plot.so/newsroom) · [about](https://plot.so/about-us) · [pricing](https://plot.so/pricing) · [customers](https://plot.so/customers)
- Captured 2026-10-10 05:50 UTC with watercolor 0.1.0; mode **extract**.
- Stack detected: GSAP, Webflow.
- Strategy layer: authored (strategy.json)
- Notes:
  - "TT Commons Pro" looks proprietary — captured files are for reference only. Open alternatives: Figtree, Manrope.

<sub>Logos, fonts and imagery belong to their owners. Captured files are for internal reference; respect trademarks and font licenses.</sub>

