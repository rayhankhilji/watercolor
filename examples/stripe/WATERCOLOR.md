---
watercolor: 1
brand: "Stripe"
url: https://stripe.com/gb
generated: 2026-10-10
mode: extract
scheme: light
colors:
  background: "#ffffff"
  foreground: "#061b31"
  primary: "#533afd"
  accent: ["#8087ff", "#f848f5", "#f3296b"]
fonts:
  display: "Söhne"
  body: "Söhne"
  mono: "Source Code Pro"
radius: { button: "4px", card: "8px" }
spacing_base: 4
motion: { fast: 120, base: 240, slow: 500, ease: "cubic-bezier(0.215, 0.61, 0.355, 1)" }
---

# Stripe — WATERCOLOR.md

> The single source of truth for designing, writing and building **on-brand for Stripe**. Measured from [stripe.com](https://stripe.com/gb) by [watercolor](https://github.com/rayhankhilji/watercolor), then distilled into rules. When this file and your instincts disagree, **this file wins**.
>
> **For agents:** read §0 before generating anything. Tokens live in `tokens/`; assets are indexed in §12. Values marked *derived* were generated to complete the system; everything else was observed on the live site.

0. [The rules](#0-the-rules) · 1. [Brand essence](#1-brand-essence) · 2. [Voice & copy](#2-voice-copy) · 3. [Color](#3-color) · 4. [Typography](#4-typography) · 5. [Layout & spacing](#5-layout-spacing) · 6. [Shape & depth](#6-shape-depth) · 7. [Motion](#7-motion) · 8. [Components](#8-components) · 9. [Iconography](#9-iconography) · 10. [Imagery & media](#10-imagery-media) · 11. [Logo](#11-logo) · 12. [Asset index](#12-asset-index) · 13. [Do / Don't](#13-do-dont) · 14. [Implementation](#14-implementation) · 15. [Provenance](#15-provenance)

## 0. The rules

1. **Primary is `#533AFD`** (Blurple). Spend it on actions, focus and key accents — it covers only ~5% of the surface. Text on it is `#FFFFFF`.
2. **Ink is `#061B31`, not black.** Never use `#000` for text or UI.
3. **Headlines are sentence case.** Capitalize only the first word and proper nouns.
4. **Display type is Söhne 300** at 48px / 1.15 with -0.020em tracking (tight). Light, not bold — weight never carries hierarchy, size does.
5. **Two-tone headlines.** Set the statement in `#061B31` and the continuation in `#64748D` — same size, same weight. Hierarchy by color, not bold.
6. **Body copy is Söhne 300, 16px / 1.4** in `#50617A`.
7. **Spacing sits on a 4px grid.** Use the scale: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24.
8. **Shape language is subtle.** Buttons use 4px corners; cards 8px. Don't exceed 12px except for pills.
9. **Shadows are tinted** (`rgb(50 50 93)`), never neutral black. Elevation is soft and layered.
10. **Interactions take 120–240ms on `cubic-bezier(0.215, 0.61, 0.355, 1)`.** Reveals 500ms on `cubic-bezier(0.215, 0.61, 0.355, 1)`. Motion intensity: cinematic.
11. **The signature gradient is `#533afd` → `#f848f5` → `#ff6118`.** Use it as a surface or accent stroke, never behind body text.
12. **No exclamation marks.** Confidence is quiet.
13. **No emoji** in product or marketing copy.
14. Set headlines in Söhne 300 with −0.02em tracking and split long headlines into ink + slate halves.
15. Show real product UI on light cards backlit by the gradient.
16. Use the blue-tinted two-layer shadow for elevation.
17. Back every claim with a figure from the proof set (uptime, currencies, volume, Fortune 100).

## 1. Brand essence

**Stripe** — Programmable financial infrastructure — payments, billing and money movement — for businesses from first transaction to billionth.

|  |  |
| --- | --- |
| Category | Financial infrastructure (fintech + developer platform) |
| Model | B2B · hybrid |
| Primary audience | Developers and product teams building revenue into internet businesses |
| Buyer | CFOs, heads of payments and product leaders at startups, platforms and enterprises |
| User | Engineers integrating the API; finance and ops teams living in the Dashboard |
| Stage | Global category leader (5M+ businesses, 50% of the Fortune 100) |
| Competitive set | Adyen, PayPal / Braintree, Checkout.com, Square |
| Customers shown | A Colored Pair Of Glasses Folded Shut |
| Proof points | 99.999% historical uptime · 100 companies · 160 countries · 150 countries · 70 million users |

**Positioning.** For internet businesses of every size, Stripe is the financial infrastructure that turns revenue into a programmable, global, reliable system — so a company can start on day one and still be running on Stripe at its billionth transaction.

**Promise.** From your first transaction to your billionth.

**Pillars**

- **Infrastructure, not a feature** — Payments, billing, issuing and money movement as one programmable foundation — 'designed to work individually or together'.
- **Proven at planetary scale** — Numbers carry the argument: 99.999% uptime, 135+ currencies, trillions processed, half the Fortune 100.
- **Built for what's next** — Agentic commerce, stablecoins, AI-native startups — Stripe positions itself as the economic layer for new business models.

**What makes it different**

- Developer-first, unified API surface across every money movement
- Breadth: payments, billing, issuing, treasury, tax, stablecoins in one platform
- Proof at scale: 99.999% historical uptime, 135+ currencies, US$1.9tn processed in 2025
- Design and craft as a trust signal — the documentation and website set the standard

### Personality

Stripe reads like an exceptionally well-run institution that still writes like an engineer: calm, exact, ambitious about the scale of the internet economy, and quietly beautiful. It never raises its voice — no exclamation marks, light-weight type, one action color — and lets precision and proof do the persuading.

| We are | We are not |  |
| --- | --- | --- |
| **Precise** | Pedantic | Headlines name exact mechanisms and figures ('135+ currencies', 'two business days'), but sentences still flow. |
| **Ambitious** | Grandiose | Talks about 'the economic infrastructure of the internet' and 'global GDP running on Stripe' — then backs it with numbers. |
| **Calm** | Cold | Light Söhne, generous whitespace and slate text make it composed; the living gradient keeps it warm. |
| **Crafted** | Precious | Every product card is staged with care, shadows are tinted, curves are tuned — craft as evidence of reliability, not decoration. |
| **Builder-minded** | Jargon-heavy | Writes for developers and finance leaders at once: technical nouns, plain verbs. |

|  |  |  |
| --- | --- | --- |
| Formal | `───●───────` | Casual |
| Serious | `───●───────` | Playful |
| Technical | `─────●─────` | Accessible |
| Restrained | `────●──────` | Expressive |
| Classic | `────────●──` | Modern |
| Quiet | `───●───────` | Loud |

**Archetype:** The Architect — builds the systems others build on (echoed by the engraved archway on the About page).

## 2. Voice & copy

Declarative, specific and unhurried. Stripe states what it does in one confident sentence, then extends the thought in a second clause or sentence that adds the mechanism or the scale. It speaks to businesses ('your revenue', 'your business') in sentence case, uses numerals for everything, and never uses exclamation marks or emoji.

**Lead with the outcome, extend with the mechanism.** The signature two-part headline: a short claim, then a longer clarifying clause.
  - ✓ Financial infrastructure to grow your revenue. Accept payments, offer financial services and implement custom revenue models.
  - ✗ Supercharge your revenue with seamless payments!
**Prove it with a number.** Scale is shown, not asserted — currencies, uptime, share of the Fortune 100.
  - ✓ 50% of Fortune 100 companies have used Stripe to grow their businesses.
  - ✗ Trusted by the world's biggest brands.
**Name the real thing.** Product nouns over abstractions: billing model, card issuing programme, stablecoins, embedded payments.
  - ✓ Create a card issuing programme.
  - ✗ Unlock new possibilities for your money.
**Quiet confidence.** No hype verbs, no exclamation marks, periods on statements. Enthusiasm lives in scope, not punctuation.
  - ✓ The backbone of global commerce
  - ✗ The #1 game-changing payments platform 🚀

### Mechanics (measured)

|  |  |
| --- | --- |
| Heading case | sentence |
| Average headline length | 6.4 words |
| Average sentence length | 17.3 words |
| Reading grade (Flesch-Kincaid) | 11.6 |
| Addresses the reader (you/your) | 1.7 per 100 words |
| Speaks as we/our | 2.2 per 100 words |
| Exclamation marks | never |
| Emoji | never |
| Periods on headlines | 26% of headlines |
| Em dashes | yes |
| Oxford comma | yes |

- Sentence case for all headings and buttons.
- Headlines may end with a period when they are full sentences; short section labels don't.
- Numerals for all figures, with units and qualifiers ('99.999% historical uptime', 'US$1.9tn').
- En/em dashes for extending clauses ('– from your first transaction to your billionth').
- Oxford comma in lists.
- Spelling follows locale (the UK site uses 'optimise', 'programme').
- CTAs are short imperatives with a chevron: 'Start now ›', 'Contact sales ›'.

### Vocabulary

**Say:** `financial infrastructure` · `revenue` · `businesses` · `platforms` · `billing model` · `money movement` · `global` · `integrate` · `embedded` · `stablecoins` · `agentic commerce` · `from first transaction to billionth`

**Don't say:** ~~unlock~~ · ~~supercharge~~ · ~~seamless~~ · ~~revolutionize~~ · ~~game-changer~~ · ~~cutting-edge~~ · ~~all-in-one~~ · ~~magic~~

### The brand in its own words

**Headlines**

> Financial infrastructure to grow your revenue. Accept payments, offer financial services and implement custom revenue models – from your first transaction to your billionth.
> Flexible solutions for every business model.
> The backbone of global commerce
> Powering businesses of all sizes.
> Reliable, extensible infrastructure for every stack.
> What's happening
> Payments
> Revenue
> Money management
> Platforms and marketplaces

**Calls to action:** `Start now` · `Contact sales` · `Get started` · `Previous slide` · `Next slide` · `Read the letter` · `Learn more` · `Sign up with Google` · `Watch now` · `Pre-dawn. Choose a time of day`

**Recurring terms:** stripe, payments, financial, revenue, businesses, products, payment, global, business, infrastructure, growth, accept, customers, cards, fraud, financial services

### Rewrites

| Context | On brand ✓ | Off brand ✗ |
| --- | --- | --- |
| Homepage hero | Revenue infrastructure for the internet. Accept payments, run any billing model and move money in 135+ currencies. | The all-in-one payments platform to supercharge your growth! |
| Feature card | Enable any billing model | Flexible billing made seamless |
| Error message | Your card was declined. Try a different payment method or contact your bank. | Oops! Something went wrong 😕 |
| Launch announcement | Stripe launches new products to bring stablecoins and agentic commerce into the mainstream. | Introducing the future of money ✨ |
| Enterprise CTA section | Transform your enterprise with agile financial infrastructure. | Enterprise-grade solutions for enterprise-grade needs. |
| Social post | URBN consolidated $5 billion in online and in-store revenue onto Stripe. Here's how. | Big brands love Stripe! Find out why 👇 |

### Tagline options

- “From your first transaction to your billionth.”
- “The backbone of global commerce.”
- “Financial infrastructure for the internet.”

## 3. Color

Neutral white and slate surfaces carry the page; ink (#061B31/#0A2540) sets headlines; slate (#425466/#50617A) sets body; blurple (#533AFD) is reserved for action; the gradient (#533AFD → #F848F5 → #FF6118) appears once per section at most as an atmospheric surface.

Scheme: **light**. Primary `#533AFD` is the one color that means "Stripe".

|  | Token | Hex | OKLCH | Name | Use |
| --- | --- | --- | --- | --- | --- |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-background` | `#FFFFFF` | `oklch(100% 0 0)` | White | Page background |
| ![#f6f9fc](https://img.shields.io/badge/-%20%20%20%20%20-f6f9fc?style=flat-square) | `--color-surface` | `#F6F9FC` | `oklch(98.07% 0.0051 247.88)` | Fog | Raised / alternate section background |
| ![#e5edf5](https://img.shields.io/badge/-%20%20%20%20%20-e5edf5?style=flat-square) | `--color-surface-alt` | `#E5EDF5` | `oklch(94.24% 0.0138 247.97)` | Hairline | Second surface tier |
| ![#061b31](https://img.shields.io/badge/-%20%20%20%20%20-061b31?style=flat-square) | `--color-foreground` | `#061B31` | `oklch(21.86% 0.0511 251.69)` | Ink | Primary text & ink |
| ![#50617a](https://img.shields.io/badge/-%20%20%20%20%20-50617a?style=flat-square) | `--color-muted` | `#50617A` | `oklch(48.84% 0.0455 257.92)` | Slate Light | Secondary text |
| ![#64748d](https://img.shields.io/badge/-%20%20%20%20%20-64748d?style=flat-square) | `--color-subtle` | `#64748D` | `oklch(55.52% 0.0435 259.24)` | Cool Gray | Tertiary text, placeholders |
| ![#e5edf5](https://img.shields.io/badge/-%20%20%20%20%20-e5edf5?style=flat-square) | `--color-border` | `#E5EDF5` | `oklch(94.24% 0.0138 247.97)` | Hairline | Hairlines, dividers, input borders |
| ![#533afd](https://img.shields.io/badge/-%20%20%20%20%20-533afd?style=flat-square) | `--color-primary` | `#533AFD` | `oklch(52.11% 0.2679 277.43)` | Blurple | Brand primary — CTAs, focus, key accents |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-primary-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text/icons on primary |
| ![#50617a](https://img.shields.io/badge/-%20%20%20%20%20-50617a?style=flat-square) | `--color-link` | `#50617A` | `oklch(48.84% 0.0455 257.92)` | Slate Light | Inline links |
| ![#8087ff](https://img.shields.io/badge/-%20%20%20%20%20-8087ff?style=flat-square) | `--color-accent` | `#8087FF` | `oklch(67.42% 0.1746 278.1)` | Indigo | Secondary brand color |
| ![#f848f5](https://img.shields.io/badge/-%20%20%20%20%20-f848f5?style=flat-square) | `--color-accent-2` | `#F848F5` | `oklch(71.44% 0.2751 328.73)` | Magenta | Secondary brand color |
| ![#f3296b](https://img.shields.io/badge/-%20%20%20%20%20-f3296b?style=flat-square) | `--color-accent-3` | `#F3296B` | `oklch(63.1% 0.2324 9.19)` | Rose | Secondary brand color |
| ![#fe5a90](https://img.shields.io/badge/-%20%20%20%20%20-fe5a90?style=flat-square) | `--color-accent-4` | `#FE5A90` | `oklch(69.87% 0.2028 3.75)` | Rose | Secondary brand color |
| ![#0d1738](https://img.shields.io/badge/-%20%20%20%20%20-0d1738?style=flat-square) | `--color-inverse-background` | `#0D1738` | `oklch(21.75% 0.0657 267.92)` | Deep Indigo | Inverted sections (footer, dark bands) |
| ![#ffffff](https://img.shields.io/badge/-%20%20%20%20%20-ffffff?style=flat-square) | `--color-inverse-foreground` | `#FFFFFF` | `oklch(100% 0 0)` | White | Text on inverse background |
| ![#009733](https://img.shields.io/badge/-%20%20%20%20%20-009733?style=flat-square) | `--color-success` | `#009733` | `oklch(58.9% 0.177 146.59)` | Green | Positive states |
| ![#ffbb01](https://img.shields.io/badge/-%20%20%20%20%20-ffbb01?style=flat-square) | `--color-warning` | `#FFBB01` | `oklch(83.28% 0.1715 82.03)` | Amber | Caution states |
| ![#f3296b](https://img.shields.io/badge/-%20%20%20%20%20-f3296b?style=flat-square) | `--color-danger` | `#F3296B` | `oklch(63.1% 0.2324 9.19)` | Rose | Errors & destructive |

**Proportion** (share of painted surface on the live site):

- Light surfaces: **49%**
- Ink & text: **29%**
- Primary: **5%**
- Accents: **16%**

### Contrast

| Foreground | on Background | WCAG | APCA Lc | Pass |
| --- | --- | --- | --- | --- |
| `#061B31` | `#FFFFFF` | 17.37:1 | 104.1 | AAA |
| `#50617A` | `#FFFFFF` | 6.3:1 | 81.4 | AA |
| `#64748D` | `#FFFFFF` | 4.75:1 | 72.9 | AA |
| `#061B31` | `#F6F9FC` | 16.44:1 | 100.2 | AAA |
| `#FFFFFF` | `#533AFD` | 6.19:1 | -84.8 | AA |
| `#533AFD` | `#FFFFFF` | 6.19:1 | 79.6 | AA |
| `#FFFFFF` | `#0D1738` | 17.55:1 | -106.5 | AAA |
| `#8087FF` | `#FFFFFF` | 3.08:1 | 57.4 | AA large |
| `#F848F5` | `#FFFFFF` | 2.9:1 | 54 | ✗ decorative only |
| `#F3296B` | `#FFFFFF` | 3.93:1 | 64.8 | AA large |

### Scales

OKLCH ramps generated around each brand color. The brand's exact value is pinned (●) at its nearest step, so tints and shades stay in family.

|  | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | #f5f8fb | #e8eef4 | #d0dae5 | #afc0d0 | #8ea2b7 | #72889f | #596e82 | #425466 ● | #31404e | #212c37 | #121a22 |
| primary | #f0f7ff | #e2ebff | #c7d4ff | #a4b5ff | #818fff | #6768ff | #533afd ● | #4322d3 | #3514a7 | #250a7b | #170054 |
| accent | #f3f7ff | #e6eeff | #d1dbff | #b4c1ff | #96a1ff | #8087ff ● | #686adc | #5250b4 | #3e3a8c | #2a2664 | #181341 |
| accent2 | #ffefff | #ffdcff | #ffb8ff | #ff86ff | #f848f5 ● | #e400e0 | #bf00b9 | #9a0092 | #780070 | #570050 | #390033 |
| accent3 | #fff0f5 | #ffdfe7 | #ffc1cf | #ff96ae | #ff5b88 | #f3296b ● | #d20052 | #ac003c | #86002b | #62001b | #41000c |
| accent4 | #ffeff5 | #ffdce8 | #ffbcd1 | #ff8eb2 | #fe5a90 ● | #eb2d76 | #cb005d | #a70046 | #840033 | #600022 | #400011 |
| success | #f0fcee | #dcf5d9 | #bceab9 | #8fda8f | #5ec565 | #31b046 | #009733 ● | #007921 | #005c16 | #00410d | #002803 |
| warning | #fffae7 | #ffefc7 | #ffda8f | #ffbb01 ● | #dd9d00 | #bb8500 | #996c00 | #785400 | #5b3e00 | #412b00 | #281900 |
| danger | #fff0f5 | #ffdfe7 | #ffc1cf | #ff96ae | #ff5b88 | #f3296b ● | #d20052 | #ac003c | #86002b | #62001b | #41000c |

### Gradient

Measured on site: `#533AFD` → `#F848F5` → `#FF6118`

```css
background: linear-gradient(120deg, #533afd, #f848f5, #ff6118);
```

The live site renders an animated **WebGL** surface (1393×761). Recording: `captured/canvas/canvas-webgl2-wc66.mp4`; shader sources in `captured/shaders/`. A brand-faithful recreation ships as `motion/gradient-loop.*`.

### Dark theme (*derived*)

The site ships one theme. This counterpart is built from the brand's own neutrals; apply with `[data-theme="dark"]`.

| Token | Value |
| --- | --- |
| `--color-background` | `#05101C` |
| `--color-surface` | `#0E1925` |
| `--color-surface-alt` | `#16212D` |
| `--color-foreground` | `#F3F4F5` |
| `--color-muted` | `#A4AAAF` |
| `--color-subtle` | `#757D85` |
| `--color-border` | `#1E2935` |
| `--color-primary` | `#533AFD` |
| `--color-primary-foreground` | `#FFFFFF` |
| `--color-link` | `#8995A7` |

<details><summary>Original CSS variables found on the site</summary>

| Variable | Value |
| --- | --- |
| `--accent-gradient-color-stop-1` | `#bdb4ff` |
| `--accent-gradient-color-stop-2` | `#643afd` |
| `--accent-gradient-color-stop-3` | `#533afd` |
| `--accentColor` | `#635bff` |
| `--annotationColor` | `#8c9eb1` |
| `--backgroundColor` | `#f6f9fc` |
| `--blendBackground` | `#80e9ff` |
| `--blendForeground` | `#7a73ff` |
| `--blendIntersection` | `#0048e5` |
| `--bulletColor` | `#cfd7df` |
| `--buttonColor` | `#635bff` |
| `--buttonDisabledColor` | `#cfd7df` |
| `--buttonHoverColor` | `#0a2540` |
| `--cardBackground` | `#fff` |
| `--cardBorderColor` | `#cbd6e0` |
| `--cardBorderColorSoft` | `#e7ecf1` |
| `--checkboxInputBackground` | `#e7ecf1` |
| `--disclaimerTextColor` | `#707f98` |
| `--footerColor` | `#0a2540` |
| `--footnoteTextColor` | `#4d5b78` |
| `--formFieldDescriptionTextColor` | `#3f4b66` |
| `--gradientColorOne` | `#ff333d` |
| `--gradientColorOneTransparent` | `rgba(255,51,61,0)` |
| `--gradientColorThree` | `#ffcb57` |

</details>

## 4. Typography

Söhne Light (300) at 48–56px with −0.02em tracking and tight 1.03–1.15 leading; weight almost never rises above 400 for headings — size and the two-tone color split carry hierarchy. Body is Söhne Light 16/1.4 in slate. Source Code Pro for code. Tabular, exact numerals in stat rows.

| Family | CSS name | Roles | Weights | Source | Open alternative |
| --- | --- | --- | --- | --- | --- |
| **Söhne** | `sohne-var` | display, body, ui | 300 400 425 450 500 620 700 | self-hosted | Inter Tight, Geist |
| **Source Code Pro** | `SourceCodePro` | mono | 300 400 500 | self-hosted | — |

> Proprietary faces are captured to `captured/fonts/` **for reference and local rendering only**. License them from the foundry before shipping; until then use the open alternative, which the token stacks already include as the first fallback.

### Scale

| Style | Family | Size | Weight | Line height | Tracking | Case | Sample |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | Söhne | 56px | 500 | 1.214 | -0.020em | — | “Pricing built for businesses of all sizes” |
| `h1` | Söhne | 48px | 300 | 1.15 | -0.020em | — | “Accept payments, offer financial services and im” |
| `h2` | Söhne | 36px | 300 | 1.05 | -0.020em | — | “Explore products for payments, risk, revenue, ba” |
| `h3` | Söhne | 26px | 300 | 1.12 | -0.010em | — | “Accept and optimise payments globally – online a” |
| `h4` | Söhne | 16px | 400 | 1.4 | 0.000em | — | “Use a pre-integrated platform.” |
| `body-lg` | Söhne | 20px | 300 | 1.4 | -0.010em | — | “Create an account instantly, or contact us to de” |
| `body` | Söhne | 16px | 300 | 1.4 | 0.000em | — | “Get tailored guidance from Stripe on implementat” |
| `body-sm` | Söhne | 13px | 300 | 1.615 | 0.015em | — | “You get this fee back for won disputes. You don'” |
| `label-sm` | Söhne | 12px | 300 | 1.416 | 0.000em | — | “Nederlands” |
| `caption` | Söhne | 11px | 300 | 1.4 | 0.000em | — | “I'm refreshing my wardrobe. Can you recommend so” |
| `eyebrow` | Söhne | 10px | 300 | 1.6 | 0.030em | uppercase | “Mark Smith Flat 1 12 Upper Street BIRMINGHAM B12” |
| `code` | Source Code Pro | 13px | 400 | 1.6 | 0.000em | — |  |

Base **15px**; measured ratio ≈ **1.117** (Major Second). Sizes in use: 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 32, 36, 38, 40, 48, 56, 63. Body measure ≈ 71 characters.

OpenType features in use: `"ss01"`, `"tnum"`.

```css
.display { font: 500 56px/1.214 var(--font-display); letter-spacing: -0.02em; }
.body { font: 300 16px/1.4 var(--font-body); }
```

## 5. Layout & spacing

Left-aligned editorial layout on a 1080px measure with a 4px spacing grid; large stat rows with light numerals; bento-like product grids where each card is a staged UI moment, not an icon + text.

|  |  |
| --- | --- |
| Content max-width | 1080px |
| Other containers | 1080px, 1266px, 818px, 810px, 1264px |
| Grid columns in use | 2, 4, 3, 12, 5 |
| Gutter | 24px |
| Breakpoints | 600px · 640px · 900px · 940px · 1112px · 1300px |
| Spacing unit | 4px |
| Spacing scale | 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 64 |
| Section padding | 48px, 64px |
| Density | balanced |
| Alignment | left |

## 6. Shape & depth

Subtle: 4–8px radii on UI, pills only for small badges; 1px #E5EDF5 hairlines frame the grid.

Shape language: **subtle**.

| Radius | Value | Uses |
| --- | --- | --- |
| xs | `2px` | 199 |
| sm | `4px` | 221 |
| md | `6px` | 397 |
| lg | `8px` | 82 |
| full | `9999px` | 157 |

**Elevation**

| Level | box-shadow |
| --- | --- |
| xs | `rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px` |
| sm | `rgba(23, 23, 23, 0.06) 0px 3px 6px 0px` |
| md | `rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px 0px inset` |
| lg | `rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px` |
| xl | `rgba(23, 23, 23, 0.08) 0px 15px 35px 0px` |
| 2xl | `rgba(0, 55, 112, 0.1) 0px 15px 40px 0px, rgba(0, 59, 137, 0.04) 0px 5px 20px 0px` |
| 3xl | `rgba(0, 0, 0, 0.1) 0px 20.187px 40.374px -20.187px` |
| 4xl | `rgba(50, 50, 93, 0.25) 0px 30px 45px -30px, rgba(0, 0, 0, 0.1) 0px 18px 36px -18px` |

**Borders**

| Width | Style | Color | Uses |
| --- | --- | --- | --- |
| 1px | solid | `#E5EDF5` | 292 |
| 1px | dashed | `#E7ECF1` | 49 |
| 1px | solid | `#E7ECF1` | 28 |
| 1px | solid | `#E6EBF1` | 19 |
| 1px | solid | `#B9B9F9` | 18 |
| 1px | solid | `#D6D9FC` | 15 |

## 7. Motion

Two speeds. UI motion is fast and decisive — 150ms colour/hover changes and 300ms reveals on easeOutCubic. Ambient motion is cinematic — the hero ribbon and particle globe are real-time WebGL that drifts slower than reading speed, giving the page a living, engineered feel.

Intensity: **cinematic**. Stack: three.js, WebGL shaders.

- **Decisive feedback** — Hover and press states resolve in 150ms on cubic-bezier(0.215, 0.61, 0.355, 1); nothing bounces.
- **Ambient, not attention-seeking** — WebGL surfaces move continuously but slowly; they sit behind or beside content, never compete with the headline.
- **Reveal with intent** — Product cards and stats ease in on scroll (300–600ms) to show the system assembling.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 120ms | Hover, press, color changes |
| `--duration-base` | 240ms | Small movement, dropdowns, toggles |
| `--duration-slow` | 500ms | Reveals, page-level transitions |
| `--ease-standard` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Default for on-screen movement |
| `--ease-entrance` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Elements arriving |
| `--ease-exit` | `cubic-bezier(0.7, 0, 0.84, 0)` | Elements leaving (*derived*) |
| `--ease-emphasis` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Celebratory / attention moments |

**Curves measured on the site**

| Curve | Character | Uses |
| --- | --- | --- |
| `cubic-bezier(0.215, 0.61, 0.355, 1)` | easeOutCubic — Confident deceleration. | 1389 |
| `cubic-bezier(0.25, 1, 0.5, 1)` | cubic-bezier(0.25, 1, 0.5, 1) — Custom curve | 817 |
| `ease` | ease — Browser default; gentle and generic. | 201 |
| `cubic-bezier(0.45, 0.05, 0.55, 0.95)` | ease-in-out — Symmetric and smooth — for on-screen movement. | 88 |
| `cubic-bezier(0.7, 0, 0, 1)` | cubic-bezier(0.7, 0, 0, 1) — Custom ease-in-out — deliberate, cinematic | 84 |
| `linear` | linear — Mechanical, constant velocity — loops, marquees, progress. | 78 |
| `cubic-bezier(0.16, 1, 0.3, 1)` | easeOutQuint — Snappy and premium — very fast start, silky end. | 61 |
| `cubic-bezier(0.165, 0.84, 0.44, 1)` | easeOutQuart — Fast arrival, long graceful settle. | 52 |

**Durations measured:** 150ms (1620), 300ms (830), 240ms (89), 600ms (85), 1000ms (64), 400ms (60), 800ms (52), 120ms (16), 500ms (15), 360ms (10)

**Scroll & ambient motion:** 4 animated canvas surface(s) (WebGL/2D); Infinite marquee.

**Keyframes in use**

| Name | What it does | Uses |
| --- | --- | --- |
| `detect-scroll` | custom | 4 |
| `border-rest` | scale | 3 |
| `book-of-the-week-fade-in` | fade | 2 |

**Signature motion.** The hero's flowing purple–magenta–orange ribbon — a real-time WebGL surface (captured in captured/canvas/ with its shader sources) that turns 'money in motion' into an image.

**Rendered motion assets** (`motion/`):

- `logo-reveal` — Logo reveal (16:9): Glyph-by-glyph rise with scale on the brand's entrance curve (cubic-bezier(0.215, 0.61, 0.355, 1)), 45ms stagger.
- `logo-reveal-square` — Logo reveal (1:1): Glyph-by-glyph rise with scale on the brand's entrance curve (cubic-bezier(0.215, 0.61, 0.355, 1)), 45ms stagger.
- `gradient-loop` — Living gradient (seamless loop): The site's own gradient colors flowing through domain-warped noise. Loops perfectly every 6s.
- `type-reveal` — Kinetic headline: Word-by-word reveal with blur-to-sharp focus — for launch videos, ads and social cuts.
- `loader` — Loader (transparent): Mark breathing on the brand's standard curve; 1.6s loop. Transparent WebM for apps; GIF fallback.
- `transition-wipe` — Transition wipe: Three brand-color panels sweep across — a cut between scenes in product videos.
- `end-card` — End card: Logo, call to action and URL — the closing frame for every video.

Always honor `prefers-reduced-motion` (see `motion/motion.css`).

## 8. Components

Exact computed styles captured from the live site. Hover states were measured by actually hovering.

### Button — primary

Seen as “Get started” (7×)

```css
.btn-primary {
  background: rgb(83, 58, 253);
  color: rgb(255, 255, 255);
  font: 400 16px/16px sohne-var;
  padding: 15.5px 24px 16.5px 24px;
  border-radius: 4px;
  height: 48px;
  transition: background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), color 0.3s cubic-bezier(0.25, 1, 0.5, 1), outline-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), border 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.btn-primary:hover {
  background-color: rgb(64, 50, 200);
}
```

### Button — accent

Seen as “Contact sales” (30×)

```css
.btn-accent {
  background: rgb(99, 91, 255);
  color: rgb(255, 255, 255);
  font: 425 15px/24px sohne-var;
  padding: 3px 12px 6px 16px;
  border-radius: 16.5px;
  height: 33px;
  transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1), color 0.3s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), border 0.3s cubic-bezier(0.25, 1, 0.5, 1), fill 0.3s cubic-bezier(0.25, 1, 0.5, 1), stroke 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
```

### Button — secondary

Seen as “Read the letter” (17×)

```css
.btn-secondary {
  background: rgba(255, 255, 255, 0);
  color: rgb(83, 58, 253);
  font: 400 16px/16px sohne-var;
  padding: 14.5px 24px 15.5px 24px;
  border: 1px solid rgb(185, 185, 249);
  border-radius: 4px;
  height: 48px;
  transition: background-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), color 0.3s cubic-bezier(0.25, 1, 0.5, 1), outline-color 0.3s cubic-bezier(0.25, 1, 0.5, 1), border 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
```

### Button — ghost

Seen as “Products” (12×)

```css
.btn-ghost {
  color: rgb(6, 27, 49);
  font: 400 14px/14px sohne-var;
  padding: 12px 0px 12px 0px;
  border-radius: 4px;
  height: 40px;
  transition: color 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95), background-color 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95), border-color 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95);
}
```

### Button — primary-2

Seen as “Contact sales” (3×)

```css
.btn-primary-2 {
  background: rgb(83, 58, 253);
  color: rgb(255, 255, 255);
  font: 400 14px/14px sohne-var;
  padding: 11.5px 20px 12.5px 20px;
  border-radius: 4px;
  height: 40px;
  transition: color 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95), background-color 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95), border-color 0.24s cubic-bezier(0.45, 0.05, 0.55, 0.95);
}
.btn-primary-2:hover {
  background-color: rgb(64, 50, 200);
}
```

### Input

```css
.input {
  background: rgb(255, 255, 255);
  color: rgb(6, 27, 49);
  font: 300 16px/undefined sohne-var;
  padding: 0px 0px 0px 0px;
  border-radius: 6px;
  height: 46px;
  transition: outline 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
```

### Card — elevated

```css
.card {
  background: rgb(255, 255, 255);
  color: rgb(66, 84, 102);
  font: 300 16px/undefined sohne-var;
  padding: 0px 0px 0px 0px;
  border-radius: 8px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  height: 456px;
}
```

### Badge

```css
.badge {
  background: rgba(21, 190, 83, 0.2);
  color: rgb(16, 140, 61);
  font: 300 10px/undefined sohne-var;
  padding: 1px 6px 1px 6px;
  border: 1px solid rgba(21, 190, 83, 0.4);
  border-radius: 4px;
}
```

### Navigation


Items: Products · Solutions · Developers · Resources · Pricing · Sign in Sign in · Contact sales · Stripe for enterprises

### Footer


## 9. Iconography

Small, quiet line and solid glyphs in slate; icons support labels, never replace them.

|  |  |
| --- | --- |
| Style | fill |
| Stroke width | 0.83px |
| Grid | 16×16 |
| Line caps / joins | round / round |
| Corners | rounded |
| Library | Radix Icons |
| Captured | 161 icons in `captured/icons/` |

**Drawing a new icon:** 16px grid, solid fills, consistent optical weight, color `currentColor`. Keep ≥ 2px between parallel strokes and align to whole pixels.

## 10. Imagery & media

Real product UI first; editorial customer photography (aerial, architectural) for stories; engraved/line-art illustration for institutional pages (About); 3D/WebGL for signature moments (the ribbon, the particle globe).

Mix on site: 46 photos · 18 illustrations · 10 product screenshots · 30 other.

| Media |  |
| --- | --- |
| Animated canvases | 4 recorded to `captured/canvas/` |
| WebGL shaders | 33 GLSL sources in `captured/shaders/` |
| Scroll recording | `captured/recordings/home-scroll.mp4` |

**Customer logos shown:** 6 captured to `captured/customer-logos/` — A Colored Pair Of Glasses Folded Shut.

## 11. Logo

Primary: `captured/logos/header-dec289e495.svg` (wordmark, svg, from the header; confidence signals: named logo, matches brand name, in header, top of page).

Mark: taken from the favicon.

Files in `logo/`: SVG (original, black, white, ink, primary), PNG at 512/1024/2048, favicon set, app icons, and lockups on light/dark/brand/gradient.

- **Clear space:** At least the height of the 's' in the wordmark on all sides.
- **Minimum size:** 16px tall for the wordmark on screen; use the favicon mark below that.
- **On color:** use the white version on `#0D1738` and on the primary; the ink version on light surfaces.

**Never:**
- Recolor it outside ink (#0A2540), white or blurple
- Place it on the gradient without enough contrast
- Add effects, outlines or shadows
- Stretch, rotate or re-typeset it

## 12. Asset index

| Folder | Contents |
| --- | --- |
| `tokens/` | `tokens.json` (W3C DTCG) · `tokens.css` · `tailwind.css` (v4) · `tokens.figma.json` (Tokens Studio) · `tokens.ts` · `tokens.scss` |
| `colors/` | `palette.png` spec sheet · `palette.ase` (Adobe) · `palette.gpl` · `palette.json` |
| `typography/` | `specimen.png` |
| `logo/` | 38 files — SVG/PNG variants, lockups, `favicon/` (ico, svg, png, manifest, head.html), `app-icon/` |
| `patterns/` | watercolor-wash, mesh-gradient, signature-gradient, contours, dot-grid, grid, mark-lattice, orbits, wordmark-wall (SVG + PNG, seamless tiles in `tiles/`) |
| `social/` | og-default, og-announcement, og-article, x-header, linkedin-banner, instagram-post, instagram-story, youtube-thumbnail, quote-card, avatar — PNG + editable HTML in `social/templates/` |
| `motion/` | logo-reveal, logo-reveal-square, gradient-loop, type-reveal, loader, transition-wipe, end-card (MP4 · WebM · GIF · poster) · `motion.css` · `loader.svg` · `easing-curves.svg` · HTML sources |
| `templates/` | email signature · business cards · slide deck (HTML + PDF) · letterhead (PDF) · video-call background |
| `guidelines/` | `index.html` brand book · `brand-book.pdf` |
| `captured/` | Everything taken from the live site: screenshots, logos, fonts, icons, images, videos, GIFs, Lottie, Rive, shaders, canvas recordings, components, scroll recording |

**Patterns**

- `watercolor-wash` — Translucent glazes in the brand's own hues, with wet edges, pooled pigment rims, granulation and cold-press paper. Hero backgrounds, covers, editorial and campaign moments. *(derived)*
- `mesh-gradient` — Soft overlapping color fields with film grain — the brand's gradient as a surface. Use full-bleed behind light type.
- `signature-gradient` — The gradient measured on the live site, with fine grain to prevent banding.
- `contours` — Topographic hairlines in the brand's neutrals with a single accent line. Quiet texture for data, infrastructure and editorial contexts. *(derived)*
- `dot-grid` — Dots on a 24px lattice (6× the 4px spacing unit). Product backgrounds, diagrams, empty states. *(derived)*
- `grid` — Minor lines every 24px, major every 96px — derived from the spacing system. Technical diagrams, docs headers. *(derived)*
- `mark-lattice` — The brand mark repeated on a staggered lattice at low contrast. Packaging, merch, swag, app splash. *(derived)*
- `orbits` — Concentric rings with accent rhythm every fifth ring. Works behind product shots, AI features, announcements. *(derived)*
- `wordmark-wall` — The name "Stripe" set in the display face as an all-over texture. Event backdrops, merch, social covers. *(derived)*

## 13. Do / Don't

**Do**

- ✓ Set headlines in Söhne 300 with −0.02em tracking and split long headlines into ink + slate halves.
- ✓ Show real product UI on light cards backlit by the gradient.
- ✓ Use the blue-tinted two-layer shadow for elevation.
- ✓ Back every claim with a figure from the proof set (uptime, currencies, volume, Fortune 100).

**Don't** — the generic-AI tells this brand never shows:

- ✗ Don't bold headlines or use heavy weights for hierarchy.
- ✗ Don't put body text on the gradient or use the gradient on buttons.
- ✗ Don't use pure black — ink is navy (#061B31 / #0A2540).
- ✗ Don't round cards beyond 8px or turn primary CTAs into pills — current CTAs are 4px.
- ✗ Don't default to Inter. The brand's type is part of its identity — use the brand faces (or their listed alternatives).
- ✗ No glassmorphism, frosted cards or glowing borders unless the component spec below shows them.
- ✗ No ✨ sparkles, 🚀 rockets or emoji bullets.
- ✗ Avoid generic SaaS verbs the brand never uses: "unlock", "empower", "revolutionize", "supercharge", "cutting-edge", "game-changer", "next-level", "elevate".
- ✗ Don't use large rounded corners (16–24px "bubbly" cards). The brand is subtle.
- ✗ Don't center everything. Follow the measured alignment and grid.
- ✗ Don't mix icon styles. Icons here are fill at 0.83px stroke.
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
      className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-[length:var(--text-label-size)] font-medium text-primary-foreground transition-colors duration-[120ms] ease-standard hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}
```

Measured hover on the live primary button: `background-color: rgb(64, 50, 200)`.

**Using this file with an agent.** Add one line to your `CLAUDE.md` / `AGENTS.md` / `.cursorrules`:

```md
All UI, copy and assets must follow brand/WATERCOLOR.md. Use tokens from brand/tokens/. Never invent colors, fonts, radii or easing.
```

## 15. Provenance

- Source: [home](https://stripe.com/gb) · [brand](https://stripe.com/gb/newsroom) · [about](https://stripe.com/gb/about) · [pricing](https://stripe.com/gb/pricing) · [product](https://stripe.com/gb/products) · [customers](https://stripe.com/gb/customers) · [careers](https://stripe.com/gb/careers)
- Captured 2026-10-10 05:48 UTC with watercolor 0.1.0; mode **extract**.
- Stack detected: Next.js, three.js.
- Strategy layer: authored (strategy.json)
- Notes:
  - "Söhne" looks proprietary — captured files are for reference only. Open alternatives: Inter Tight, Geist.

<sub>Logos, fonts and imagery belong to their owners. Captured files are for internal reference; respect trademarks and font licenses.</sub>

