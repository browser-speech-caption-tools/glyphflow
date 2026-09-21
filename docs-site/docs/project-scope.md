---
sidebar_position: 8
title: Project scope
---

## v0.1 goals

GlyphFlow has one browser-native job: speak English text while filling each spoken word continuously from left to right _inside its letters_.

| Area           | v0.1 scope                                                                 |
| -------------- | -------------------------------------------------------------------------- |
| Speech         | Browser Web Speech API (`speechSynthesis`)                                 |
| Caption        | A continuous CSS-gradient wipe inside each word, guided by word boundaries |
| Integration    | Framework-independent TypeScript DOM API; safe to import during SSR        |
| Initial target | Desktop Chrome, English text, voices that emit word boundaries             |

## Deliberate boundaries

| Area              | Outside this library's scope                                            |
| ----------------- | ----------------------------------------------------------------------- |
| Audio pipeline    | Audio files, MP3 generation, and forced alignment                       |
| External services | Servers, network requests, and external AI models                       |
| Data & analytics  | Does not save data or collect analytics                                 |
| Compatibility     | A guarantee for every browser, OS, voice, or language                   |
| Voice quality     | Improving naturalness, voice availability, or emitted boundary behavior |

Voice quality and boundary behavior come from the browser and operating system, not GlyphFlow.

## Roadmap

| Planned exploration                      | v0.1 status  |
| ---------------------------------------- | ------------ |
| Framework adapters                       | Not included |
| Optional custom renderer                 | Not included |
| Empirical voice compatibility matrix     | Not included |
| Text plus provided-audio synchronization | Out of scope |

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
