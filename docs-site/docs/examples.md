---
sidebar_position: 5
title: Examples
---

## Interactive demo

The repository includes a browser demo under `examples/basic`. It provides a text area, voice selector, rate control, narration buttons, a large caption, a timing table, and a diagnostics download button.

```sh
npm install
npm run demo
```

Open the local URL printed by Vite, select an English voice, and press **Speak**.

## Controls

Keep a narrator instance while its caption element is mounted and connect your controls directly to its methods.

```ts
speakButton.addEventListener("click", () => narrator.speak());
pauseButton.addEventListener("click", () => narrator.pause());
resumeButton.addEventListener("click", () => narrator.resume());
cancelButton.addEventListener("click", () => narrator.cancel());
```

## Export diagnostics

GlyphFlow leaves storage and analytics to the host application. If you need a session record, serialize diagnostics yourself.

```ts
downloadButton.addEventListener("click", () => {
  const json = JSON.stringify(narrator.getDiagnostics(), null, 2);
  const file = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "glyphflow-diagnostics.json";
  link.click();
  URL.revokeObjectURL(url);
});
```

## Lifecycle in a component UI

Framework adapters are not part of v0.1. In a component UI, create the narrator after the target element exists and destroy it during the component cleanup step.

```ts
const narrator = createKaraokeNarrator({ text, target });

// Later, when the owning component or view is removed:
narrator.destroy();
```
