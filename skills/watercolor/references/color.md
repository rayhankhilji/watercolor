# Color

## Reading a measured palette

`brand.json → colors.palette` is ranked by *painted usage* (background area, text characters, borders, SVG fills, gradients, logo). That's evidence of **how color is spent**, which matters more than the hexes.

- **Roles before hues.** Background, surface, ink (foreground), muted text, border, primary (action), accent(s), inverse. The extractor proposes roles; verify them against the screenshots.
- **Primary ≠ most common color.** Primary is the chromatic color the brand spends on *actions and identity* (CTA fill, links, logo, focus). It often covers < 5% of the surface. That scarcity is the point — say so.
- **Ink is rarely black.** Most refined brands use a tinted near-black (Stripe `#0A2540`/`#061B31`, Linear `#08090A`). Report the tint and its hue relationship to the primary.
- **Neutrals carry temperature.** Warm grays (paper, Notion) vs. cool blue-grays (Stripe) vs. true neutral (Vercel). Name it.
- **Monochrome is a choice.** If no chromatic color carries meaning, the brand is monochrome; the "primary" is ink. Don't invent a hue.

## Ratios

Typical healthy budgets (light brands): surfaces 70–85%, ink & text 10–20%, primary 2–8%, accents ≤ 5%. Extremes are signature moves: a 30% primary (Mailchimp yellow, Gumroad pink) is loud on purpose. Describe the brand's ratio in `visual.colorUsage` and `visual.colorRatio`.

## Ramps

Ramps are generated in **OKLCH** with the brand's exact value pinned at its nearest step (●). This keeps tints/shades perceptually even and in-family. When you need a hover/pressed color, move **one step** darker (light theme) or lighter (dark theme) on the same ramp — never `filter: brightness()` or a random hex.

## Contrast

Use the contrast table (WCAG 2 ratio + APCA Lc):

- Body text: WCAG ≥ 4.5:1 (APCA |Lc| ≥ 75 for body, ≥ 60 for 16px+).
- Large text (≥ 24px or 19px bold): ≥ 3:1 (|Lc| ≥ 45).
- Primary buttons: label on fill ≥ 4.5:1 ideally; many brands sit at 4.0–4.4 — flag it, don't silently change it in extract mode.
- Muted text is the usual failure. In `evolve`, darken it 1–2 ramp steps.

## Dark themes

A brand's dark theme is not "invert". Use the brand's own darkest tinted neutral for background (not #000 unless the brand is pure black), lift the primary 1–2 steps for legibility, and replace shadows with borders/surface steps. watercolor derives one; review it.

## Gradients

A gradient is a brand asset only if it's **measured** (CSS gradient on site, or a WebGL/canvas surface — check `media.canvases` and `captured/shaders/`). Then document: stops, direction, where it's allowed (hero surface, accent rule, illustration fill) and where it's forbidden (behind body text, on buttons — unless measured). If not measured, the brand is flat; don't add one in extract/extend mode.

## Naming colors

`colorNames` should sound like the brand: technical brands use systematic names ("Ink 900", "Blurple 500"), consumer brands evocative ones ("Cavendish", "Peppercorn"). Avoid generic poetic filler ("Ocean Breeze") unless that's the brand's register.

## Reimagine / evolve palette craft

- Start from **one decision**: the hero hue and how scarce it is.
- Pick neutrals that share the hero's hue at very low chroma (0.005–0.02 in OKLCH) so the whole page feels tuned.
- Accents: 0–2. Each needs a job (data viz, status, a secondary product line).
- Semantic colors (success/warning/danger) are harmonized to the hero's lightness and chroma — not default Tailwind green/amber/red.
- Avoid the slop palette: indigo-600 + purple gradient + slate grays.
