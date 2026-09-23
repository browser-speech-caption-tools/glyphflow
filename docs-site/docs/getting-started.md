---
sidebar_position: 2
title: Getting started
---

## Install

```sh
npm install @enumura/glyphflow
```

Import the API and stylesheet from your application entry point.

```ts
import { createKaraokeNarrator, getSpeechSynthesisSupport } from "@enumura/glyphflow";
import "@enumura/glyphflow/styles.css";
```

## Create a caption target

GlyphFlow writes its caption spans into the element you pass as `target`.

```html
<p id="caption" aria-live="polite"></p>
```

Check browser support before enabling your controls. This function is safe to import and call in SSR environments.

```ts
const support = getSpeechSynthesisSupport();

if (!support.supported) {
  console.log(support.reason);
}
```

## Narrate text

```ts
const target = document.querySelector<HTMLElement>("#caption");

if (!target) throw new Error("Caption target is missing");

const narrator = createKaraokeNarrator({
  text: "Read each word as its highlight moves across the letters.",
  target,
  lang: "en-US",
  rate: 1.2,
  onStateChange(state, detail) {
    if (state === "unsupported") console.log(detail?.reason);
  },
});

narrator.speak();
```

Calling `speak()` again cancels the active session and starts a fresh one. Call `destroy()` when the owning UI is removed; it cancels animation and clears the caption DOM.

## Choose a voice

The browser may load its voice list asynchronously. `getVoices()` therefore returns an empty array until voices are ready. Refresh your own UI when the browser dispatches `voiceschanged`.

```ts
import { getVoices } from "@enumura/glyphflow";

function refreshVoices() {
  const englishVoices = getVoices().filter((voice) => voice.lang.startsWith("en"));
  // Populate your select control with englishVoices.
}

refreshVoices();
speechSynthesis.addEventListener("voiceschanged", refreshVoices);
```

Pass the selected `SpeechSynthesisVoice` as `voice` when creating the narrator. The host application owns voice preferences and persistence.
