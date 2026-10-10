---
watercolor: 1
brand: "Notion"
url: https://www.notion.com/
generated: 2026-10-10
mode: extract
scheme: light
colors:
  background: "#ffffff"
  foreground: "#000000"
  primary: "#0075de"
  accent: ["#005bab", "#e32d14", "#ffb110"]
fonts:
  display: "Inter"
  body: "Inter"
  mono: "ui-monospace"
radius: { button: "8px", card: "5px" }
spacing_base: 4
motion: { fast: 100, base: 200, slow: 480, ease: "cubic-bezier(0.42, 0, 1, 1)" }
---

# Notion — WATERCOLOR.md

> The single source of truth for designing, writing and building **on-brand for Notion**. Measured from [notion.com](https://www.notion.com/) by [watercolor](https://github.com/rayhankhilji/watercolor), then distilled into rules. When this file and your instincts disagree, **this file wins**.
>
> **For agents:** read §0 before generating anything. Tokens live in `tokens/`; assets are indexed in §12. Values marked *derived* were generated to complete the system; everything else was observed on the live site.

0. [The rules](#0-the-rules) · 1. [Brand essence](#1-brand-essence) · 2. [Voice & copy](#2-voice-copy) · 3. [Color](#3-color) · 4. [Typography](#4-typography) · 5. [Layout & spacing](#5-layout-spacing) · 6. [Shape & depth](#6-shape-depth) · 7. [Motion](#7-motion) · 8. [Components](#8-components) · 9. [Iconography](#9-iconography) · 10. [Imagery & media](#10-imagery-media) · 11. [Logo](#11-logo) · 12. [Asset index](#12-asset-index) · 13. [Do / Don't](#13-do-dont) · 14. [Implementation](#14-implementation) · 15. [Provenance](#15-provenance)

## 0. The rules

1. **Primary is `#0075DE`** (Notion Blue). Spend it on actions, focus and key accents — it covers only ~1% of the surface. Text on it is `#FFFFFF`.
2. **Headlines are sentence case.** Capitalize only the first word and proper nouns.
3. **Display type is Inter 700** at 54px / 1.037 with -0.035em tracking (tight). Heavy and confident.
4. **Body copy is Inter 400, 16px / 1.5** in `#000000`.
5. **Spacing sits on a 4px grid.** Use the scale: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24.
6. **Shape language is rounded.** Buttons use 8px corners; cards 5px. Don't exceed 18px except for pills.
7. **Interactions take 100–200ms on `cubic-bezier(0.42, 0, 1, 1)`.** Reveals 480ms on `cubic-bezier(0.42, 0, 1, 1)`. Motion intensity: subtle.
8. **Flat color.** The site uses no meaningful gradients — don't introduce decorative ones.
9. Set headlines in Inter 700 with −0.035em tracking and tight leading.
10. Show real Notion pages, not abstract illustrations of 'productivity'.
11. Use hand-drawn black-line characters for warmth around the product.
12. Reserve Notion Blue for the primary CTA.

## 1. Brand essence

**Notion** — The AI workspace where teams and agents capture knowledge, find answers and automate busywork — docs, wikis, projects and Custom Agents in one connected system.

|  |  |
| --- | --- |
| Category | AI workspace (productivity) |
| Model | Prosumer · hybrid |
| Primary audience | Teams at ambitious tech companies who want one place for docs, projects and AI |
| Buyer | Founders, heads of operations and IT leaders consolidating tools |
| User | Everyone on the team — PMs, engineers, designers, ops — plus individuals for personal projects |
| Stage | Scaled leader — 100M users in 50+ countries, 50% of YC companies |
| Competitive set | Confluence, Coda, Google Workspace, ClickUp, Microsoft Loop |
| Customers shown | Baseten, Ramp, OpenAI, MatchGroup, Figma, Vercel |
| Proof points | 3 consecutive years · 100M users · 50 countries · 50% of YC companies · 1.4M+ community members |

**Positioning.** For teams drowning in tabs and tools, Notion is the one workspace where knowledge, projects and AI agents live together — so work moves without the duct tape of emails, copy/paste and countless tabs.

**Promise.** One tool to run your company.

**Pillars**

- **Capture knowledge** — One system of record for docs, wikis and projects.
- **Find answers** — AI search across the workspace and connected apps, with citations.
- **Automate busywork** — Custom Agents that keep work moving 24/7.

**What makes it different**

- Flexible building blocks — 'solve your problems your way'
- AI that works where the team's knowledge already lives
- Free-to-start PLG with enterprise depth
- A humane, crafted brand in a utilitarian category

### Personality

Notion is a tool with a sketchbook. The product UI is crisp and black-and-white; around it, hand-drawn characters, a playful pill word and a founder's letter that starts 'Hi there!' make it feel made by people who love tools, history and art. It is confident enough to be simple — big black headlines, few colors — and warm enough to wink.

| We are | We are not |  |
| --- | --- | --- |
| **Simple** | Sparse | Short headlines ('AI where your team works.') and a nearly monochrome palette — but every surface is full of real product. |
| **Playful** | Childish | Hand-drawn people, the rotating 'Jam/Create' pill, a 👈 in the careers copy — personality in small doses. |
| **Thoughtful** | Academic | The about page cites Alan Kay, Doug Engelbart and Ted Nelson; the footer quotes McLuhan in a serif. |
| **Confident** | Corporate | 'One tool to run your company.' — declarative, with proof (100M users, G2 #1) never shouted. |

|  |  |  |
| --- | --- | --- |
| Formal | `───────●───` | Casual |
| Serious | `──────●────` | Playful |
| Technical | `────────●──` | Accessible |
| Restrained | `────●──────` | Expressive |
| Classic | `───────●───` | Modern |
| Quiet | `─────●─────` | Loud |

**Archetype:** The Maker — a craftsperson's workshop where anyone can build their own tools.

## 2. Voice & copy

Plain, short and friendly. Headlines are four-word sentences with periods; body copy is conversational (reading grade ~7) and speaks to the team as 'you' and 'your team'. The brand allows itself a little warmth and history, but product copy stays crisp: verbs + nouns ('Capture knowledge', 'Find answers', 'Automate busywork').

**Say it in four words.** Headlines are short declarative sentences with a period.
  - ✓ AI where your team works.
  - ✗ Revolutionize your team's productivity with cutting-edge AI-powered workflows
**Verb + noun.** Capabilities are named as actions people take.
  - ✓ Automate busywork.
  - ✗ Intelligent automation solutions
**Human first, product second.** Talk about teams, people and their day before features.
  - ✓ Where teams and agents jam together.
  - ✗ Agentic AI platform for enterprise knowledge management
**Proof without pomp.** Numbers appear as quiet facts in small type.
  - ✓ 100M users in over 50 countries
  - ✗ The world's #1 most loved workspace!!!

### Mechanics (measured)

|  |  |
| --- | --- |
| Heading case | sentence |
| Average headline length | 4.1 words |
| Average sentence length | 11.9 words |
| Reading grade (Flesch-Kincaid) | 7.4 |
| Addresses the reader (you/your) | 2.3 per 100 words |
| Speaks as we/our | 2.6 per 100 words |
| Exclamation marks | 4% of sentences |
| Emoji | 0.1 per 100 words |
| Periods on headlines | 31% of headlines |
| Em dashes | yes |
| Oxford comma | yes |

- Sentence case everywhere; headlines often end with a period.
- Em dashes without spaces ('instantly—with citations').
- Arrows (→) on links and secondary CTAs.
- Primary CTA always names the product: 'Get Notion free'.
- Emoji only in personal, founder-voice copy — never in product UI copy.

### Vocabulary

**Say:** `workspace` · `teams` · `agents` · `knowledge` · `system of record` · `busywork` · `answers` · `building blocks` · `together`

**Don't say:** ~~synergy~~ · ~~supercharge~~ · ~~revolutionize~~ · ~~seamless~~ · ~~leverage~~ · ~~enterprise-grade~~

### The brand in its own words

**Headlines**

> Where teams and agents Create together.
> AI where your team works.
> Bring everything into one system of record.
> Get answers, instantly—with citations.
> Keep work moving 24/7 with agents.
> Trusted by teams that ship.
> Get started today.
> About Notion
> A story of tools and the future of work
> Join us

**Calls to action:** `Get Notion free` · `Request a demo` · `Get started` · `OpenAI` · `Figma` · `Ramp` · `Cursor` · `Toyota` · `Clay` · `Vercel`

**Recurring terms:** notion, work, tools, knowledge, knowledge base, teams, workspace, consecutive years, years users, product, base, agents, team, security, consecutive, years

### Rewrites

| Context | On brand ✓ | Off brand ✗ |
| --- | --- | --- |
| Hero | Your wiki, docs and projects. Together. | The all-in-one AI-powered productivity platform for modern teams |
| Feature card | Get answers, instantly—with citations. | Leverage AI-driven insights across your knowledge base |
| Empty state | Nothing here yet. Press / to add a block. | No content available. Please create content to get started. |
| Error | We couldn't sync this page. Check your connection and try again. | Error 500: An unexpected error has occurred. |
| Launch post | Meet Custom Agents. They keep work moving while you sleep. | Introducing our revolutionary new AI agent platform 🚀 |

### Tagline options

- “One tool to run your company.”
- “AI where your team works.”
- “Where teams and agents work together.”

## 3. Color

White and warm off-white (#F6F5F4) dominate; near-black ink (#000 / #1A1A1A) sets type and illustration line; Notion Blue (#0075DE) is the only action color; red #F64932, yellow #FFB110 and blue tints appear as content color, not chrome.

Scheme: **light**. Primary `#0075DE` is the one color that means "Notion".

|  | Token | Hex | OKLCH | Name | Use |
| --- | --- | --- | --- | --- | --- |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-background` | `#FFFFFF` | `oklch(100% 0 0)` | White | Page background |
| ![#f6f5f4](https://img.shields.io/badge/-%20%20%20%20%20-f6f5f4?style=flat-square) | `--color-surface` | `#F6F5F4` | `oklch(97.06% 0.0017 67.8)` | Warm Paper | Raised / alternate section background |
| ![#eeeeee](https://img.shields.io/badge/-%20%20%20%20%20-eeeeee?style=flat-square) | `--color-surface-alt` | `#EEEEEE` | `oklch(94.91% 0 0)` | Paper | Second surface tier |
| ![#000000](https://img.shields.io/badge/-%20%20%20%20%20-000000?style=flat-square) | `--color-foreground` | `#000000` | `oklch(0% 0 0)` | Ink | Primary text & ink |
| ![#1a1a1a](https://img.shields.io/badge/-%20%20%20%20%20-1a1a1a?style=flat-square) | `--color-muted` | `#1A1A1A` | `oklch(21.78% 0 0)` | Graphite | Secondary text |
| ![#696969](https://img.shields.io/badge/-%20%20%20%20%20-696969?style=flat-square) | `--color-subtle` | `#696969` | `oklch(52.08% 0 0)` | Slate | Tertiary text, placeholders |
| ![#e6e6e6](https://img.shields.io/badge/-%20%20%20%20%20-e6e6e6?style=flat-square) | `--color-border` | `#E6E6E6` | `oklch(92.49% 0 0)` | Divider | Hairlines, dividers, input borders |
| ![#0075de](https://img.shields.io/badge/-%20%20%20%20%20-0075de?style=flat-square) | `--color-primary` | `#0075DE` | `oklch(56.79% 0.1824 254.27)` | Notion Blue | Brand primary — CTAs, focus, key accents |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-primary-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text/icons on primary |
| ![#097fe8](https://img.shields.io/badge/-%20%20%20%20%20-097fe8?style=flat-square) | `--color-link` | `#097FE8` | `oklch(59.75% 0.1828 253.3)` | Blue | Inline links |
| ![#005bab](https://img.shields.io/badge/-%20%20%20%20%20-005bab?style=flat-square) | `--color-accent` | `#005BAB` | `oklch(47.27% 0.1474 253.35)` | Deep Blue | Secondary brand color |
| ![#e32d14](https://img.shields.io/badge/-%20%20%20%20%20-e32d14?style=flat-square) | `--color-accent-2` | `#E32D14` | `oklch(59.31% 0.219 31.1)` | Coral | Secondary brand color |
| ![#ffb110](https://img.shields.io/badge/-%20%20%20%20%20-ffb110?style=flat-square) | `--color-accent-3` | `#FFB110` | `oklch(81.45% 0.1684 76.44)` | Marigold | Secondary brand color |
| ![#62aef0](https://img.shields.io/badge/-%20%20%20%20%20-62aef0?style=flat-square) | `--color-accent-4` | `#62AEF0` | `oklch(72.91% 0.1227 246.66)` | Blue | Secondary brand color |
| ![#000000](https://img.shields.io/badge/-%20%20%20%20%20-000000?style=flat-square) | `--color-inverse-background` | `#000000` | `oklch(0% 0 0)` | Ink | Inverted sections (footer, dark bands) |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-inverse-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text on inverse background |
| ![#009638](https://img.shields.io/badge/-%20%20%20%20%20-009638?style=flat-square) | `--color-success` | `#009638` | `oklch(58.67% 0.172 147.51)` | Green | Positive states |
| ![#ffb110](https://img.shields.io/badge/-%20%20%20%20%20-ffb110?style=flat-square) | `--color-warning` | `#FFB110` | `oklch(81.45% 0.1684 76.44)` | Marigold | Caution states |
| ![#f64932](https://img.shields.io/badge/-%20%20%20%20%20-f64932?style=flat-square) | `--color-danger` | `#F64932` | `oklch(65.12% 0.213 30.9)` | Tomato | Errors & destructive |

**Proportion** (share of painted surface on the live site):

- White & warm surfaces: **60%**
- Ink: **36%**
- Notion Blue: **2%**
- Content colors: **2%**

### Contrast

| Foreground | on Background | WCAG | APCA Lc | Pass |
| --- | --- | --- | --- | --- |
| `#000000` | `#FFFFFF` | 21:1 | 106 | AAA |
| `#1A1A1A` | `#FFFFFF` | 17.4:1 | 104.3 | AAA |
| `#696969` | `#FFFFFF` | 5.49:1 | 77.4 | AA |
| `#000000` | `#F6F5F4` | 19.29:1 | 100.2 | AAA |
| `#FFFFFF` | `#0075DE` | 4.57:1 | -76.4 | AA |
| `#0075DE` | `#FFFFFF` | 4.57:1 | 70.9 | AA |
| `#097FE8` | `#FFFFFF` | 4.03:1 | 66.8 | AA large |
| `#FFFFFF` | `#000000` | 21:1 | -107.9 | AAA |
| `#005BAB` | `#FFFFFF` | 6.81:1 | 82.8 | AA |
| `#E32D14` | `#FFFFFF` | 4.51:1 | 69.5 | AA |
| `#FFB110` | `#FFFFFF` | 1.82:1 | 33.6 | ✗ decorative only |

### Scales

OKLCH ramps generated around each brand color. The brand's exact value is pinned (●) at its nearest step, so tints and shades stay in family.

|  | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | #f7f7f7 | #ededed | #d7d7d7 | #bbbbbb | #9d9d9d | #838383 | #696969 ● | #535353 | #3f3f3f | #2c2c2c | #1a1a1a |
| primary | #ecf9ff | #d6f0ff | #b4dfff | #87c6ff | #4da9ff | #228ffd | #0075de ● | #005ab7 | #004390 | #002e68 | #001a45 |
| accent | #edf9ff | #d8f0ff | #b3deff | #84c5ff | #53a8fe | #2c8eed | #1074ce | #005bab ● | #004486 | #012f61 | #001b41 |
| accent2 | #fff1ee | #ffddd6 | #ffbdb1 | #ff8e7c | #fb5c48 | #e32d14 ● | #c50400 | #a20000 | #800000 | #5e0000 | #400000 |
| accent3 | #fff7e5 | #ffeac5 | #ffd38d | #ffb110 ● | #df9400 | #be7e00 | #9c6700 | #7b5000 | #5e3c00 | #432900 | #2a1700 |
| accent4 | #f0faff | #dcf2ff | #bbe1ff | #8fcafd | #62aef0 ● | #3e94dc | #2578bd | #135e9b | #0a4678 | #053056 | #001c39 |
| success | #f0fbee | #dcf5da | #bceabb | #8fd992 | #5ec469 | #30af4b | #009638 ● | #007826 | #005c1a | #004010 | #002705 |
| warning | #fff7e5 | #ffeac5 | #ffd38d | #ffb110 ● | #df9400 | #be7e00 | #9c6700 | #7b5000 | #5e3c00 | #432900 | #2a1700 |
| danger | #fff1ee | #ffe2dc | #ffc8be | #ffa191 | #ff6e59 | #f64932 ● | #d32b0f | #ad1300 | #860500 | #610100 | #3f0000 |

### Gradient

*Derived* from the palette: `#0075DE` → `#005BAB` → `#E32D14` → `#FFB110`

```css
background: linear-gradient(120deg, #0075de, #005bab, #e32d14, #ffb110);
```

### Dark theme (*derived*)

The site ships one theme. This counterpart is built from the brand's own neutrals; apply with `[data-theme="dark"]`.

| Token | Value |
| --- | --- |
| `--color-background` | `#0F0F0F` |
| `--color-surface` | `#181818` |
| `--color-surface-alt` | `#202020` |
| `--color-foreground` | `#F4F4F4` |
| `--color-muted` | `#A9A9A9` |
| `--color-subtle` | `#7B7B7B` |
| `--color-border` | `#282828` |
| `--color-primary` | `#0075DE` |
| `--color-primary-foreground` | `#FFFFFF` |
| `--color-link` | `#097FE8` |

<details><summary>Original CSS variables found on the site</summary>

| Variable | Value |
| --- | --- |
| `--aimn-v2-nav-bg` | `rgba(0, 0, 0, 0)` |
| `--border-color-regular` | `#00000014` |
| `--dev-platform-nav-bg` | `rgba(0, 0, 0, 0)` |
| `--hero-nav-bg` | `rgba(0, 0, 0, 0)` |

</details>

## 4. Typography

Inter (as NotionInter) for everything UI and marketing: 700 for headlines with aggressive negative tracking, 400/500 for body at 16/1.5. Lyon Text serif for quotes. No mono in marketing.

| Family | CSS name | Roles | Weights | Source | Open alternative |
| --- | --- | --- | --- | --- | --- |
| **Inter** | `NotionInter` | display, body | 400 500 600 700 | self-hosted | — |
| **Lyon Text** | `Lyon Text` | body | 400 | self-hosted | Source Serif 4, Literata |

> Proprietary faces are captured to `captured/fonts/` **for reference and local rendering only**. License them from the foundry before shipping; until then use the open alternative, which the token stacks already include as the first fallback.

### Scale

| Style | Family | Size | Weight | Line height | Tracking | Case | Sample |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | Inter | 96px | 600 | 1.042 | -0.048em | — | “Where teams and agents together.” |
| `h1` | Inter | 54px | 700 | 1.037 | -0.035em | — | “A story of tools and the future of work” |
| `h2` | Inter | 42px | 700 | 1.143 | -0.036em | — | “Get pricing help, demos, use-cases, and more.” |
| `h3` | Inter | 22px | 700 | 1.273 | -0.011em | — | “Bring everything into one system of record.” |
| `h4` | Inter | 21px | 600 | 1.3 | -0.005em | — |  |
| `body-lg` | Inter | 20px | 400 | 1.4 | -0.006em | — | “Capture context, find answers, and automate task” |
| `body` | Inter | 16px | 400 | 1.5 | 0.000em | — | “Hi there! If you’re reading this, you’re probabl” |
| `body-sm` | Inter | 14px | 400 | 1.429 | 0.000em | — | “The most ambitious companies run on Notion.” |
| `label` | Inter | 16px | 500 | 1.5 | 0.000em | — | “Explore open roles” |
| `caption` | Inter | 12px | 500 | 1.333 | 0.010em | — | “per seat/month” |
| `eyebrow` | Inter | 12px | 600 | 1.2 | 0.080em | uppercase |  |
| `code` | ui-monospace | 14px | 400 | 1.6 | 0.000em | — |  |

Base **16px**; measured ratio ≈ **1.196** (Minor Third). Sizes in use: 12, 14, 15, 16, 18, 20, 22, 24, 32, 42, 54, 64, 72, 96.

OpenType features in use: `"lnum", "locl" 0`, `"liga", "lnum", "locl" 0`.

```css
.display { font: 600 96px/1.042 var(--font-display); letter-spacing: -0.0479em; }
.body { font: 400 16px/1.5 var(--font-body); }
```

## 5. Layout & spacing

Centered hero, then left-aligned sections on a wide 1380px canvas; bento-style feature cards with a small label, a bold title and a real UI crop; generous gaps.

|  |  |
| --- | --- |
| Content max-width | 1380px |
| Other containers | 800px, 940px, 1380px, 694px, 1184px |
| Grid columns in use | 5, 3, 2, 4, 7 |
| Gutter | 16px |
| Breakpoints | 375px · 600px · 840px · 1080px · 1280px · 1440px |
| Spacing unit | 4px |
| Spacing scale | 1, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 80 |
| Section padding | 96px |
| Density | balanced |
| Alignment | left |

## 6. Shape & depth

Rounded but not bubbly: 5px inputs, 8px buttons, 12px cards; pills for tags and the hero word.

Shape language: **rounded**.

| Radius | Value | Uses |
| --- | --- | --- |
| xs | `5px` | 259 |
| sm | `8px` | 252 |
| md | `12px` | 149 |
| full | `9999px` | 43 |

**Elevation**

| Level | box-shadow |
| --- | --- |
| xs | `rgba(0, 0, 0, 0) 0px 1px 0px 0px` |
| sm | `rgba(0, 0, 0, 0.016) 0px 0.7px 1.462px 0px, rgba(0, 0, 0, 0.03) 0px 3px 9px 0px` |
| md | `rgba(0, 0, 0, 0.01) 0px 0.175px 1.041px 0px, rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px 0px, rgba(0, 0, 0, 0.027) 0px 2.025px 7.847px 0px, rgba(0, 0, 0, 0.04) 0px 4px 18px 0px` |
| lg | `rgba(0, 0, 0, 0.008) 0px 0.667px 3.502px 0px, rgba(0, 0, 0, 0.016) 0px 2.933px 7.252px 0px, rgba(0, 0, 0, 0.02) 0px 7.2px 14.462px 0px, rgba(0, 0, 0, 0.024) 0px 13.867px 28.348px 0px, rgba(0, 0, 0, 0.03) 0px 23.333px 52.123px 0px, rgba(0, 0, 0, 0.04) 0px 36px 89px 0px` |

**Borders**

| Width | Style | Color | Uses |
| --- | --- | --- | --- |
| 1px | solid | `#E6E6E6` | 249 |
| 1px | solid | `#FFFFFF` | 88 |
| 2px | solid | `#F6F5F4` | 39 |
| 2px | solid | `#000000` | 9 |
| 1px | solid | `#FFFFFF` | 6 |
| 1px | solid | `#F7F7F7` | 4 |

## 7. Motion

Motion is subtle and functional: 150–200ms ease transitions on hover and menus, a rotating verb in the hero pill, and product UI that animates like the real app. No WebGL, no scroll-jacking.

Intensity: **subtle**.

- **Feel like the app** — Marketing motion mirrors in-product micro-interactions — quick, ease-out, undramatic.
- **One playful moment** — The hero's rotating verb pill is the only flourish; everything else stays calm.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 100ms | Hover, press, color changes |
| `--duration-base` | 200ms | Small movement, dropdowns, toggles |
| `--duration-slow` | 480ms | Reveals, page-level transitions |
| `--ease-standard` | `cubic-bezier(0.42, 0, 1, 1)` | Default for on-screen movement |
| `--ease-entrance` | `cubic-bezier(0.42, 0, 1, 1)` | Elements arriving |
| `--ease-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements leaving (*derived*) |
| `--ease-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebratory / attention moments |

**Curves measured on the site**

| Curve | Character | Uses |
| --- | --- | --- |
| `cubic-bezier(0.42, 0, 1, 1)` | ease-in — Accelerates out — for exits. | 627 |
| `ease` | ease — Browser default; gentle and generic. | 52 |
| `ease-in-out` | ease-in-out — Symmetric and smooth — for on-screen movement. | 17 |
| `cubic-bezier(0.86, 0, 0.07, 1)` | easeInOutQuint — Very dramatic in-out. | 13 |
| `cubic-bezier(0.645, 0.045, 0.355, 1)` | easeInOutCubic — Cinematic, deliberate transitions. | 12 |
| `ease-out` | ease-out — Soft deceleration — default for entrances. | 12 |
| `linear` | linear — Mechanical, constant velocity — loops, marquees, progress. | 10 |

**Durations measured:** 200ms (641), 150ms (48), 300ms (20), 100ms (17), 250ms (6), 60ms (1)

**Scroll & ambient motion:** Infinite marquee.

**Keyframes in use**

| Name | What it does | Uses |
| --- | --- | --- |
| `globalNavigation-module-scss-module__HWB10a__navShadowScrolled` | box-shadow | 7 |
| `Marquee-module-scss-module__X75v-G__marqueeFrames` | marquee | 3 |

**Signature motion.** The hero pill that cycles verbs — 'Where teams and agents Jam / Create together.'

**Rendered motion assets** (`motion/`):

- `logo-reveal` — Logo reveal (16:9): Glyph-by-glyph rise on the brand's entrance curve (cubic-bezier(0.42, 0, 1, 1)), 25ms stagger.
- `logo-reveal-square` — Logo reveal (1:1): Glyph-by-glyph rise on the brand's entrance curve (cubic-bezier(0.42, 0, 1, 1)), 25ms stagger.
- `gradient-loop` — Living gradient (seamless loop): The brand's chromatic palette flowing through domain-warped noise. Loops perfectly every 6s.
- `type-reveal` — Kinetic headline: Word-by-word reveal with blur-to-sharp focus — for launch videos, ads and social cuts.
- `loader` — Loader (transparent): Mark breathing on the brand's standard curve; 1.6s loop. Transparent WebM for apps; GIF fallback.
- `transition-wipe` — Transition wipe: Three brand-color panels sweep across — a cut between scenes in product videos.
- `end-card` — End card: Logo, call to action and URL — the closing frame for every video.

Always honor `prefers-reduced-motion` (see `motion/motion.css`).

## 8. Components

Exact computed styles captured from the live site. Hover states were measured by actually hovering.

### Button — primary

Seen as “Get Notion free” (9×)

```css
.btn-primary {
  background: rgb(0, 117, 222);
  color: rgb(255, 255, 255);
  font: 500 16px/24px NotionInter;
  padding: 4px 14px 4px 14px;
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 8px;
  height: 36px;
}
.btn-primary:hover {
  background-color: rgb(0, 91, 171);
}
```

### Button — ghost

Seen as “OpenAI” (26×)

```css
.btn-ghost {
  background: rgba(255, 255, 255, 0);
  color: rgba(0, 0, 0, 0.898);
  font: 500 16px/24px NotionInter;
  padding: 6px 8px 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 8px;
  height: 36px;
  transition: background-color 0.2s cubic-bezier(0.42, 0, 1, 1), color 0.2s cubic-bezier(0.42, 0, 1, 1);
}
```

### Button — primary-2

Seen as “Get Notion free” (4×)

```css
.btn-primary-2 {
  background: rgb(0, 117, 222);
  color: rgb(255, 255, 255);
  font: 500 16px/24px NotionInter;
  padding: 6px 15px 6px 15px;
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 8px;
  height: 38px;
  transition: background-color 0.2s cubic-bezier(0.42, 0, 1, 1), color 0.2s cubic-bezier(0.42, 0, 1, 1);
}
```

### Button — primary-3

Seen as “Sign up” (3×)

```css
.btn-primary-3 {
  background: rgb(0, 117, 222);
  color: rgb(255, 255, 255);
  font: 500 14px/20px NotionInter;
  padding: 4px 11px 4px 11px;
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 8px;
  height: 30px;
}
```

### Button — primary-4

Seen as “Explore open roles” (3×)

```css
.btn-primary-4 {
  background: rgb(0, 117, 222);
  color: rgb(255, 255, 255);
  font: 500 16px/24px NotionInter;
  padding: 11px 20px 11px 20px;
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 8px;
  height: 48px;
}
```

### Input

```css
.input {
  color: rgba(0, 0, 0, 0.95);
  font: 400 16px/24px NotionInter;
  padding: 7px 10px 7px 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 5px;
  height: 36px;
}
```

### Card — outlined

```css
.card {
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  font: 400 16px/24px NotionInter;
  padding: 16px 16px 16px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  height: 130px;
  transition: background-color 0.2s cubic-bezier(0.42, 0, 1, 1), border-color 0.2s cubic-bezier(0.42, 0, 1, 1);
}
```

### Badge


```css
.badge {
  background: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
  font: 600 20px/28px NotionInter;
  letter-spacing: -0.125px;
  padding: 0px 0px 0px 0px;
  border-radius: 100%;
  height: 32px;
}
```

### Navigation


Items: Pricing · Request a demo · Log in · Get Notion free · Features · What's New · Notion AI · Download

### Footer


## 9. Iconography

Simple solid glyphs and emoji-like colored page icons inside the product; arrows for navigation.

|  |  |
| --- | --- |
| Style | fill |
| Stroke width | — |
| Grid | 20×20 |
| Line caps / joins | — / — |
| Corners | — |
| Library | custom / unknown |
| Captured | 37 icons in `captured/icons/` |

**Drawing a new icon:** 20px grid, solid fills, consistent optical weight, color `currentColor`. Keep ≥ 2px between parallel strokes and align to whole pixels.

## 10. Imagery & media

Real product UI; black-line hand-drawn characters and doodles; duotone-tinted customer photography in primary-ish hues; logo walls in monochrome.

Mix on site: 30 photos · 35 illustrations · 3 product screenshots · 37 other.

| Media |  |
| --- | --- |
| Videos | 2 (2 downloaded to `captured/videos/`) |
| Scroll recording | `captured/recordings/home-scroll.mp4` |

**Customer logos shown:** 6 captured to `captured/customer-logos/` — Baseten, Ramp, OpenAI, MatchGroup, Figma, Vercel.

## 11. Logo

Primary: `captured/logos/header-9430ae2c21.svg` (mark, svg, from the header; confidence signals: named logo, matches brand name, in header, top of page).

Mark: taken from the captured.

Files in `logo/`: SVG (original, black, white, ink, primary), PNG at 512/1024/2048, favicon set, app icons, and lockups on light/dark/brand/gradient.

- **Clear space:** Half the height of the cube mark on all sides.
- **Minimum size:** 16px for the mark; 20px tall for the lockup.
- **On color:** use the white version on `#000000` and on the primary; the ink version on light surfaces.

**Never:**
- Recolor the cube outside black or white
- Separate the 'N' from the cube
- Add shadows or 3D effects
- Place on busy photography without a solid backing

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
- `wordmark-wall` — The name "Notion" set in the display face as an all-over texture. Event backdrops, merch, social covers. *(derived)*

## 13. Do / Don't

**Do**

- ✓ Set headlines in Inter 700 with −0.035em tracking and tight leading.
- ✓ Show real Notion pages, not abstract illustrations of 'productivity'.
- ✓ Use hand-drawn black-line characters for warmth around the product.
- ✓ Reserve Notion Blue for the primary CTA.

**Don't** — the generic-AI tells this brand never shows:

- ✗ Don't add gradients or glows — Notion is flat.
- ✗ Don't use more than one accent color in chrome; color belongs to content.
- ✗ Don't use the serif for headlines or UI.
- ✗ No purple-to-blue "AI gradient". It isn't in this palette.
- ✗ No mesh-gradient blobs or aurora backgrounds behind content.
- ✗ No glassmorphism, frosted cards or glowing borders unless the component spec below shows them.
- ✗ Avoid generic SaaS verbs the brand never uses: "unlock", "revolutionize", "supercharge", "seamless", "cutting-edge", "game-changer", "next-level", "elevate".
- ✗ Don't center everything. Follow the measured alignment and grid.
- ✗ Don't mix icon styles. Icons here are fill.
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
      className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-[length:var(--text-label-size)] font-medium text-primary-foreground transition-colors duration-[100ms] ease-standard hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}
```

Measured hover on the live primary button: `background-color: rgb(0, 91, 171)`.

**Using this file with an agent.** Add one line to your `CLAUDE.md` / `AGENTS.md` / `.cursorrules`:

```md
All UI, copy and assets must follow brand/WATERCOLOR.md. Use tokens from brand/tokens/. Never invent colors, fonts, radii or easing.
```

## 15. Provenance

- Source: [home](https://www.notion.com/) · [about](https://www.notion.com/about) · [pricing](https://www.notion.com/pricing) · [product](https://www.notion.com/product) · [customers](https://www.notion.com/customers) · [careers](https://www.notion.com/careers) · [enterprise](https://www.notion.com/enterprise)
- Captured 2026-10-10 05:50 UTC with watercolor 0.1.0; mode **extract**.
- Stack detected: Next.js, Tailwind CSS.
- Strategy layer: authored (strategy.json)
- Notes:
  - "Lyon Text" looks proprietary — captured files are for reference only. Open alternatives: Source Serif 4, Literata.

<sub>Logos, fonts and imagery belong to their owners. Captured files are for internal reference; respect trademarks and font licenses.</sub>

