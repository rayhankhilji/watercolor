---
watercolor: 1
brand: "Littlebird"
url: https://littlebird.ai/
generated: 2026-10-10
mode: extract
scheme: light
colors:
  background: "#fffdf5"
  foreground: "#000000"
  primary: "#1b1c14"
  accent: ["#00674f", "#826e2b"]
fonts:
  display: "Meraki"
  body: "Söhne"
  mono: "ui-monospace"
radius: { button: "9999px", card: "24px" }
spacing_base: 4
motion: { fast: 100, base: 200, slow: 500, ease: "cubic-bezier(0.2, 0, 0, 1)" }
---

# Littlebird — WATERCOLOR.md

> The single source of truth for designing, writing and building **on-brand for Littlebird**. Measured from [littlebird.ai](https://littlebird.ai/) by [watercolor](https://github.com/rayhankhilji/watercolor), then distilled into rules. When this file and your instincts disagree, **this file wins**.
>
> **For agents:** read §0 before generating anything. Tokens live in `tokens/`; assets are indexed in §12. Values marked *derived* were generated to complete the system; everything else was observed on the live site.

0. [The rules](#0-the-rules) · 1. [Brand essence](#1-brand-essence) · 2. [Voice & copy](#2-voice-copy) · 3. [Color](#3-color) · 4. [Typography](#4-typography) · 5. [Layout & spacing](#5-layout-spacing) · 6. [Shape & depth](#6-shape-depth) · 7. [Motion](#7-motion) · 8. [Components](#8-components) · 9. [Iconography](#9-iconography) · 10. [Imagery & media](#10-imagery-media) · 11. [Logo](#11-logo) · 12. [Asset index](#12-asset-index) · 13. [Do / Don't](#13-do-dont) · 14. [Implementation](#14-implementation) · 15. [Provenance](#15-provenance)

## 0. The rules

1. **The brand is monochrome.** Primary actions use the ink `#1B1C14`; hierarchy comes from contrast, weight and space — never from adding a hue.
2. **Headlines are sentence case.** Capitalize only the first word and proper nouns.
3. **Display type is Meraki 400** at 52px / 1.1 with -0.058em tracking (tight). Light, not bold — weight never carries hierarchy, size does.
4. **Body copy is Söhne 400, 15px / 1.6** in `#1B1C15`.
5. **Spacing sits on a 4px grid.** Use the scale: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20.
6. **Shape language is mixed.** Buttons use fully rounded (pill) corners; cards 24px. Don't exceed 24px except for pills.
7. **Interactions take 100–200ms on `cubic-bezier(0.2, 0, 0, 1)`.** Reveals 500ms on `cubic-bezier(0.16, 1, 0.3, 1)`. Motion intensity: subtle.
8. **Flat color.** The site uses no meaningful gradients — don't introduce decorative ones.
9. Use eggshell backgrounds and ink pill CTAs.
10. Set headlines in the soft serif, never bold.
11. Frame the product with calm, painted nature imagery.
12. State privacy facts plainly.

## 1. Brand essence

**Littlebird** — An always-on AI assistant with a memory of your work — it remembers your meetings, messages, docs and apps, then takes action so you never lose context.

|  |  |
| --- | --- |
| Category | AI personal assistant (memory) |
| Model | Prosumer · product-led |
| Primary audience | Knowledge workers drowning in meetings, messages and context-switching |
| Buyer | Individuals first (free download), then teams |
| User | Founders, operators, researchers and creators who live across many apps |
| Stage | Early-stage, venture-backed; used by people at NVIDIA, Netflix, Stanford and more |
| Competitive set | Rewind / Limitless, Granola, Otter.ai, ChatGPT memory |
| Customers shown | Tasks card: Finish onboarding flow, Meeting reminder card: quarterly review starting in 30 minutes, NVIDIA, Stanford University, Netflix, Siemens, Yale University, MIT, Rippling, Conde Nast, Ford, Zendesk |
| Proof points | 10+ languages · 200 people |

**Positioning.** For people whose work is scattered across meetings, messages and apps, Littlebird is the always-on assistant that already knows what you're working on — so you can skip the setup and just ask, with your memory kept private and in your control.

**Promise.** No need to explain yourself.

**Pillars**

- **It remembers** — A private memory of meetings, messages, docs and apps.
- **It acts** — Notes, briefings, schedules and drafts — in your voice.
- **It's yours** — You decide what it sees, keeps and forgets.

**What makes it different**

- Context you never have to explain — 'no need to explain yourself'
- Privacy as a product feature: user-controlled memory, no training, zero retention
- Works across every app and device, including the Hover overlay

### Personality

Littlebird is the quiet, attentive companion of AI assistants — a bird on your shoulder rather than a robot in your inbox. The brand trades the category's neon and sparkles for eggshell paper, a soft display serif, painted landscapes and black pill buttons. It sounds human and reassuring, and takes privacy as seriously as warmth.

| We are | We are not |  |
| --- | --- | --- |
| **Calm** | Sleepy | Eggshell backgrounds and painterly skies; one ink CTA; plenty of air between sections. |
| **Personal** | Intrusive | 'Memory this personal has to be this private.' — intimacy paired with control. |
| **Trustworthy** | Legalistic | Privacy promises in plain words ('You're the customer, not the inventory'), with footnotes for the details. |
| **Effortless** | Vague | 'Skip the setup, the pasting, and the backstory, and just ask.' — concrete about what disappears. |

|  |  |  |
| --- | --- | --- |
| Formal | `──────●────` | Casual |
| Serious | `────●──────` | Playful |
| Technical | `─────────●─` | Accessible |
| Restrained | `────●──────` | Expressive |
| Classic | `─────●─────` | Modern |
| Quiet | `──●────────` | Loud |

**Archetype:** The Companion — attentive, discreet, always nearby.

## 2. Voice & copy

Warm, plain and reassuring. Headlines are short promises about what you'll never have to do again; body copy is conversational, second person, and specific about privacy. Testimonials from real users carry the emotional proof.

**Promise relief.** Name the chore that disappears.
  - ✓ Never take meeting notes again
  - ✗ AI-powered meeting intelligence
**Privacy in plain words.** Say exactly what happens to data, in human terms.
  - ✓ We don't sell it or train on it. You're the customer, not the inventory.
  - ✗ Enterprise-grade data protection protocols.
**Talk like a companion.** Second person, gentle, never hype.
  - ✓ Littlebird already understands what you're working on — so just ask.
  - ✗ Supercharge your productivity with next-gen AI!

### Mechanics (measured)

|  |  |
| --- | --- |
| Heading case | sentence |
| Average headline length | 3.2 words |
| Average sentence length | 15.3 words |
| Reading grade (Flesch-Kincaid) | 8.3 |
| Addresses the reader (you/your) | 5 per 100 words |
| Speaks as we/our | 0.4 per 100 words |
| Exclamation marks | 1% of sentences |
| Emoji | 0.1 per 100 words |
| Periods on headlines | 2% of headlines |
| Em dashes | yes |
| Oxford comma | yes |

- Sentence case headlines without periods (except emphatic statements).
- Second person throughout; 'we' only for privacy commitments.
- Footnoted claims for security and privacy.
- CTAs: 'Download for free', 'Learn more →'.

### Vocabulary

**Say:** `remembers` · `memory` · `context` · `just ask` · `your voice` · `private` · `always-on` · `briefing`

**Don't say:** ~~supercharge~~ · ~~AI-powered~~ · ~~unlock~~ · ~~10x~~ · ~~revolutionary~~ · ~~copilot~~ · ~~magic~~

### The brand in its own words

**Headlines**

> Your always-on AI assistant
> No need to explain yourself
> An assistant across all your apps
> Never take meeting notes again
> Automate your schedules and briefs
> From blank page to final draft
> Memory this personal has to be this private.
> Hover, the AI on every screen
> For every device you’re on
> From people who use Littlebird every day

**Calls to action:** `Learn more` · `Download` · `Try it now` · `Download for Mac` · `How we handle your data` · `iOS` · `Android` · `Annual` · `Copy` · `Apps`

**Recurring terms:** littlebird, work, meetings, meeting notes, assistant, meeting, notes, you're, personal, context, personal assistant, rights reserved, usage credits, apps, free, docs

### Rewrites

| Context | On brand ✓ | Off brand ✗ |
| --- | --- | --- |
| Hero | Your always-on AI assistant | The AI copilot that 10x's your productivity ✨ |
| Feature | Perfect notes from every meeting you've had, and a full prep for every meeting you haven't. | Automated AI meeting summaries and insights |
| Privacy | Pause anytime. Delete the last hour, the last day, or everything, in two clicks. | Robust data governance controls. |
| Onboarding | Littlebird is listening for context now. Ask it anything about today. | Setup complete! Start exploring AI features 🚀 |

### Tagline options

- “No need to explain yourself.”
- “The assistant that remembers.”
- “Memory this personal has to be this private.”

## 3. Color

Eggshell surfaces dominate; ink for type and CTAs; warm grays for secondary text; deep green #00674F only inside product UI and small accents; painted imagery supplies the color.

Scheme: **light**. Monochrome brand — ink is the accent.

|  | Token | Hex | OKLCH | Name | Use |
| --- | --- | --- | --- | --- | --- |
| ![#fffdf5](https://img.shields.io/badge/-%20%20%20%20%20-fffdf5?style=flat-square) | `--color-background` | `#FFFDF5` | `oklch(99.34% 0.0107 95.16)` | Eggshell | Page background |
| ![#f6f2e6](https://img.shields.io/badge/-%20%20%20%20%20-f6f2e6?style=flat-square) | `--color-surface` | `#F6F2E6` | `oklch(96.1% 0.0164 91.55)` | Warm Paper | Raised / alternate section background |
| ![#eeece5](https://img.shields.io/badge/-%20%20%20%20%20-eeece5?style=flat-square) | `--color-surface-alt` | `#EEECE5` | `oklch(94.27% 0.0096 93.57)` | Warm Paper | Second surface tier |
| ![#000000](https://img.shields.io/badge/-%20%20%20%20%20-000000?style=flat-square) | `--color-foreground` | `#000000` | `oklch(0% 0 0)` | Black | Primary text & ink |
| ![#1b1c14](https://img.shields.io/badge/-%20%20%20%20%20-1b1c14?style=flat-square) | `--color-muted` | `#1B1C14` | `oklch(22.25% 0.015 113.41)` | Ink | Secondary text |
| ![#4d4e46](https://img.shields.io/badge/-%20%20%20%20%20-4d4e46?style=flat-square) | `--color-subtle` | `#4D4E46` | `oklch(42.04% 0.013 112.74)` | Moss Gray | Tertiary text, placeholders |
| ![#e4e2da](https://img.shields.io/badge/-%20%20%20%20%20-e4e2da?style=flat-square) | `--color-border` | `#E4E2DA` | `oklch(91.21% 0.011 95.17)` | Stone | Hairlines, dividers, input borders |
| ![#1b1c14](https://img.shields.io/badge/-%20%20%20%20%20-1b1c14?style=flat-square) | `--color-primary` | `#1B1C14` | `oklch(22.25% 0.015 113.41)` | Ink | Brand primary — CTAs, focus, key accents |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-primary-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text/icons on primary |
| ![#00674f](https://img.shields.io/badge/-%20%20%20%20%20-00674f?style=flat-square) | `--color-link` | `#00674F` | `oklch(45.69% 0.0908 169.69)` | Forest | Inline links |
| ![#00674f](https://img.shields.io/badge/-%20%20%20%20%20-00674f?style=flat-square) | `--color-accent` | `#00674F` | `oklch(45.69% 0.0908 169.69)` | Forest | Secondary brand color |
| ![#826e2b](https://img.shields.io/badge/-%20%20%20%20%20-826e2b?style=flat-square) | `--color-accent-2` | `#826E2B` | `oklch(54.36% 0.0893 92.49)` | Ochre | Secondary brand color |
| ![#2a2b22](https://img.shields.io/badge/-%20%20%20%20%20-2a2b22?style=flat-square) | `--color-inverse-background` | `#2A2B22` | `oklch(28.5% 0.0159 112.56)` | Charcoal | Inverted sections (footer, dark bands) |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-inverse-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text on inverse background |
| ![#3d8e53](https://img.shields.io/badge/-%20%20%20%20%20-3d8e53?style=flat-square) | `--color-success` | `#3D8E53` | `oklch(58.09% 0.12 150.02)` | Emerald | Positive states |
| ![#826e2b](https://img.shields.io/badge/-%20%20%20%20%20-826e2b?style=flat-square) | `--color-warning` | `#826E2B` | `oklch(54.36% 0.0893 92.49)` | Ochre | Caution states |
| ![#bf534e](https://img.shields.io/badge/-%20%20%20%20%20-bf534e?style=flat-square) | `--color-danger` | `#BF534E` | `oklch(57.92% 0.1403 25.07)` | Red | Errors & destructive |

**Proportion** (share of painted surface on the live site):

- Light surfaces: **52%**
- Ink & text: **32%**
- Accent (ink as primary): **15%**
- Accents: **1%**

### Contrast

| Foreground | on Background | WCAG | APCA Lc | Pass |
| --- | --- | --- | --- | --- |
| `#000000` | `#FFFDF5` | 20.62:1 | 104.8 | AAA |
| `#1B1C14` | `#FFFDF5` | 16.86:1 | 102.8 | AAA |
| `#4D4E46` | `#FFFDF5` | 8.27:1 | 87.8 | AAA |
| `#000000` | `#F6F2E6` | 18.76:1 | 98.3 | AAA |
| `#FFFFFF` | `#1B1C14` | 17.17:1 | -106.4 | AAA |
| `#00674F` | `#FFFDF5` | 6.75:1 | 82 | AA |
| `#FFFFFF` | `#2A2B22` | 14.31:1 | -104 | AAA |
| `#826E2B` | `#FFFDF5` | 4.89:1 | 73.1 | AA |

### Scales

OKLCH ramps generated around each brand color. The brand's exact value is pinned (●) at its nearest step, so tints and shades stay in family.

|  | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | #f7f7f6 | #ededea | #d9dad4 | #bfc0b7 | #a5a69b | #8f9084 | #78796e | #616259 | #4d4e46 ● | #363731 | #21211d |
| accent | #f0faf5 | #def3e8 | #bde3d2 | #92ceb5 | #63b596 | #3c9d7d | #1d8265 | #00674f ● | #004f3c | #00382a | #002218 |
| accent2 | #faf7ef | #f3ecdc | #e4d8ba | #cebd8f | #b5a064 | #9d8743 | #826e2b ● | #67571a | #4f420f | #372e07 | #221b01 |
| success | #f2faf1 | #e0f3e1 | #c4e6c6 | #9ed3a3 | #75bc81 | #55a767 | #3d8e53 ● | #26713f | #17562e | #0a3d1f | #00250f |
| warning | #faf7ef | #f3ecdc | #e4d8ba | #cebd8f | #b5a064 | #9d8743 | #826e2b ● | #67571a | #4f420f | #372e07 | #221b01 |
| danger | #fff3f3 | #ffe4e2 | #ffcbc8 | #fea9a5 | #ef8681 | #dc6a65 | #bf534e ● | #9b3d38 | #782c27 | #561c18 | #370c09 |

### Gradient

*Derived* from the palette: `#00674F` → `#826E2B`

```css
background: linear-gradient(120deg, #00674f, #826e2b);
```

### Dark theme (*derived*)

The site ships one theme. This counterpart is built from the brand's own neutrals; apply with `[data-theme="dark"]`.

| Token | Value |
| --- | --- |
| `--color-background` | `#101007` |
| `--color-surface` | `#191910` |
| `--color-surface-alt` | `#212118` |
| `--color-foreground` | `#F4F2EA` |
| `--color-muted` | `#A9A89F` |
| `--color-subtle` | `#7C7B72` |
| `--color-border` | `#292920` |
| `--color-primary` | `#4C4D46` |
| `--color-primary-foreground` | `#FFFFFF` |
| `--color-link` | `#6A9A89` |

<details><summary>Original CSS variables found on the site</summary>

| Variable | Value |
| --- | --- |
| `--accent` | `#826e2b` |
| `--background` | `#fcfbf7` |
| `--background-subtle` | `#faf9f5` |
| `--border-default` | `#edeade` |
| `--border-strong` | `#e8e4d4` |
| `--border-strongest` | `#dbd5bd` |
| `--border-subtle` | `#efece1` |
| `--focus-ring` | `#826e2b` |
| `--foreground-default` | `#23211a` |
| `--foreground-muted` | `#706e66` |
| `--foreground-subtle` | `#605e52` |
| `--note-accent` | `#006f91` |
| `--secondary-default` | `#f1eee4` |
| `--selection-background` | `#b3d5e6` |
| `--sj-tw-ring-color` | `rgba(59,130,246,.5)` |
| `--sj-tw-ring-offset-color` | `#fff` |
| `--surface-active` | `#f1eee4` |
| `--surface-default` | `#fbfbf8` |
| `--surface-hover` | `#f4f2eb` |
| `--tw-ring-offset-color` | `#fff` |
| `--warn-accent` | `#805d00` |

</details>

## 4. Typography

Meraki (display serif) for headlines; Söhne (Buch/Kräftig/Halbfett) for body and UI at 15/1.6; eyebrows in 12px Söhne semibold, +0.14em, uppercase.

| Family | CSS name | Roles | Weights | Source | Open alternative |
| --- | --- | --- | --- | --- | --- |
| **Söhne** | `Sohne Buch` | body, ui | 300 400 500 600 700 | self-hosted | Inter Tight, Geist |
| **Meraki** | `Meraki` | display, heading | 400 | self-hosted | — |

> Proprietary faces are captured to `captured/fonts/` **for reference and local rendering only**. License them from the foundry before shipping; until then use the open alternative, which the token stacks already include as the first fallback.

### Scale

| Style | Family | Size | Weight | Line height | Tracking | Case | Sample |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | Meraki | 82px | 400 | 1 | -0.037em | — | “Blog” |
| `h1` | Meraki | 52px | 400 | 1.1 | -0.058em | — | “From people who useLittlebird every day” |
| `h2` | Meraki | 40px | 400 | 1.12 | -0.020em | — | “How to talk about Littlebird” |
| `h3` | Meraki | 30px | 400 | 1.2 | 0.000em | — | “$100/mo” |
| `h4` | Meraki | 17px | 500 | 1.3 | -0.005em | — |  |
| `body-lg` | Söhne | 22px | 400 | 1.5 | 0.000em | — | “Littlebird is an AI assistant that already knows” |
| `body` | Söhne | 15px | 400 | 1.6 | 0.000em | — | “Littlebird is a personal AI assistant that alrea” |
| `body-sm` | Söhne | 12px | 400 | 1.5 | 0.000em | — | “1. Zero data retention agreements with every LLM” |
| `label` | Söhne | 15px | 600 | 1.333 | 0.000em | — | “Download headshot” |
| `caption` | Söhne | 11px | 400 | 1.4 | 0.010em | — |  |
| `eyebrow` | Söhne | 12px | 600 | 1.667 | 0.140em | uppercase | “For creators & partners” |
| `code` | ui-monospace | 12px | 400 | 1.6 | 0.000em | — |  |

Base **14px**; measured ratio ≈ **1.08** (Minor Second). Sizes in use: 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 24, 26, 28, 30, 32, 40, 44, 48, 50, 52, 56, 58, 64, 68, 72, 82. Body measure ≈ 39 characters.

```css
.display { font: 400 82px/1 var(--font-display); letter-spacing: -0.0366em; }
.body { font: 400 15px/1.6 var(--font-body); }
```

## 5. Layout & spacing

Centered hero, then alternating text/visual rows on a 1000px measure — airy, with long vertical breaks between sections.

|  |  |
| --- | --- |
| Content max-width | 1000px |
| Other containers | 1000px, 820px, 720px, 1100px, 1200px |
| Grid columns in use | 2, 3, 4 |
| Gutter | 16px |
| Breakpoints | 353px · 441px · 480px · 577px · 768px · 992px |
| Spacing unit | 4px |
| Spacing scale | 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64 |
| Section padding | 40px, 64px, 80px, 96px, 104px, 120px |
| Density | airy |
| Alignment | mixed |

## 6. Shape & depth

Soft and rounded: pill buttons, 12–20px cards and windows.

Shape language: **mixed**.

| Radius | Value | Uses |
| --- | --- | --- |
| xs | `6px` | 61 |
| sm | `8px` | 21 |
| md | `10px` | 19 |
| lg | `12px` | 50 |
| xl | `14px` | 10 |
| 2xl | `16px` | 20 |
| 3xl | `20px` | 13 |

**Elevation**

| Level | box-shadow |
| --- | --- |
| xs | `rgba(0, 0, 0, 0.2) 0px 1px 1px 0px inset` |
| sm | `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(27, 28, 21, 0.06) 0px 2px 6px 0px` |
| md | `rgba(27, 28, 21, 0.12) 0px 8px 30px 0px` |
| lg | `rgba(27, 28, 21, 0.18) 0px 24px 60px 0px` |

**Borders**

| Width | Style | Color | Uses |
| --- | --- | --- | --- |
| 1px | solid | `#E4E4E3` | 32 |
| 1px | solid | `#E6E6E6` | 13 |
| 1px | solid | `#A6CAC1` | 13 |
| 1px | solid | `#EDEDEC` | 9 |
| 1px | solid | `#EBEBEB` | 7 |
| 1px | solid | `#EFECE1` | 7 |

## 7. Motion

Gentle and ambient: soft fades and short CSS transitions (150–300ms), with product UI videos showing the assistant at work. Nothing bounces or flashes.

Intensity: **subtle**.

- **Like breathing** — Slow, soft fades; motion never competes with reading.
- **Show the assistant working** — Product videos of real recall and drafting are the main motion.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 100ms | Hover, press, color changes |
| `--duration-base` | 200ms | Small movement, dropdowns, toggles |
| `--duration-slow` | 500ms | Reveals, page-level transitions |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default for on-screen movement |
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elements arriving |
| `--ease-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements leaving (*derived*) |
| `--ease-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebratory / attention moments |

**Curves measured on the site**

| Curve | Character | Uses |
| --- | --- | --- |
| `ease` | ease — Browser default; gentle and generic. | 261 |
| `linear` | linear — Mechanical, constant velocity — loops, marquees, progress. | 2 |

**Durations measured:** 200ms (94), 180ms (50), 500ms (40), 150ms (31), 300ms (20), 400ms (19), 100ms (4), 550ms (3)

**Scroll & ambient motion:** Infinite marquee.

**Keyframes in use**

| Name | What it does | Uses |
| --- | --- | --- |
| `mkRowIn` | fade | 3 |
| `nightpriv-reveal` | clip reveal | 1 |
| `sp-marquee-scroll` | move | 1 |
| `mkSlideIn` | fade + move | 1 |

**Signature motion.** Calm product demos of Littlebird answering 'What did Sarah need from me?' in place.

**Rendered motion assets** (`motion/`):

- `logo-reveal` — Logo reveal (16:9): Glyph-by-glyph rise on the brand's entrance curve (cubic-bezier(0.16, 1, 0.3, 1)), 25ms stagger.
- `logo-reveal-square` — Logo reveal (1:1): Glyph-by-glyph rise on the brand's entrance curve (cubic-bezier(0.16, 1, 0.3, 1)), 25ms stagger.
- `gradient-loop` — Living gradient (seamless loop): The brand's chromatic palette flowing through domain-warped noise. Loops perfectly every 6s.
- `type-reveal` — Kinetic headline: Word-by-word reveal with blur-to-sharp focus — for launch videos, ads and social cuts.
- `loader` — Loader (transparent): Mark breathing on the brand's standard curve; 1.6s loop. Transparent WebM for apps; GIF fallback.
- `transition-wipe` — Transition wipe: Three brand-color panels sweep across — a cut between scenes in product videos.
- `end-card` — End card: Logo, call to action and URL — the closing frame for every video.

Always honor `prefers-reduced-motion` (see `motion/motion.css`).

## 8. Components

Exact computed styles captured from the live site. Hover states were measured by actually hovering.

### Button — primary

Seen as “Try it now” (5×)

```css
.btn-primary {
  background: rgb(27, 28, 20);
  color: rgb(255, 255, 255);
  font: 400 14px/20px "Soehne Halbfett";
  padding: 8px 16px 8px 16px;
  border-radius: 99px;
  height: 36px;
  transition: color 0.2s, background-color 0.2s, filter 0.2s;
}
```

### Button — ghost

Seen as “Toggle Start here” (5×)

```css
.btn-ghost {
  color: rgb(112, 110, 102);
  font: 400 13.3333px/undefined Sohne;
  letter-spacing: 0.32px;
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  height: 30px;
}
```

### Button — primary-2

Seen as “Get started” (4×)

```css
.btn-primary-2 {
  background: rgb(27, 28, 21);
  color: rgb(255, 255, 255);
  font: 400 14px/20px "Sohne Buch";
  padding: 12px 32px 12px 32px;
  border: 1px solid rgb(0, 0, 0);
  border-radius: 99px;
  height: 55px;
}
```

### Button — secondary

Seen as “Apps” (3×)

```css
.btn-secondary {
  background: rgb(255, 253, 245);
  color: rgba(27, 28, 21, 0.6);
  font: 600 13px/20px "Sohne Buch";
  padding: 8px 16px 8px 16px;
  border: 1px solid rgba(27, 28, 21, 0.14);
  border-radius: 999px;
  height: 38px;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}
```

### Button — secondary-2

Seen as “iOS” (2×)

```css
.btn-secondary-2 {
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 238);
  font: 400 14px/20px "Sohne Buch";
  padding: 10px 18px 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  height: 40px;
}
```

### Card — outlined


```css
.card {
  background: rgb(255, 255, 255);
  color: rgb(27, 28, 20);
  font: 400 14px/20px "Sohne Buch";
  padding: 20px 20px 20px 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  height: 174px;
}
```

### Badge

```css
.badge {
  background: rgba(255, 255, 255, 0);
  color: rgba(0, 0, 0, 0.4);
  font: 400 14px/20px "Sohne Buch";
  padding: 0px 0px 0px 0px;
  border-radius: 7px;
  height: 20px;
}
```

### Navigation


Items: Features · Use Cases · For Teams · Privacy · Pricing · Company · Resources · Try it now

## 9. Iconography

Thin (≈1.8px) stroked line icons, rounded, in ink.

|  |  |
| --- | --- |
| Style | stroke |
| Stroke width | 1.8px |
| Grid | 24×24 |
| Line caps / joins | round / round |
| Corners | rounded |
| Library | custom / unknown |
| Captured | 9 icons in `captured/icons/` |

**Drawing a new icon:** 24px grid, 1.8px stroke, round caps, round joins, no fills, color `currentColor`. Keep ≥ 2px between parallel strokes and align to whole pixels.

## 10. Imagery & media

Painterly landscapes, skies and birds (illustration, not photography); real product UI in soft-shadowed windows; real user portraits beside testimonials.

Mix on site: 1 photos · 24 illustrations · 27 product screenshots · 10 other.

| Media |  |
| --- | --- |
| Videos | 2 (2 downloaded to `captured/videos/`) |
| Scroll recording | `captured/recordings/home-scroll.mp4` |

**Customer logos shown:** 16 captured to `captured/customer-logos/` — Tasks card: Finish onboarding flow, Meeting reminder card: quarterly review starting in 30 minutes, NVIDIA, Stanford University, Netflix, Siemens, Yale University, MIT, Rippling, Conde Nast, Ford, Zendesk, New York University, Snowflake, DHL, Vogue.

## 11. Logo

Primary: `captured/svgs/69417ad6a3dc4c17a9b50370-logo-c5cef1.svg` (wordmark, svg, from the header; confidence signals: home link, named logo, matches brand name, in header, links home, top of page).

Mark: split automatically from the lockup.

Files in `logo/`: SVG (original, black, white, ink), PNG at 512/1024/2048, favicon set, app icons, and lockups on light/dark/brand/gradient.

- **Clear space:** The height of the bird mark on all sides.
- **Minimum size:** 16px for the bird; 18px tall for the wordmark.
- **On color:** use the white version on `#2A2B22` and on the primary; the ink version on light surfaces.

**Never:**
- Recolor beyond ink, white, eggshell or off-black (per the press kit)
- Separate or rotate the bird
- Place on busy imagery without contrast

Official brand-kit files were found and downloaded to `captured/brand-kit/` (9). Prefer them over extracted SVGs.

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
- `wordmark-wall` — The name "Littlebird" set in the display face as an all-over texture. Event backdrops, merch, social covers. *(derived)*

## 13. Do / Don't

**Do**

- ✓ Use eggshell backgrounds and ink pill CTAs.
- ✓ Set headlines in the soft serif, never bold.
- ✓ Frame the product with calm, painted nature imagery.
- ✓ State privacy facts plainly.

**Don't** — the generic-AI tells this brand never shows:

- ✗ Don't use neon, gradients or glowing AI orbs.
- ✗ Don't use color for primary CTAs.
- ✗ Don't use robots, sparkles or brain imagery for 'AI'.
- ✗ Don't default to Inter. The brand's type is part of its identity — use the brand faces (or their listed alternatives).
- ✗ No purple-to-blue "AI gradient". It isn't in this palette.
- ✗ No mesh-gradient blobs or aurora backgrounds behind content.
- ✗ No glassmorphism, frosted cards or glowing borders unless the component spec below shows them.
- ✗ Avoid generic SaaS verbs the brand never uses: "unlock", "empower", "revolutionize", "supercharge", "seamless", "cutting-edge", "game-changer", "next-level".
- ✗ Don't use large rounded corners (16–24px "bubbly" cards). The brand is mixed.
- ✗ Don't center everything. Follow the measured alignment and grid.
- ✗ Don't mix icon styles. Icons here are stroke at 1.8px stroke.
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
      className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-[length:var(--text-label-size)] font-medium text-primary-foreground transition-colors duration-[100ms] ease-standard hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}
```

**Using this file with an agent.** Add one line to your `CLAUDE.md` / `AGENTS.md` / `.cursorrules`:

```md
All UI, copy and assets must follow brand/WATERCOLOR.md. Use tokens from brand/tokens/. Never invent colors, fonts, radii or easing.
```

## 15. Provenance

- Source: [home](https://littlebird.ai/) · [brand](https://littlebird.ai/media-kit) · [about](https://littlebird.ai/about-us) · [pricing](https://littlebird.ai/pricing) · [blog](https://littlebird.ai/blog) · [docs](https://docs.littlebird.ai/docs/)
- Captured 2026-10-10 05:50 UTC with watercolor 0.1.0; mode **extract**.
- Stack detected: Webflow.
- Strategy layer: authored (strategy.json)
- Notes:
  - "Söhne" looks proprietary — captured files are for reference only. Open alternatives: Inter Tight, Geist.

<sub>Logos, fonts and imagery belong to their owners. Captured files are for internal reference; respect trademarks and font licenses.</sub>

