# Contributing to GlyphFlow

GlyphFlow is actively welcoming contributors. Whether you report a bug, improve documentation, add a test, or propose a focused implementation, your contribution is welcome.

## Ways to help

- Report a reproducible bug or an unsupported browser/voice behavior.
- Improve examples, documentation, translations, or accessibility.
- Add focused tests for an existing behavior.
- Propose a scoped improvement in an issue before implementing it.

Small contributions are valuable. A clear issue or documentation correction is just as useful as a code change.

## Reporting a bug

Before opening an issue:

1. Check the [troubleshooting guide](https://speech-caption.github.io/glyphflow/docs/troubleshooting/) and confirm the behavior is within the current support target: Chrome Desktop, English text, and a voice that emits `word` boundary events.
2. Search [existing issues](https://github.com/speech-caption/glyphflow/issues) to avoid duplicates.
3. Reproduce the problem with the latest released package or the current `main` branch when practical.

Use the [bug report form](https://github.com/speech-caption/glyphflow/issues/new?template=bug_report.yml). It asks for the information needed to investigate a browser-speech problem:

- a short description and reproducible steps;
- expected and actual behavior;
- a minimal code example when possible;
- GlyphFlow version, browser and version, and operating system;
- selected voice name, language, and whether it is local when known; and
- relevant state changes or diagnostics, with private text removed.

Do not include credentials, personal text, or any other sensitive information in a public issue.

## Suggesting a change

For a behavior change or larger feature, open an issue first so the intended API and scope can be discussed before implementation.

## Local development

```sh
npm install
npm run lint
npm run format:check
npm test
npm run build
```

The documentation site is in `docs-site/`.

```sh
npm run docs:install
npm run docs:dev       # English
npm run docs:dev:ja    # Japanese
npm run docs:build     # both locales
```

## Pull requests

- Keep one pull request focused on one concern.
- Add or update tests for behavior changes.
- Update public documentation when an API, support boundary, or user-visible behavior changes.
- Run the relevant checks above before opening the pull request.
- Do not commit generated build output or unrelated formatting changes.

By submitting a contribution, you agree that it may be distributed under this repository's [MIT License](./LICENSE).
