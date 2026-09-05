---
paths:
  - "**/*.md"
  - "**/*.mdx"
---

# Writing style: sound human, say only what's needed

Docs written by an LLM have a recognizable smell, and readers trust content less once they
notice it. Avoid it.

## Cut, don't pad

- If a reader can see it by reading the code, don't restate it here. A doc earns its place
  by adding what code can't show: why, tradeoffs, what breaks, what to do next.
- Before adding a paragraph, check what it adds beyond the paragraph before it or the code
  itself. If nothing, delete it.
- One idea per section. If two sections could swap order without anything breaking, that's
  a list wearing the structure of an argument — tighten it.

## Words and phrases to avoid

These are statistically over-represented in LLM output and read as filler to anyone who has
seen a lot of AI-generated text: delve, leverage (verb), robust, seamless, comprehensive,
cutting-edge, pivotal, meticulous, landscape / realm / tapestry (as metaphors), utilize,
"in order to", streamline, foster, elevate, unlock, harness, ecosystem (unless it's
literally an ecosystem), myriad, plethora, crucial, paramount, nuanced, "it's worth noting",
"it's important to note", "at its core", "best practices" (name the actual practice instead).

Hedging kills technical writing — cut "could potentially", "may eventually", "it's worth
mentioning". State the fact or the tradeoff directly.

## Sentence and paragraph shape

- Vary sentence length on purpose. A row of same-length sentences reads like a template.
- Don't open with "In today's...", "Let's explore...", or "In this doc, we will...". Start
  with the actual point.
- Avoid the "It's not X, it's Y" construction. State the positive claim.
- Sentence case for headings ("Set up your environment"), not title case
  ("Set Up Your Environment").
- Skip chatbot artifacts entirely — "I hope this helps", "Great question", "Feel free to
  reach out". This is documentation, not a chat reply.

## Punctuation and formatting

- Avoid em dashes for asides in prose; use a comma, a colon, or a full stop instead. (An em
  dash inside a bolded-term list item is fine: `- **Term** — one-line description`.)
- Don't bold more than one phrase per section — bolding everything bolds nothing.
- Reach for prose over bullets when explaining an idea with real connections between its
  parts. Bullets suit genuinely parallel, independent items — flags, a checklist, install
  steps. A bulleted list of bare noun phrases ("Fast. Reliable. Secure.") explains nothing;
  say what's actually fast, reliable, or secure, and why.

## Read it back before committing

Read the page out loud, or run it through text-to-speech mentally. Rewrite anything you
wouldn't actually say to a colleague. This one pass catches most of the above.
