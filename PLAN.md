# GlyphFlow plan

## Public API

`createKaraokeNarrator(options)` returns an imperative narrator with `speak`,
`pause`, `resume`, `cancel`, `getDiagnostics`, and `destroy`. Support and voice
helpers are SSR-safe. The first release targets English text and browser voices
which emit `word` boundary events.

## Layout

```
src/
  index.ts              public exports
  types.ts              public and internal contracts
  tokenizer.ts          text segmentation and char-index lookup
  timing-predictor.ts   DOM-independent timing estimate and EMA calibration
  renderer.ts           DOM spans and CSS-variable updates
  speech-driver.ts      injectable browser Speech API adapter
  narrator.ts           session lifecycle and orchestration
  styles.css            opt-in default presentation
```

## Key decisions

- A narration session has a monotonically increasing id; callbacks from an old
  utterance are ignored.
- Tokens preserve all non-word text in `trailing`, and rendering alternates word
  spans with plain text spans so the source text is visually exact.
- The predictor stops at 94% at its estimated word end, then eases toward a
  98.5% ceiling until the following observed boundary completes the word.
- `SpeechDriver` is injected through an internal test-only factory parameter,
  keeping the public API small while allowing deterministic unit tests.
- If speech ends after no usable word boundaries, state becomes `unsupported`;
  this distinguishes a non-compatible voice from normal completion.
