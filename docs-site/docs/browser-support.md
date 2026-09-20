---
sidebar_position: 9
title: Browser support and manual checks
---

GlyphFlow's initial target is desktop Chrome with English text and a voice that emits `word` boundary events. Voice behavior also depends on the operating system and installed voice.

| Environment                                   | Status                      | What to expect                                                                                                 |
| --------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Desktop Chrome, English, word-boundary voice  | Initial target              | Speech and the inside-word wipe work when the browser starts the voice and emits boundaries.                   |
| Desktop Chrome, voice without word boundaries | Limited                     | Speech may play, but the synchronized wipe is unavailable; GlyphFlow reports `unsupported` when playback ends. |
| Other desktop browsers                        | Not yet characterized       | Web Speech behavior varies; verify the selected browser and voice manually.                                    |
| Mobile browsers and non-English text          | Outside v0.1 support target | No compatibility guarantee yet.                                                                                |

At startup, call `getSpeechSynthesisSupport()` to identify environments without the Web Speech API. This only checks API availability. A browser can expose the API but fail to start a particular utterance; GlyphFlow waits for the browser's `start` event and reports `error` if it does not arrive within 10 seconds. A voice also needs usable `word` boundaries for synchronized captions.

Speech synthesis is a shared browser queue. `cancel()` calls the browser's global `speechSynthesis.cancel()`, which may also stop speech started by other code on the page. Applications that use multiple speech features should coordinate ownership of that queue.

Run `npm run demo` with the browser and voice you intend to support. At rate 1.6, check:

| Check              | Expected result                                                                  |
| ------------------ | -------------------------------------------------------------------------------- |
| Start playback     | Audible speech begins and state changes from `starting` to `speaking`.           |
| Inside-word motion | Colour advances continuously through each glyph, not as a whole-word flash.      |
| Pause and resume   | The current wipe holds, then resumes without a jump.                             |
| Text fidelity      | Repeated words, punctuation, spaces, and line breaks remain aligned.             |
| Missing boundaries | Playback ends with `unsupported`, rather than implying measured synchronization. |
| No browser start   | State becomes `error` after 10 seconds instead of remaining `speaking`.          |
