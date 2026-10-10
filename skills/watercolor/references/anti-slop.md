# Anti-slop

"Slop" is the median output of a model asked to "make it look modern": safe, glossy, and identical to ten thousand other sites. Every item here is a tell. **In `extract` mode, never claim the brand does these unless measured. In `extend`/`evolve`/`reimagine`, never introduce them unless the brand already owns them.**

## Visual tells

- **The AI gradient** — purple→blue (or indigo→pink) diagonal gradients, especially behind white text or on buttons.
- **Aurora/mesh blobs** floating behind content with no relationship to the product.
- **Glassmorphism by default** — frosted cards, `backdrop-filter: blur`, white-10% borders on dark.
- **Glowing borders and neon outlines** on cards ("magic UI").
- **Inter everywhere** at 400/600 with default tracking and no display face. (Inter is fine when it's the brand's choice — then set it *deliberately*: Inter Display/Tight, tracked, specific weights.)
- **Bento grid of identical rounded cards** each with an icon, a title and two lines of copy.
- **16–24px radius on everything** — cards, buttons, images, inputs — regardless of the brand's shape language.
- **Centered everything**: centered hero, centered sections, centered cards. Real systems have alignment rules.
- **Generic iconography**: Lucide/Heroicons at default 2px stroke dropped in without matching the type weight.
- **Sparkles ✨ for anything AI**, robot heads, brain icons, circuit lines, glowing orbs.
- **Stock 3D**: isometric people, clay shapes, floating devices, abstract chrome blobs.
- **Fake dashboard screenshots** with random charts instead of the real product.
- **Dark mode = #000 + neon accent** without considering the brand's actual dark colors.
- **Gray drop shadows** (`rgba(0,0,0,.1) 0 4px 6px`) on everything, ignoring tinted elevation.
- **Emoji as icons or bullets.**
- **Gradient text** on headlines (unless measured).
- **Equal-weight everything**: no clear primary action, three buttons competing.

## Copy tells

- Verbs: *unlock, unleash, empower, elevate, supercharge, revolutionize, transform, harness, leverage, streamline, reimagine* (unless the brand uses them).
- Phrases: *"Build faster. Ship smarter."*, *"The future of X is here"*, *"X, reimagined"*, *"Your all-in-one platform"*, *"Seamless integration"*, *"Cutting-edge AI"*, *"Take your X to the next level"*, *"Say goodbye to…"*, *"In today's fast-paced world"*.
- Triplets for rhythm ("Fast. Simple. Powerful.") with no specifics.
- Title Case Headlines When The Brand Uses Sentence Case.
- Exclamation marks and rocket emoji.
- Vague superlatives with no numbers ("lightning fast", "world-class").
- Second-person promises with no mechanism ("Do more with less").

**Antidote:** specificity. Real numbers from the site (the extractor collects stats), real product nouns, the brand's own recurring terms (`voice.topTerms`), the brand's sentence length and punctuation.

## Strategy tells

- Personality traits that apply to every company: *innovative, customer-centric, reliable, modern*.
- `trait`/`notThis` pairs that are just antonyms ("Friendly, not unfriendly"). The `notThis` must be the **overdose** of the trait: *Confident → not arrogant*, *Playful → not silly*, *Precise → not pedantic*, *Warm → not saccharine*.
- Archetype labels with no consequence ("The Creator") — only include an archetype if it changes decisions.
- Pillars that restate the product's feature list.
- Audience = "businesses of all sizes". Find the *buyer* and the *user*, even if the site is broad.

## Process tells

- Describing what the screenshot shows instead of what it means.
- Copying measured values into prose without interpretation ("The primary color is #635BFF") — the tokens already say that. Say *how it's spent*.
- Over-claiming: calling a brand "playful" because it has one illustration.

## The check

Before you finish, read your strategy and imagine it attached to a *competitor's* site. Every sentence that still fits is slop — rewrite or delete it.
