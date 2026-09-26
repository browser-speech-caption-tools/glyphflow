# GlyphFlow article notes

These notes record the editorial research behind the Zenn and DEV Community
drafts in this directory. They are deliberately kept with the drafts so that a
future revision does not turn them into release announcements.

## What the research changed

The articles are not translations of each other.

| Draft                              | Question it answers                                                                              | Reader's outcome                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `zenn-web-speech-caption-ui-ja.md` | How can a browser-only caption move inside a word when the browser only reports word boundaries? | Understand the event model, the CSS rendering choice, and the limits. |
| `devto-speech-captions-en.md`      | Why use one gradient-clipped word instead of changing a whole word or splitting it into letters? | Understand the UI trade-off and the bounded between-event animation.  |

Both drafts lead with a concrete mismatch between an expected UI and a first,
simpler implementation. They retain the project's real constraints rather than
claiming precise character or phoneme timing.

## Research sources and publishing constraints

- [Zenn community guidelines](https://zenn.dev/guideline): Zenn values concrete
  experience and trial-and-error, asks authors to avoid advertising as the main
  purpose, and recommends a clear overview, audience, context, and reproducible
  conditions.
- [Zenn: writing a better technical article](https://zenn.dev/northward/articles/how-to-write-better-tech-articles): check that the title matches the article,
  name the environment, include enough detail to reproduce the result, and read
  the finished piece aloud for awkward rhythm.
- [Zenn: using AI support while writing](https://zenn.dev/rin/articles/bdbdab57997e1e) and
  [a personal AI-writing workflow](https://zenn.dev/yoshiko/articles/my-ai-writing): use AI for structure or review, but rewrite the final voice from actual
  experience rather than accepting generic prose.
- [DEV: high-quality posts](https://dev.to/devteam/how-to-write-a-high-quality-post-on-dev-3me0): use accurate titles, correct tags, alt text for images, and
  deliver what the title promises.
- [DEV: AI-assisted article guidelines](https://dev.to/guidelines-for-ai-assisted-articles-on-dev): AI assistance must be disclosed. The author must stand
  behind factual accuracy, and an article must not be created mainly to drive
  external traffic or backlinks.
- [MDN: `SpeechSynthesisUtterance` `boundary`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event): a boundary event
  marks a word or sentence boundary. It is not a per-character timing API and is
  not Baseline across widely used browsers.

## Voice rules applied to these drafts

1. Start from an observed mismatch, not a product definition. In this project,
   changing an entire word's color did not convey the motion the UI needed.
2. Preserve decisions that another author could not make generically: one word
   span, gradient clipping, `charIndex` mapping, bounded progress, and no audio
   alignment service.
3. Include the trade-offs next to the technique. A boundary event starts a word;
   it does not reveal when every letter is spoken.
4. Do not manufacture a founder story, performance result, compatibility claim,
   or user outcome. Before publication, replace any first-person wording with
   the author's own, factually correct memory of the work.
5. Delete generic sales language. In particular, avoid opening with phrases such
   as "a library that enables", ending with a broad request for feedback, or
   presenting a symmetric feature list as the substance of the article.
6. Vary paragraph length only where it follows the thought. Artificially clipped
   fragments and deliberate typos are not a human voice.
7. Use a small, verified code sample. Link to the repository for the complete
   implementation instead of pasting a large, context-free excerpt.

## Pre-publication checklist

- [ ] The author has replaced or approved every first-person statement.
- [ ] Browser, OS, voice, rate, and language claims match a manual check.
- [ ] Code samples have been copied from, or tested against, the release source.
- [ ] Screenshots/GIFs show the actual inside-glyph wipe; no mock UI is presented
      as a live boundary-timed result.
- [ ] The final call to action is a short project-links section, not the article's
      purpose.
- [ ] The DEV post includes an AI-assistance disclosure if this draft materially
      shaped the final prose, as DEV requires.
- [ ] The author reads the Japanese and English drafts aloud and removes wording
      they would not naturally use.

## Project facts verified from this repository

- Package: `@enumura/glyphflow`, version `1.0.0`.
- Runtime package contents: `dist`, `README.md`, and `LICENSE` only.
- Rendering keeps each word as one `.kn-word` element and changes
  `--kn-progress`; it does not split a word into character elements.
- `boundary` event handling uses `charIndex`, ignores stale/duplicate/out-of-order
  events, and records a measured duration only when a following boundary is
  received.
- The visual predictor uses lightweight spelling costs and bounded progress. It
  targets 94% by its predicted end and never moves beyond 98.5% until the next
  event or completion resolves the word.
- The documented initial support target is Chrome Desktop, English text, and a
  voice that emits usable word boundaries.
