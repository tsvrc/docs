---
paths:
  - "**/*.md"
  - "**/*.mdx"
---

# Structuring and linking docs

## Pick the right category (Diátaxis)

Every page does exactly one of these jobs. Mixing them inside one page is why docs end up
feeling unfocused:

- **Tutorial** — a guided first experience. Optimizes for the reader finishing
  successfully, not for completeness.
- **How-to guide** — solves one specific, named problem for someone who already knows the
  basics. Skips background explanation.
- **Reference** — describes the thing accurately and completely (an API, a config schema,
  a component's props). No opinions, no narrative — facts, kept accurate as the thing
  changes.
- **Explanation** — the why: design rationale, tradeoffs, how pieces fit together. The only
  category where discussing alternatives and context belongs.

Not sure which one a page is? That's the sign it's trying to do two jobs — split it.

## Fully documenting a component: don't skip details

When writing reference or explanation content for a package or component, cover what a
careful reviewer would ask about, not just the happy path:

- What it's for, in one sentence a newcomer understands without prior context.
- Its public surface: what a consumer actually calls, imports, or configures.
- Invariants and constraints: what must be true before and after, what it assumes the
  caller already did.
- Failure modes: what happens when it's misused, and what signals that (error, log,
  silent no-op).
- Edge cases that aren't obvious from the signature — ordering, concurrency, lifecycle,
  platform-specific behavior.
- Why it's built this way, when the reason isn't obvious. Link to an explanation page
  rather than re-explaining inline.

Missing one of these isn't a style problem, it's a coverage gap — the kind of thing a
reader hits in production with nowhere to look it up.

## Sections and metadata

- One H1 per page, matching the frontmatter title.
- A one- or two-sentence summary right under the H1: what this page is and who it's for,
  before anything else.
- Sentence-case headings throughout (see `writing-style.md`).

## Linking instead of duplicating

- Never restate content that already exists on another page. Link to the canonical page
  instead — two copies of the same explanation will drift, a link can't.
- Link relatively within the same project folder (`../other-page`); link from the docs
  root when crossing into another project's docs (`/docs/<other-project>/...`).
- When a decision has real tradeoffs and a future reader will reasonably ask "why was it
  done this way", record it once as a short decision note (what, why, alternatives
  considered) and link to it from everywhere it's relevant. Don't re-litigate it inline on
  every page that touches it.

## Multi-project layout

Each project under the `tsvrc` org gets `docs/<project>/` in this repo (see the root
`CLAUDE.md` for why this is one repo, not one repo per project). Don't duplicate a concept
shared by two projects — document it once under whichever project owns it, and link from
the other.
