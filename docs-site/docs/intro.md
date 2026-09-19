---
sidebar_position: 1
title: GlyphFlow
---

GlyphFlow is a zero-runtime-dependency TypeScript library that speaks text with the browser Web Speech API while wiping each caption word from left to right.

## Install

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

The package uses no storage, network, audio files, forced alignment, or external AI models.
