---
sidebar_position: 4
title: States and diagnostics
---

## States

`onStateChange` receives one of these values.

| State | Meaning |
| --- | --- |
| `idle` | The instance has been created and has not started speech. |
| `starting` | The browser has queued the utterance but has not confirmed playback. |
| `speaking` | Speech and the caption animation are active. |
| `paused` | Speech is paused and the caption stops moving. |
| `ended` | Speech ended after receiving usable word boundaries. |
| `cancelled` | `cancel()` stopped the active session. |
| `error` | The browser reported an error, or failed to start speech within 10 seconds. |
| `unsupported` | Web Speech is unavailable, or speech ended without usable word boundaries. |

```ts
const narrator = createKaraokeNarrator({
  text,
  target,
  onStateChange(state, detail) {
    status.textContent = detail?.reason ?? state;
  },
});
```

## Timing samples

`onWordTiming` receives a sample after the next word boundary makes the previous word's duration observable.

```ts
onWordTiming(sample, diagnostics) {
  console.table({
    word: sample.word,
    predictedMs: sample.predictedMs,
    actualMs: sample.actualMs,
    errorMs: sample.errorMs,
  });
}
```

The final word does not have a subsequent boundary, so it does not produce a measured sample. Missing or skipped boundaries also leave no sample for that interval.

When a following boundary is late, GlyphFlow can move the visual wipe to the next word using its prediction. This keeps the caption moving, but it does not invent an observed duration. The live demo shows every word and marks words without a measured sample.

`getDiagnostics()` returns the voice metadata, current rate, samples, mean absolute timing error, the current milliseconds-per-unit estimate, and the number of received boundaries. It is intended for host applications that want to inspect a session without GlyphFlow collecting or storing data itself.
