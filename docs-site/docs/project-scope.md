---
sidebar_position: 8
title: Project scope
---

## v0.1 goals

GlyphFlow focuses on a small, browser-native capability: speak English text through the Web Speech API while rendering a smooth word-level text wipe. It is framework-independent, has zero runtime dependencies, and can be imported safely in SSR environments.

## Deliberate boundaries

GlyphFlow does not use audio files, MP3 generation, forced alignment, external AI models, servers, network requests, cookies, local storage, IndexedDB, or voice-specific persistence. It does not promise support for every browser, OS, voice, or language.

The library cannot improve a voice's naturalness. Voice quality, availability, and boundary behavior are supplied by the browser and operating system.

## Roadmap

- Framework adapters
- Optional custom renderer
- Empirical voice compatibility matrix

Text plus provided-audio synchronization is out of scope for v0.1.

## Development commands

```sh
npm install
npm run lint
npm run format:check
npm test
npm run build
npm run demo
npm run docs:build
```
