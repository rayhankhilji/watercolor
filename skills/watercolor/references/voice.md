# Voice

## Read the corpus, not the vibe

The brief contains every headline, sub-headline, CTA, nav label, paragraph sample and microcopy string, plus measured stats: heading case, headline length, sentence length, reading grade, you/we rates, exclamation/emoji/question rates, em dashes, Oxford comma, periods on headlines, recurring terms.

Derive voice from **patterns you can point to**:

- *Headline shape*: one long precise sentence (Stripe), two-beat fragment ("Think different."), question, imperative ("Build anything").
- *Specificity*: numbers and proper nouns vs. abstractions.
- *Person*: "you" (customer-centric) vs. "we" (company-centric) vs. impersonal (product-as-subject).
- *Register*: technical vocabulary (API, latency, infrastructure) vs. everyday words.
- *Humor*: present? what kind — dry, warm, absurd?
- *Punctuation tells*: periods on headlines (confident, declarative), em dashes (conversational asides), no exclamations (restraint).

## Writing voice strategy

- `voice.summary`: who's talking, to whom, in what tone — one paragraph.
- `voice.principles`: 3–5. Each = name + description + **do** (a real or realistic line) + **don't** (the tempting off-brand version). Example:
  - **Precise over impressive** — Name the mechanism, not the adjective. ✓ "Accept payments in 135+ currencies." ✗ "Seamless global payments."
- `voice.vocabulary.use`: their recurring terms (from `topTerms`) and product nouns. `avoid`: the slop list words they never use plus any category clichés.
- `voice.mechanics`: concrete style rules — case, punctuation, numerals ("use numerals for all numbers"), contractions, product name formatting, CTA verb style.
- `voice.examples`: 4–6 rewrites across contexts (hero, CTA, error message, empty state, release note, social post). The off-brand version should be *plausible* — what a generic writer would actually produce.
- `voice.taglines`: 3 options in their voice, not slogans from a template.

## Tone shifts by context

Voice is constant; tone flexes. Note how tone should change for errors (calm, specific, no blame), onboarding (encouraging, brief), pricing (plain, exact), launches (proud, concrete), and legal/security (sober).

## Category notes

- **B2B infrastructure/fintech**: credibility through specificity, numbers, customer names; restrained enthusiasm.
- **Devtools**: talk to engineers as peers; code over adjectives; no marketing fluff; humor is dry if present.
- **AI products**: claims are under suspicion — show the mechanism and the outcome, avoid "magic", avoid anthropomorphizing unless the brand does.
- **Consumer**: emotional benefit first, short sentences, warmth; personality can be bigger.
