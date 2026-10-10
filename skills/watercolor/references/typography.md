# Typography

## Reading measured type

`typography.families` (usage-weighted by rendered characters) and `typography.styles` (the real size/weight/line-height/tracking combinations in use) are the evidence. Look for:

- **The display decision**: which face and weight sets the largest text? Light (300) at huge sizes reads as quiet confidence (Stripe, Apple); heavy (700+) as assertive (Figma, Nike); a serif display (Notion's accents, editorial brands) as considered/literary.
- **Tracking**: negative tracking on display (-0.01 to -0.04em) is a hallmark of refined systems; positive tracking on small caps/eyebrows. Record the exact values — they're the difference between "on brand" and "close".
- **Line-height**: display 1.0–1.15, body 1.4–1.7. Tight display leading + generous body leading = editorial polish.
- **Case**: sentence vs title vs lowercase headings (voice stats measure this).
- **OpenType features** in use (`tnum`, `ss01`, `cv11`) — often brand signatures (Stripe tabular numbers, Inter alternates).
- **Measure**: body line length; 55–75 characters is the comfortable range.

## Proprietary faces

Many brands use licensed faces (Söhne, GT America, Circular, Graphik, Aeonik, ABC Diatype, Tiempos). watercolor captures the font files for **local rendering and reference only** and lists open alternatives. In docs, state the license need plainly. In `reimagine`, prefer open fonts (Google Fonts, Fontshare) unless the user has licenses.

## Scale

Report the measured ratio and the base. A healthy marketing scale has ~6–9 steps. When extending, generate new sizes on the same ratio — never arbitrary values.

## Pairing (for evolve / reimagine)

- One family with a wide weight range beats two mediocre families.
- Pair on **contrast with a shared skeleton**: a geometric sans with a mono of similar width; a grotesk with a transitional serif for accents.
- Display faces need tight spacing at size; text faces need open spacing at size. Use optical sizes when available (Inter Display, SF Pro Display, Söhne Breit for headlines…).
- Category defaults to *avoid* defaulting to: Inter (every SaaS), Poppins (every startup 2019), Montserrat (every template), Playfair (every "elegant" brand).
- Strong open options by register:
  - Technical / precise: Geist, Inter Tight, IBM Plex Sans, JetBrains Mono, Commit Mono
  - Warm / human: Figtree, Onest, Plus Jakarta Sans, DM Sans
  - Editorial / considered: Newsreader, Fraunces, Instrument Serif, Source Serif 4
  - Expressive / display: Bricolage Grotesque, Unbounded, Space Grotesk, Syne, Clash Display (Fontshare)

## Rules worth writing

Good typography rules are measurable: "Display is Söhne 300 at 48–72px, −0.02em, line-height 1.05–1.15; never bold." "Eyebrows are 12px, 600, +0.08em, uppercase, primary color." "Numbers in tables use tabular figures."
