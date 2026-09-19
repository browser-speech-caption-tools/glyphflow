---
sidebar_position: 9
title: Browser support and manual checks
---

The first supported target is Chrome Desktop, English text, and a voice that emits `word` boundary events. Voice behavior depends on the browser, operating system, and installed voice.

At startup, call `getSpeechSynthesisSupport()` to identify environments without the Web Speech API. A supported API alone is insufficient: the chosen voice must also emit usable `word` boundaries. GlyphFlow reports `unsupported` after an utterance ends without them.

Speech synthesis is a shared browser queue. `cancel()` calls the browser's global `speechSynthesis.cancel()`, which may also stop speech started by other code on the page. Applications that use multiple speech features should coordinate ownership of that queue.

Run `npm run demo`, then verify at rate 1.6:

1. The highlight moves continuously inside each word.
2. Pause holds the current progress and resume does not jump.
3. Repeated words, punctuation, spaces, and line breaks remain aligned.
4. A voice without boundaries reports `unsupported`.
