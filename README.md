# karaoke-narrator

**A zero-runtime-dependency browser library that speaks English text with Web Speech API while smoothly wiping each caption word from left to right.**

> Demo media placeholder — add a GIF or screenshot here before publishing.

## Features

- Uses only the browser's `speechSynthesis`; no audio files, network, storage, or AI models.
- Wipes inside each word with CSS gradients rather than flipping whole-word colors.
- Learns timing from observed word boundaries during a narration session.
- Plain TypeScript DOM API: no React or Vue dependency, and SSR-safe imports.

## Install

```sh
npm install karaoke-narrator
```

```ts
import { createKaraokeNarrator } from "karaoke-narrator";
import "karaoke-narrator/styles.css";

const narrator = createKaraokeNarrator({
  text: "This is a karaoke caption.",
  target: document.querySelector("#caption")!,
  rate: 1.6,
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

`onStateChange` receives `idle`, `speaking`, `paused`, `ended`, `cancelled`, `error`, or `unsupported`. `unsupported` includes missing Web Speech support and voices that finish without usable word-boundary events. `onWordTiming` receives measured timing samples and current diagnostics. Use `getSpeechSynthesisSupport()` before creating UI; `getVoices()` safely returns an empty list until the browser populates voices (listen for `voiceschanged` in application UI).

## Browser support

The supported starting point is Chrome Desktop, English text, and a voice that emits `word` boundary events. Web Speech API behavior varies by browser, OS, installed voice, and language. Manually verify your chosen voice, including pause/resume, repeated words, punctuation, and a 1.60 rate, using `npm run demo`.

## Limitations

This is not an audio-file synchronization or forced-alignment library. It cannot make a voice more natural; voice quality is determined by the browser, OS, and voice. It needs word boundaries, does not guarantee every OS/voice, and deliberately performs no storage, analytics, network request, or external-model use. Voice-specific persistence or analysis belongs to the host application.

## Development

```sh
npm install
npm run lint
npm test
npm run build
npm run demo
```

## Roadmap

- Framework adapters
- Optional custom renderer
- Empirical voice compatibility matrix
- Text plus provided-audio mode is out of scope for v0.1

## License

MIT
