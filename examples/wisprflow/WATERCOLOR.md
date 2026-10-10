---
watercolor: 1
brand: "Wispr Flow"
url: https://wisprflow.ai/
generated: 2026-10-10
mode: extract
scheme: light
colors:
  background: "#ffffeb"
  foreground: "#1a1a1a"
  primary: "#f0d7ff"
  accent: ["#034f46", "#ff6c4c", "#34d399"]
fonts:
  display: "EB Garamond"
  body: "Figtree"
  mono: "ui-monospace"
radius: { button: "8px", card: "12px" }
spacing_base: 8
motion: { fast: 100, base: 200, slow: 500, ease: "cubic-bezier(0.4, 0, 0.2, 1)" }
---

# Wispr Flow — WATERCOLOR.md

> The single source of truth for designing, writing and building **on-brand for Wispr Flow**. Measured from [wisprflow.ai](https://wisprflow.ai/) by [watercolor](https://github.com/rayhankhilji/watercolor), then distilled into rules. When this file and your instincts disagree, **this file wins**.
>
> **For agents:** read §0 before generating anything. Tokens live in `tokens/`; assets are indexed in §12. Values marked *derived* were generated to complete the system; everything else was observed on the live site.

0. [The rules](#0-the-rules) · 1. [Brand essence](#1-brand-essence) · 2. [Voice & copy](#2-voice-copy) · 3. [Color](#3-color) · 4. [Typography](#4-typography) · 5. [Layout & spacing](#5-layout-spacing) · 6. [Shape & depth](#6-shape-depth) · 7. [Motion](#7-motion) · 8. [Components](#8-components) · 9. [Iconography](#9-iconography) · 10. [Imagery & media](#10-imagery-media) · 11. [Logo](#11-logo) · 12. [Asset index](#12-asset-index) · 13. [Do / Don't](#13-do-dont) · 14. [Implementation](#14-implementation) · 15. [Provenance](#15-provenance)

## 0. The rules

1. **Primary is `#F0D7FF`** (Lavender). Spend it on actions, focus and key accents — it covers only ~3% of the surface. Text on it is `#1A1A1A`.
2. **Ink is `#1A1A1A`, not black.** Never use `#000` for text or UI.
3. **Headlines are sentence case.** Capitalize only the first word and proper nouns.
4. **Display type is EB Garamond 400** at 48px / 0.95 with -0.030em tracking (tight). Light, not bold — weight never carries hierarchy, size does.
5. **Body copy is Figtree 600, 15.04px / 1.33** in `#1A1A1A`.
6. **Spacing sits on a 8px grid.** Use the scale: 8 · 10 · 12 · 16 · 24 · 32 · 40 · 48 · 64.
7. **Shape language is mixed.** Buttons use 8px corners; cards 12px. Don't exceed 36px except for pills.
8. **Interactions take 100–200ms on `cubic-bezier(0.4, 0, 0.2, 1)`.** Reveals 500ms on `cubic-bezier(0.22, 1, 0.36, 1)`. Motion intensity: cinematic.
9. **Flat color.** The site uses no meaningful gradients — don't introduce decorative ones.
10. **No exclamation marks.** Confidence is quiet.
11. **No emoji** in product or marketing copy.
12. Pair a roman headline with an italic turn.
13. Use lavender only for the primary action.
14. Show words flowing along curves to express dictation.

## 1. Brand essence

**Wispr Flow** — Voice-to-text AI that turns natural speech into clear, polished writing in every app — 4x faster than typing.

|  |  |
| --- | --- |
| Category | Voice dictation (AI productivity) |
| Model | Prosumer · hybrid |
| Primary audience | Knowledge workers, founders and developers who write all day |
| Buyer | Individuals first; team leads and IT for business plans |
| User | Anyone who types for a living — email, Slack, docs and code prompts |
| Stage | Venture-backed growth (2.5M organic monthly active users) |
| Competitive set | macOS Dictation, Superwhisper, Otter.ai, Dragon |
| Customers shown | Microsoft, Amazon, Notion, Klarna, Groupon, Vercel, Mercury |
| Proof points | 4x faster · 100+ Languages · 90% faster · 2.5 million organic monthly active users · 100+ languages |

**Positioning.** For people who think faster than they type, Wispr Flow is the voice interface that turns natural speech into polished writing in any app — so you can speak at the speed you think.

**Promise.** Don't type, just speak.

**Pillars**

- **4x faster than typing** — 220 wpm spoken versus 45 wpm typed — measured, not promised.
- **Everywhere you write** — Every app, every device, 100+ languages.
- **Sounds like you** — Flow learns your vocabulary and style, and your voice stays private.

**What makes it different**

- Polished writing, not raw transcription — it cleans up as you speak
- Works in every app and on every device
- Personalised to your words and style
- Privacy-forward: 'Your voice stays yours'

### Personality

Wispr Flow feels like a beautifully printed book that talks. A literary serif with expressive italics, cream paper, deep green and a soft lavender button make a high-tech product feel human and a little poetic. It is witty ('You have a way with words. Now, two.'), confident about speed, and protective about privacy.

| We are | We are not |  |
| --- | --- | --- |
| **Eloquent** | Flowery | EB Garamond with italic emphasis ('just speak.', 'than typing') — literary, but headlines stay short. |
| **Witty** | Jokey | Wordplay lands once per section: 'You have a way with words. Now, two.' |
| **Fast** | Frantic | Speed is quantified (4x, 220 wpm) and shown with text flowing along curved paths — fluid, not frenetic. |
| **Human** | Sentimental | Real people's photos and voices; product framed around how you work. |

|  |  |  |
| --- | --- | --- |
| Formal | `──────●────` | Casual |
| Serious | `─────●─────` | Playful |
| Technical | `────────●──` | Accessible |
| Restrained | `──────●────` | Expressive |
| Classic | `────●──────` | Modern |
| Quiet | `────●──────` | Loud |

**Archetype:** The Poet-Engineer — eloquent on the surface, precise underneath.

## 2. Voice & copy

Short, crafted lines with a turn in them. Headlines are imperatives or crisp claims, often with an italic second half; supporting copy is plain and specific about speed, apps and privacy.

**Say it like speech.** Imperatives and contractions — the way you'd say it out loud.
  - ✓ Don't type, just speak.
  - ✗ Leverage AI-powered speech recognition technology.
**Measure the magic.** Speed claims are numbers.
  - ✓ 4x faster than typing
  - ✗ Lightning-fast dictation
**One turn of phrase.** A single, earned bit of wordplay per moment.
  - ✓ You have a way with words. Now, two.
  - ✗ Unleash your inner wordsmith with the power of voice! 🎤
**Privacy, plainly.** Short, possessive promises.
  - ✓ Your voice stays yours.
  - ✗ Industry-leading data protection.

### Mechanics (measured)

|  |  |
| --- | --- |
| Heading case | sentence |
| Average headline length | 4.3 words |
| Average sentence length | 15.2 words |
| Reading grade (Flesch-Kincaid) | 7.9 |
| Addresses the reader (you/your) | 2.3 per 100 words |
| Speaks as we/our | 3 per 100 words |
| Exclamation marks | never |
| Emoji | never |
| Periods on headlines | 37% of headlines |
| Em dashes | yes |
| Oxford comma | yes |

- Sentence case; headlines end with a period when they're statements.
- Italic serif for the emphasized half of a headline.
- Numerals for speed and scale ('4x', '220 wpm', '100+ languages').
- Primary CTA names the platform: 'Get started on macOS'.

### Vocabulary

**Say:** `speak` · `voice` · `words` · `flow` · `every app` · `polished` · `the speed you think` · `dictation` · `notetaker`

**Don't say:** ~~transcription engine~~ · ~~leverage~~ · ~~revolutionize~~ · ~~unleash~~ · ~~seamless~~ · ~~AI-powered~~

### The brand in its own words

**Headlines**

> Don’t type, just speak.
> 4x faster than typing
> Speak at the speed you think, in every app, on every device.
> Built around how you work, not how we think you should.
> Your voice stays yours.
> From the first people to use it.
> Good questions.
> You have a way with words. Now, two.
> Media Kit
> About Wispr

**Calls to action:** `Get started on macOS` · `Dictation` · `Notetaker` · `Get started` · `Download headshot` · `Load more` · `Monthly` · `Annual 20% discount` · `Talk to sales` · `Explore open roles`

**Recurring terms:** flow, wispr, wispr flow, app, time, faster, meeting notes, work, voice, turns speech, clear polished, polished writing, full time, time san, san francisco, type

### Rewrites

| Context | On brand ✓ | Off brand ✗ |
| --- | --- | --- |
| Hero | Don't type, *just speak.* | The AI dictation app that supercharges your productivity |
| Feature | Speak at the speed you think, in every app, on every device. | Cross-platform voice-to-text integration |
| Error | We didn't catch that. Hold Fn and try again. | Speech recognition failed. Error code 0x02. |
| Social | 45 wpm typing. 220 wpm speaking. Same thoughts, 4x sooner. | Type less, do more!!! 🚀 |

### Tagline options

- “Don't type, just speak.”
- “Speak at the speed you think.”
- “The voice interface for writing.”

## 3. Color

Cream dominates; ink for type and the customer band; forest green for proof sections; lavender reserved for CTAs; coral (#FF6C4C) and amber (#FFA946) as small accents in illustrations and tags.

Scheme: **light**. Primary `#F0D7FF` is the one color that means "Wispr Flow".

|  | Token | Hex | OKLCH | Name | Use |
| --- | --- | --- | --- | --- | --- |
| ![#ffffeb](https://img.shields.io/badge/-%20%20%20%20%20-ffffeb?style=flat-square) | `--color-background` | `#FFFFEB` | `oklch(99.47% 0.0261 106.86)` | Paper | Page background |
| ![#e4e4d0](https://img.shields.io/badge/-%20%20%20%20%20-e4e4d0?style=flat-square) | `--color-surface` | `#E4E4D0` | `oklch(91.35% 0.0266 106.92)` | Parchment | Raised / alternate section background |
| ![#f5f4f0](https://img.shields.io/badge/-%20%20%20%20%20-f5f4f0?style=flat-square) | `--color-surface-alt` | `#F5F4F0` | `oklch(96.68% 0.0054 95.1)` | Snow | Second surface tier |
| ![#1a1a1a](https://img.shields.io/badge/-%20%20%20%20%20-1a1a1a?style=flat-square) | `--color-foreground` | `#1A1A1A` | `oklch(21.78% 0 0)` | Ink | Primary text & ink |
| ![#5f5f59](https://img.shields.io/badge/-%20%20%20%20%20-5f5f59?style=flat-square) | `--color-muted` | `#5F5F59` | `oklch(48.36% 0.0094 106.75)` | Warm Graphite | Secondary text |
| ![#8d8d83](https://img.shields.io/badge/-%20%20%20%20%20-8d8d83?style=flat-square) | `--color-subtle` | `#8D8D83` | `oklch(64.04% 0.0146 106.8)` | Warm Gray | Tertiary text, placeholders |
| ![#e4e4d0](https://img.shields.io/badge/-%20%20%20%20%20-e4e4d0?style=flat-square) | `--color-border` | `#E4E4D0` | `oklch(91.35% 0.0266 106.92)` | Parchment | Hairlines, dividers, input borders |
| ![#f0d7ff](https://img.shields.io/badge/-%20%20%20%20%20-f0d7ff?style=flat-square) | `--color-primary` | `#F0D7FF` | `oklch(91.19% 0.0598 312.87)` | Lavender | Brand primary — CTAs, focus, key accents |
| ![#1a1a1a](https://img.shields.io/badge/-%20%20%20%20%20-1a1a1a?style=flat-square) | `--color-primary-foreground` | `#1A1A1A` | `oklch(21.78% 0 0)` | Ink | Text/icons on primary |
| ![#f0d7ff](https://img.shields.io/badge/-%20%20%20%20%20-f0d7ff?style=flat-square) | `--color-link` | `#F0D7FF` | `oklch(91.19% 0.0598 312.87)` | Lavender | Inline links |
| ![#034f46](https://img.shields.io/badge/-%20%20%20%20%20-034f46?style=flat-square) | `--color-accent` | `#034F46` | `oklch(38.42% 0.0677 181.79)` | Forest | Secondary brand color |
| ![#ff6c4c](https://img.shields.io/badge/-%20%20%20%20%20-ff6c4c?style=flat-square) | `--color-accent-2` | `#FF6C4C` | `oklch(70.82% 0.1861 33.85)` | Coral | Secondary brand color |
| ![#34d399](https://img.shields.io/badge/-%20%20%20%20%20-34d399?style=flat-square) | `--color-accent-3` | `#34D399` | `oklch(77.29% 0.1535 163.22)` | Mint | Secondary brand color |
| ![#ffa946](https://img.shields.io/badge/-%20%20%20%20%20-ffa946?style=flat-square) | `--color-accent-4` | `#FFA946` | `oklch(80.28% 0.1499 66.09)` | Amber | Secondary brand color |
| ![#1a1a1a](https://img.shields.io/badge/-%20%20%20%20%20-1a1a1a?style=flat-square) | `--color-inverse-background` | `#1A1A1A` | `oklch(21.78% 0 0)` | Ink | Inverted sections (footer, dark bands) |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-inverse-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text on inverse background |
| ![#34d399](https://img.shields.io/badge/-%20%20%20%20%20-34d399?style=flat-square) | `--color-success` | `#34D399` | `oklch(77.29% 0.1535 163.22)` | Mint | Positive states |
| ![#ffa946](https://img.shields.io/badge/-%20%20%20%20%20-ffa946?style=flat-square) | `--color-warning` | `#FFA946` | `oklch(80.28% 0.1499 66.09)` | Amber | Caution states |
| ![#ff6c4c](https://img.shields.io/badge/-%20%20%20%20%20-ff6c4c?style=flat-square) | `--color-danger` | `#FF6C4C` | `oklch(70.82% 0.1861 33.85)` | Coral | Errors & destructive |

**Proportion** (share of painted surface on the live site):

- Light surfaces: **28%**
- Ink & text: **61%**
- Primary: **3%**
- Accents: **8%**

### Contrast

| Foreground | on Background | WCAG | APCA Lc | Pass |
| --- | --- | --- | --- | --- |
| `#1A1A1A` | `#FFFFEB` | 17.2:1 | 103.4 | AAA |
| `#5F5F59` | `#FFFFEB` | 6.35:1 | 81.1 | AA |
| `#8D8D83` | `#FFFFEB` | 3.31:1 | 60.1 | AA large |
| `#1A1A1A` | `#E4E4D0` | 13.51:1 | 87.6 | AAA |
| `#1A1A1A` | `#F0D7FF` | 13.15:1 | 85.9 | AAA |
| `#F0D7FF` | `#FFFFEB` | 1.31:1 | 15.1 | ✗ decorative only |
| `#FFFFFF` | `#1A1A1A` | 17.4:1 | -106.5 | AAA |
| `#034F46` | `#FFFFEB` | 9.39:1 | 90.7 | AAA |
| `#FF6C4C` | `#FFFFEB` | 2.77:1 | 52.3 | ✗ decorative only |
| `#34D399` | `#FFFFEB` | 1.9:1 | 35.5 | ✗ decorative only |

### Scales

OKLCH ramps generated around each brand color. The brand's exact value is pinned (●) at its nearest step, so tints and shades stay in family.

|  | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | #f7f7f6 | #ededeb | #d9d9d6 | #c1c1bb | #a6a69f | #8e8e87 | #76766f | #5f5f59 ● | #484843 | #32322e | #1e1e1b |
| primary | #fefaff | #f9f0fe | #f0d7ff ● | #d4bce1 | #b99bc8 | #a17fb0 | #856592 | #694d74 | #513959 | #39273f | #241627 |
| accent | #f0faf7 | #def2ec | #bee2d8 | #93cdbf | #66b4a3 | #419c8c | #268273 | #0f675c | #034f46 ● | #003831 | #00221e |
| accent2 | #fff1ed | #ffe0d7 | #ffc3b4 | #ff9a82 | #ff6c4c ● | #eb471d | #ca2c00 | #a61600 | #820b00 | #5e0500 | #3e0000 |
| accent3 | #e6f9ee | #c9f2dc | #97e4bf | #34d399 ● | #00bb7e | #00a06d | #00855b | #006b49 | #005438 | #003c27 | #002516 |
| accent4 | #fff4e7 | #ffe6ca | #ffcd99 | #ffa946 ● | #ea8700 | #c87300 | #a55e00 | #834900 | #653700 | #492500 | #2e1400 |
| success | #e6f9ee | #c9f2dc | #97e4bf | #34d399 ● | #00bb7e | #00a06d | #00855b | #006b49 | #005438 | #003c27 | #002516 |
| warning | #fff4e7 | #ffe6ca | #ffcd99 | #ffa946 ● | #ea8700 | #c87300 | #a55e00 | #834900 | #653700 | #492500 | #2e1400 |
| danger | #fff1ed | #ffe0d7 | #ffc3b4 | #ff9a82 | #ff6c4c ● | #eb471d | #ca2c00 | #a61600 | #820b00 | #5e0500 | #3e0000 |

### Gradient

*Derived* from the palette: `#F0D7FF` → `#034F46` → `#FF6C4C` → `#34D399`

```css
background: linear-gradient(120deg, #f0d7ff, #034f46, #ff6c4c, #34d399);
```

### Dark theme (*derived*)

The site ships one theme. This counterpart is built from the brand's own neutrals; apply with `[data-theme="dark"]`.

| Token | Value |
| --- | --- |
| `--color-background` | `#10100B` |
| `--color-surface` | `#191914` |
| `--color-surface-alt` | `#21211C` |
| `--color-foreground` | `#F4F4E1` |
| `--color-muted` | `#A9A99A` |
| `--color-subtle` | `#7C7C70` |
| `--color-border` | `#292924` |
| `--color-primary` | `#F0D7FF` |
| `--color-primary-foreground` | `#0A0A0A` |
| `--color-link` | `#F0D7FF` |

<details><summary>Original CSS variables found on the site</summary>

| Variable | Value |
| --- | --- |
| `--alpha--dark--10` | `#1a1a1a1a` |
| `--alpha--dark--15` | `#1a1a1a26` |
| `--alpha--dark--2` | `#1a1a1a05` |
| `--alpha--dark--30` | `#1a1a1a4d` |
| `--alpha--dark--5-2` | `#1a1a1a0d` |
| `--alpha--dark--5-3` | `#1a1a1a0d` |
| `--alpha--dark--50` | `#1a1a1a80` |
| `--alpha--dark--70` | `#1a1a1ab3` |
| `--alpha--dark--90` | `#1a1a1a` |
| `--alpha--light--10` | `#ffffeb1a` |
| `--alpha--light--15` | `#ffffeb26` |
| `--alpha--light--2` | `#ffffeb05` |
| `--alpha--light--30` | `#ffffeb4d` |
| `--alpha--light--5-2` | `#ffffeb0d` |
| `--alpha--light--5-3` | `#ffffeb0d` |
| `--alpha--light--50` | `#ffffeb80` |
| `--alpha--light--70` | `#ffffebb3` |
| `--alpha--light--90` | `#ffffebe6` |
| `--background-color--background-alternate` | `#fff` |
| `--background-color--background-error` | `#f8e4e4` |
| `--background-color--background-primary` | `#ffffeb` |
| `--background-color--background-secondary` | `#f0d7ff` |
| `--background-color--background-success` | `#cef5ca` |
| `--background-color--background-tertiary` | `#1a1a1a` |

</details>

## 4. Typography

EB Garamond for display (roman + italic contrast within a line); Figtree 500–600 for UI, eyebrows (+0.08em uppercase) and body.

| Family | CSS name | Roles | Weights | Source | Open alternative |
| --- | --- | --- | --- | --- | --- |
| **Figtree** | `Figtree` | body | 400 500 600 700 | self-hosted | — |
| **EB Garamond** | `Eb garamond` | display, heading, body | 400 500 | self-hosted | — |

### Scale

| Style | Family | Size | Weight | Line height | Tracking | Case | Sample |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | EB Garamond | 120px | 400 | 0.85 | -0.030em | — | “You have a way with words. Now,” |
| `h1` | EB Garamond | 48px | 400 | 0.95 | -0.030em | — | “Why Reid Hoffman got 'voicepilled' on the future” |
| `h2` | EB Garamond | 40px | 400 | 1.2 | -0.020em | — | “We’re rethinking how humans interact with techno” |
| `h3` | EB Garamond | 26px | 400 | 0.95 | -0.030em | — | “How Steven Bartlett got 90% faster across every ” |
| `h4` | Figtree | 22px | 600 | 1.3 | 0.000em | — | “Unreasonably ambitious and self-improving” |
| `body-lg` | Figtree | 20px | 400 | 1.3 | 0.000em | — | “We care about designing with incredible attentio” |
| `body` | Figtree | 15.04px | 600 | 1.33 | 0.000em | — | “https://www.linkedin.com/in/john-doe-9b0139134/” |
| `body-sm` | Figtree | 12px | 600 | 1.54 | -0.020em | — | “Can you let the team know the launch is slipping” |
| `label` | Figtree | 13px | 500 | 1.2 | 0.000em | — |  |
| `caption` | Figtree | 11px | 400 | 1.4 | 0.010em | — |  |
| `eyebrow` | Figtree | 14px | 500 | 1.3 | 0.080em | uppercase | “Wispr Flow dictation for Teams” |
| `code` | ui-monospace | 12px | 400 | 1.6 | 0.000em | — |  |

Base **14px**; measured ratio ≈ **1.166** (Minor Third). Sizes in use: 10, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 32, 40, 48, 64, 75, 96, 120. Body measure ≈ 44 characters.

```css
.display { font: 400 120px/0.85 var(--font-display); letter-spacing: -0.03em; }
.body { font: 600 15.04px/1.33 var(--font-body); }
```

## 5. Layout & spacing

Centered hero and section headers on a 1240px measure, full-bleed colored bands with large top radii (stacked cards), airy rhythm.

|  |  |
| --- | --- |
| Content max-width | 1240px |
| Other containers | 1240px, 768px, 480px, 608px, 912px |
| Grid columns in use | 2, 5, 3, 4, 12 |
| Gutter | 16px |
| Breakpoints | 326px · 480px · 768px · 992px · 1200px · 2200px |
| Spacing unit | 8px |
| Spacing scale | 2, 4, 6, 8, 10, 12, 16, 24, 32, 40, 48, 64, 80, 96 |
| Section padding | 80px, 104px, 6016px |
| Density | airy |
| Alignment | centered |

## 6. Shape & depth

Pills for buttons and status; 24–32px radii on stacked full-width sections.

Shape language: **mixed**.

| Radius | Value | Uses |
| --- | --- | --- |
| xs | `4px` | 24 |
| sm | `6px` | 21 |
| md | `8px` | 71 |
| lg | `12px` | 17 |
| xl | `16px` | 20 |
| 2xl | `24px` | 18 |
| 3xl | `32px` | 51 |

**Elevation**

| Level | box-shadow |
| --- | --- |
| xs | `rgb(100, 100, 100) -2px 2px 0px 0px` |
| sm | `rgba(0, 0, 0, 0.3) 1.1px 1.1px 1.1px 0px` |
| md | `rgba(0, 0, 0, 0) 3px 2px 2px 0px` |
| lg | `rgba(0, 0, 0, 0.1) 1px 1px 3px 0px` |
| xl | `rgba(0, 0, 0, 0.4) 3px 2px 2px 0px` |

**Borders**

| Width | Style | Color | Uses |
| --- | --- | --- | --- |
| 2px | solid | `#1A1A1A` | 54 |
| 1px | solid | `#E4E4D0` | 44 |
| 2px | solid | `#E4E4D0` | 14 |
| 2px | solid | `#FFFFFF` | 14 |
| 2px | solid | `#FFFFEB` | 12 |
| 1px | solid | `#FFFFEB` | 7 |

## 7. Motion

Fluid and literal: sentences travel along curved paths across the hero, the listening pill pulses with a waveform, and sections stack with GSAP-driven scroll. Lottie animations illustrate features. UI transitions are 200–350ms.

Intensity: **cinematic**. Stack: GSAP, GSAP ScrollTrigger, WebGL shaders, Lottie.

- **Speech becomes text** — Motion visualises words flowing — continuous, never jittery.
- **Calm stacking** — Sections slide up and stack like cards as you scroll.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 100ms | Hover, press, color changes |
| `--duration-base` | 200ms | Small movement, dropdowns, toggles |
| `--duration-slow` | 500ms | Reveals, page-level transitions |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default for on-screen movement |
| `--ease-entrance` | `cubic-bezier(0.22, 1, 0.36, 1)` | Elements arriving |
| `--ease-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements leaving (*derived*) |
| `--ease-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebratory / attention moments |

**Curves measured on the site**

| Curve | Character | Uses |
| --- | --- | --- |
| `ease` | ease — Browser default; gentle and generic. | 762 |
| `cubic-bezier(0.4, 0, 0.2, 1)` | standard (Material) — Material standard curve — quick start, long settle. | 20 |
| `linear` | linear — Mechanical, constant velocity — loops, marquees, progress. | 14 |
| `ease-in-out` | ease-in-out — Symmetric and smooth — for on-screen movement. | 9 |
| `cubic-bezier(0.22, 1, 0.36, 1)` | easeOutQuint — Snappy and premium — very fast start, silky end. | 2 |

**Durations measured:** 300ms (509), 350ms (102), 200ms (75), 100ms (34), 320ms (30), 250ms (27), 500ms (9), 450ms (3), 180ms (2), 420ms (1)

**Scroll & ambient motion:** Scroll-linked timelines (GSAP ScrollTrigger); Infinite marquee.

**Keyframes in use**

| Name | What it does | Uses |
| --- | --- | --- |
| `logoTicker1` | marquee | 12 |
| `logoTicker` | marquee | 2 |

**Signature motion.** Spoken sentences flowing along curved ribbons through the hero, ending in the waveform listening pill.

**Rendered motion assets** (`motion/`):

- `logo-reveal` — Logo reveal (16:9): Glyph-by-glyph rise with scale on the brand's entrance curve (cubic-bezier(0.22, 1, 0.36, 1)), 45ms stagger.
- `logo-reveal-square` — Logo reveal (1:1): Glyph-by-glyph rise with scale on the brand's entrance curve (cubic-bezier(0.22, 1, 0.36, 1)), 45ms stagger.
- `gradient-loop` — Living gradient (seamless loop): The brand's chromatic palette flowing through domain-warped noise. Loops perfectly every 6s.
- `type-reveal` — Kinetic headline: Word-by-word reveal with blur-to-sharp focus — for launch videos, ads and social cuts.
- `loader` — Loader (transparent): Mark breathing on the brand's standard curve; 1.6s loop. Transparent WebM for apps; GIF fallback.
- `transition-wipe` — Transition wipe: Three brand-color panels sweep across — a cut between scenes in product videos.
- `end-card` — End card: Logo, call to action and URL — the closing frame for every video.

Always honor `prefers-reduced-motion` (see `motion/motion.css`).

## 8. Components

Exact computed styles captured from the live site. Hover states were measured by actually hovering.

### Button — primary

Seen as “Get started on macOS” (18×)

```css
.btn-primary {
  background: rgb(240, 215, 255);
  color: rgb(26, 26, 26);
  font: 600 16px/16px Figtree;
  padding: 16px 24px 16px 24px;
  border: 2px solid rgb(26, 26, 26);
  border-radius: 8px;
  height: 52.3281px;
  transition: transform 0.2s, color 0.3s;
}
```

### Button — ghost

Seen as “Notetaker” (13×)

```css
.btn-ghost {
  background: rgba(255, 253, 249, 0);
  color: rgb(26, 26, 26);
  font: 600 16px/16px Figtree;
  padding: 8px 16px 8px 16px;
  border-radius: 1600px;
  height: 32px;
  transition: color 0.3s;
}
```

### Button — secondary

Seen as “AI Lab (2)” (8×)

```css
.btn-secondary {
  background: rgba(240, 215, 255, 0);
  color: rgb(26, 26, 26);
  font: 600 16px/20.8px Figtree;
  padding: 8px 16px 8px 16px;
  border: 2px solid rgb(26, 26, 26);
  border-radius: 100px;
  box-shadow: rgba(0, 0, 0, 0) 3px 2px 2px 0px;
  height: 40.7969px;
  transition: box-shadow 0.3s, transform 0.3s, background-color 0.3s;
}
```

### Button — primary-2

Seen as “Get started on macOS” (7×)

```css
.btn-primary-2 {
  background: rgb(240, 215, 255);
  color: rgb(26, 26, 26);
  font: 600 16px/16px Figtree;
  padding: 14px 14px 14px 14px;
  border: 2px solid rgb(26, 26, 26);
  border-radius: 8px;
  height: 48.3281px;
  transition: transform 0.2s, color 0.3s;
}
```

### Button — neutral

Seen as “Get started” (6×)

```css
.btn-neutral {
  background: rgb(26, 26, 26);
  color: rgb(255, 255, 235);
  font: 600 16px/16px Figtree;
  padding: 16px 24px 16px 24px;
  border: 2px solid rgb(26, 26, 26);
  border-radius: 8px;
  height: 52px;
  transition: transform 0.2s, color 0.3s;
}
```

### Input

```css
.input {
  background: rgba(255, 255, 255, 0);
  color: rgb(26, 26, 26);
  font: 500 16px/undefined Figtree;
  padding: 0px 32px 12px 32px;
  height: 33px;
}
```

### Card — outlined

```css
.card {
  background: rgb(228, 228, 208);
  color: rgb(26, 26, 26);
  font: 400 16px/20.8px Figtree;
  padding: 8px 32px 8px 8px;
  border: 2px solid rgba(26, 26, 26, 0);
  border-radius: 12px;
  height: 170px;
  transition: border-color 0.25s;
}
```

### Badge


```css
.badge {
  background: rgb(255, 169, 70);
  color: rgb(55, 55, 52);
  font: 700 16px/20.8px Figtree;
  padding: 0px 7.8px 0px 7.8px;
  border: 1px solid rgb(255, 255, 235);
  border-radius: 1600px;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 1px 3px 0px;
  height: 24px;
}
```

### Navigation


Items: Business · Pricing · Lab · Get started on macOS

### Footer


## 9. Iconography

Simple 1.5px icons; the waveform glyph is the recurring motif.

|  |  |
| --- | --- |
| Style | fill |
| Stroke width | 1.5px |
| Grid | 22×22 |
| Line caps / joins | round / round |
| Corners | rounded |
| Library | custom / unknown |
| Captured | 34 icons in `captured/icons/` |

**Drawing a new icon:** 22px grid, solid fills, consistent optical weight, color `currentColor`. Keep ≥ 2px between parallel strokes and align to whole pixels.

## 10. Imagery & media

Warm, motion-blurred lifestyle photography; product UI pills (the waveform 'listening' pill); monochrome customer logos on ink.

Mix on site: 37 photos · 14 illustrations · 2 product screenshots · 20 other.

| Media |  |
| --- | --- |
| Videos | 1 (1 downloaded to `captured/videos/`) |
| Lottie | 3 in `captured/lottie/` |
| WebGL shaders | 2 GLSL sources in `captured/shaders/` |
| Scroll recording | `captured/recordings/home-scroll.mp4` |

**Customer logos shown:** 7 captured to `captured/customer-logos/` — Microsoft, Amazon, Notion, Klarna, Groupon, Vercel, Mercury.

## 11. Logo

Primary: `captured/svgs/6a969571376525e3e58ab7c5-flow-logo-black-22b219.svg` (wordmark, svg, from the header; confidence signals: home link, named logo, in header, links home, top of page).

Mark: split automatically from the lockup.

Files in `logo/`: SVG (original, black, white, ink, primary), PNG at 512/1024/2048, favicon set, app icons, and lockups on light/dark/brand/gradient.

- **Clear space:** The height of the waveform mark on all sides.
- **Minimum size:** 16px for the mark; 20px tall for the wordmark.
- **On color:** use the white version on `#1A1A1A` and on the primary; the ink version on light surfaces.

**Never:**
- Recolor outside ink, cream or white
- Separate the waveform from the wordmark in lockups
- Add effects

Official brand-kit files were found and downloaded to `captured/brand-kit/` (5). Prefer them over extracted SVGs.

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
- `dot-grid` — Dots on a 48px lattice (6× the 8px spacing unit). Product backgrounds, diagrams, empty states. *(derived)*
- `grid` — Minor lines every 48px, major every 192px — derived from the spacing system. Technical diagrams, docs headers. *(derived)*
- `mark-lattice` — The brand mark repeated on a staggered lattice at low contrast. Packaging, merch, swag, app splash. *(derived)*
- `orbits` — Concentric rings with accent rhythm every fifth ring. Works behind product shots, AI features, announcements. *(derived)*
- `wordmark-wall` — The name "Wispr Flow" set in the display face as an all-over texture. Event backdrops, merch, social covers. *(derived)*

## 13. Do / Don't

**Do**

- ✓ Pair a roman headline with an italic turn.
- ✓ Use lavender only for the primary action.
- ✓ Show words flowing along curves to express dictation.

**Don't** — the generic-AI tells this brand never shows:

- ✗ Don't use microphone clip-art or soundwave stock graphics.
- ✗ Don't use a sans-serif for display headlines.
- ✗ Don't use blue or purple gradients for 'AI'.
- ✗ Don't default to Inter. The brand's type is part of its identity — use the brand faces (or their listed alternatives).
- ✗ No purple-to-blue "AI gradient". It isn't in this palette.
- ✗ No mesh-gradient blobs or aurora backgrounds behind content.
- ✗ No glassmorphism, frosted cards or glowing borders unless the component spec below shows them.
- ✗ No ✨ sparkles, 🚀 rockets or emoji bullets.
- ✗ Avoid generic SaaS verbs the brand never uses: "unlock", "empower", "revolutionize", "seamless", "cutting-edge", "game-changer", "next-level", "elevate".
- ✗ Don't use large rounded corners (16–24px "bubbly" cards). The brand is mixed.
- ✗ Don't center everything. Follow the measured alignment and grid.
- ✗ Don't mix icon styles. Icons here are fill at 1.5px stroke.
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
      className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-[length:var(--text-label-size)] font-medium text-primary-foreground transition-colors duration-[100ms] ease-standard hover:bg-primary-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

- Source: [home](https://wisprflow.ai/) · [brand](https://wisprflow.ai/media-kit) · [about](https://wisprflow.ai/about) · [pricing](https://wisprflow.ai/pricing) · [customers](https://wisprflow.ai/case-studies) · [careers](https://wisprflow.ai/careers) · [enterprise](https://wisprflow.ai/business)
- Captured 2026-10-10 05:50 UTC with watercolor 0.1.0; mode **extract**.
- Stack detected: GSAP, Webflow.
- Strategy layer: authored (strategy.json)

<sub>Logos, fonts and imagery belong to their owners. Captured files are for internal reference; respect trademarks and font licenses.</sub>

