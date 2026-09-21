# GlyphFlow

**A zero-runtime-dependency browser library that speaks English text with Web Speech API while smoothly wiping each caption word from left to right.**

> Demo media placeholder — add a GIF or screenshot here before publishing.

## Features

- Uses only the browser's `speechSynthesis`; no audio files, network, storage, or AI models.
- Wipes inside each word with CSS gradients rather than flipping whole-word colors.
- Learns timing from observed word boundaries during a narration session.
- Includes short punctuation and line-break pauses in its initial estimates.
- Plain TypeScript DOM API: no React or Vue dependency, and SSR-safe imports.

## Install

```sh
npm install @enumura1/glyphflow
```

```ts
import { createKaraokeNarrator } from "@enumura1/glyphflow";
import "@enumura1/glyphflow/styles.css";

const narrator = createKaraokeNarrator({
  text: "This is a karaoke caption.",
  target: document.querySelector("#caption")!,
  rate: 1,
});
narrator.speak();
```

Call `pause()`, `resume()`, `cancel()`, `getDiagnostics()`, or `destroy()` on the returned narrator. Calling `speak()` again cancels and replaces the active session.

## CSS customization

The library only sets `--kn-progress` inline. Override its appearance normally:

```css
.kn-word {
  --kn-highlight-color: #fff3b0;
  --kn-unhighlight-color: #736a55;
  font-family: Georgia, serif;
}
```

## States and events

`onStateChange` receives `idle`, `starting`, `speaking`, `paused`, `ended`, `cancelled`, `error`, or `unsupported`. `starting` means the browser has not confirmed playback; a voice that does not start within 10 seconds reports `error`. `unsupported` includes missing Web Speech support and voices that finish without usable word-boundary events. `onWordTiming` receives measured timing samples and current diagnostics. Use `getSpeechSynthesisSupport()` before creating UI; `getVoices()` safely returns an empty list until the browser populates voices (listen for `voiceschanged` in application UI).

Timing samples require two consecutive word boundaries. The final word therefore has no measured sample; it is completed when speech ends. A skipped boundary also produces no sample for that interval. If a following boundary is late or missing, the visual wipe advances to the next word after a bounded prediction delay; this fallback never creates a measured timing sample.

## Browser support

The supported starting point is Chrome Desktop, English text, and a voice that emits `word` boundary events. Web Speech API behavior varies by browser, OS, installed voice, and language. Real voice output cannot be established by the automated tests.

To verify a voice manually, run `npm run demo` in Chrome Desktop, select an English voice, and:

1. Play the default sentence at rate 1.0. Confirm the highlight moves through the inside of each character. Normal word boundaries complete the prior word; a late or missing boundary uses the visual fallback described above.
2. Pause mid-word, wait, then resume. Confirm the wipe stays still during the pause and does not jump after resume.
3. Try `go go go`, punctuation, multiple spaces, and a line break. Confirm repeated words track separately and spacing is preserved.
4. Speak again while audio is active, then cancel. Confirm callbacks from the first session do not change the new display.
5. Check the status line and timing table. A voice that provides no usable word boundaries should report `unsupported` after playback ends.

The initial Chrome voice and OS combination has not yet been verified in this repository. Record the voice name, OS, browser version, and observations before claiming a compatibility result.

## Limitations

This is not an audio-file synchronization or forced-alignment library. It cannot make a voice more natural; voice quality is determined by the browser, OS, and voice. It needs word boundaries, does not guarantee every OS/voice, and deliberately performs no storage, analytics, network request, or external-model use. Voice-specific persistence or analysis belongs to the host application.

The browser exposes one shared `speechSynthesis` queue. Cancelling an active GlyphFlow narration uses the global `speechSynthesis.cancel()` method and can also stop speech started by other code on the page. Coordinate speech ownership in the host application.

## Development

```sh
npm install
npm run lint
npm run format:check
npm test
npm run build
npm run demo
```

The contributor documentation site lives in `docs-site/`. Run `npm run docs:install` once, then `npm run docs:dev` for English or `npm run docs:dev:ja` for Japanese. Docusaurus serves one locale at a time in development; `npm run docs:build` builds both.

## License

[MIT](./LICENSE)
