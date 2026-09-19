---
sidebar_position: 1
title: Introduction
slug: /
hide_table_of_contents: true
---

<div className="hero">

# GlyphFlow documentation

GlyphFlow is a zero-runtime-dependency TypeScript library that speaks text with the Web Speech API and fills each caption word from left to right as it is spoken.

<div className="hero-actions">

[Get started](./getting-started) [Read the API](./api)

</div>
</div>

## What it gives you

<div className="feature-grid">

<div>

### A continuous text wipe

Each word fills from left to right with a CSS gradient. It is not a whole-word color toggle and it does not split text into individual character elements.

</div>

<div>

### Browser-native speech

It uses `window.speechSynthesis`. There are no audio files, servers, external models, storage, analytics, or runtime dependencies.

</div>

<div>

### Timing that improves as it speaks

Word-boundary events provide observed timings. Between boundaries, GlyphFlow predicts motion and updates later predictions from actual measurements.

</div>

</div>

## Quick start

```sh
npm install @enumura1/glyphflow
```

```ts
import { createKaraokeNarrator } from "@enumura1/glyphflow";
import "@enumura1/glyphflow/styles.css";

const narrator = createKaraokeNarrator({
  text: "This is a caption.",
  target: document.querySelector("#caption")!,
  rate: 1.6,
});
narrator.speak();
```

The library renders its own spans inside `target`. Import the included CSS once, then override colors and typography in your application stylesheet.

```css
.kn-word {
  --kn-highlight-color: #f3f7ff;
  --kn-unhighlight-color: #475061;
  font-size: clamp(2rem, 6vw, 5rem);
}
```

## Is GlyphFlow a fit?

Use it for browser experiences that narrate English text and need a visual reading cue: accessibility aids, language-learning exercises, guided reading, product demos, and interactive captions.

GlyphFlow is designed for Chrome Desktop and English voices that emit `word` boundary events. It does not synchronize provided audio files or perform forced alignment. Voice availability and speech quality remain properties of the browser, OS, and selected voice.

## Explore the docs

- [Installation and first narration](./getting-started)
- [Styling the caption](./customization)
- [States, timing samples, and diagnostics](./diagnostics)
- [API reference](./api)
- [Browser support and manual verification](./browser-support)
