---
sidebar_position: 6
title: API
---

## `createKaraokeNarrator(options)`

Returns an object with `speak()`, `pause()`, `resume()`, `cancel()`, `getDiagnostics()`, and `destroy()`.

| Option | Description |
| --- | --- |
| `text` | Source text to speak and render. |
| `target` | Element whose content GlyphFlow renders. |
| `voice` | Optional browser `SpeechSynthesisVoice`. |
| `lang` | Optional BCP 47 language tag, such as `en-US`. |
| `rate`, `pitch`, `volume` | Web Speech utterance settings. |
| `className` | Class added to the target for application styling. |
| `onStateChange` | Receives state transitions and optional reason/diagnostics. |
| `onWordTiming` | Receives observed timing samples and diagnostics. |

`speak()` replaces an existing session. `pause()` and `resume()` affect the active session. `cancel()` stops it and emits `cancelled`. `destroy()` cancels work, clears the target, and releases animation work; do not reuse an instance after destroying it.

`onStateChange` reports `idle`, `speaking`, `paused`, `ended`, `cancelled`, `error`, or `unsupported`. A voice that emits no usable word boundaries ends in `unsupported`. See [States and diagnostics](./diagnostics) for event payloads and timing behavior.

## Support helpers

`getSpeechSynthesisSupport()` is safe to call during SSR. `getVoices()` returns an empty array until the browser has populated voices; host applications can listen for `voiceschanged`.

## Styling

Import `@enumura1/glyphflow/styles.css`. Override `--kn-highlight-color`, `--kn-unhighlight-color`, font, size, and spacing in application CSS.
