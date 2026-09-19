---
sidebar_position: 3
title: Browser support and manual checks
---

The first supported target is Chrome Desktop, English text, and a voice that emits `word` boundary events. Voice behavior depends on the browser, operating system, and installed voice.

Run `npm run demo`, then verify at rate 1.6:

1. The highlight moves continuously inside each word.
2. Pause holds the current progress and resume does not jump.
3. Repeated words, punctuation, spaces, and line breaks remain aligned.
4. A voice without boundaries reports `unsupported`.
