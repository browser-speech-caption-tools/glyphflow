---
sidebar_position: 2
title: API
---

## `createKaraokeNarrator(options)`

Returns an object with `speak()`, `pause()`, `resume()`, `cancel()`, `getDiagnostics()`, and `destroy()`.

Options include `text`, an HTMLElement `target`, optional `voice`, `lang`, `rate`, `pitch`, `volume`, `className`, `onStateChange`, and `onWordTiming`.

`onStateChange` reports `idle`, `speaking`, `paused`, `ended`, `cancelled`, `error`, or `unsupported`. A voice that emits no usable word boundaries ends in `unsupported`.

## Support helpers

`getSpeechSynthesisSupport()` is safe to call during SSR. `getVoices()` returns an empty array until the browser has populated voices; host applications can listen for `voiceschanged`.

## Styling

Import `@enumura1/glyphflow/styles.css`. Override `--kn-highlight-color`, `--kn-unhighlight-color`, font, size, and spacing in application CSS.
