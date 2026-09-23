---
sidebar_position: 7
title: Troubleshooting
---

## No voices appear in my selector

Browsers often populate voices asynchronously. Call `getVoices()` once, then refresh your UI from the browser's `voiceschanged` event. An empty array is a valid initial result.

## The narrator ends as `unsupported`

The browser may support Web Speech but the selected voice may not emit usable `word` boundary events. This state means GlyphFlow cannot synchronize the word wipe for that voice. Test a different English voice in Chrome Desktop.

## I hear speech but the caption does not move

Confirm that you imported `@enumura1/glyphflow/styles.css` and that the selected voice emits word boundaries. The `unsupported` state after speech ends identifies a boundary-free voice.

## Speech does not start

Some browsers require speech to begin from a user gesture. Trigger `narrator.speak()` from a click or keyboard event, and check `getSpeechSynthesisSupport()` before enabling the control. If state stays at `starting` and then becomes `error`, the browser did not confirm playback. Try a direct Web Speech utterance in the same browser, then test another browser or restart the affected browser.

For a direct browser check, run `npm run demo` and open `http://127.0.0.1:5173/speech-probe.html`. Select a voice and press **Speak directly**. This page bypasses GlyphFlow and displays the browser's `start`, `boundary`, `end`, and `error` events. If it remains at `speaking=true` without a `start` event or audible speech, the browser's speech engine has not started the utterance.

## Another feature's speech stopped

The browser exposes one shared speech queue. GlyphFlow uses `speechSynthesis.cancel()` when replacing or cancelling a session, which can stop another feature's utterance. Coordinate speech ownership in the host application.

## The wipe is not visually correct

Start with the bundled stylesheet, then check application CSS for rules that override `background-clip`, `-webkit-text-fill-color`, or the `--kn-progress` property. Use the [Customization](./customization) guide as a known-good base.

## I found a bug

Please [open a GitHub issue](https://github.com/speech-caption/glyphflow/issues/new?template=bug_report.yml) when behavior differs from this documentation. Before filing, check existing issues and this troubleshooting guide. Include reproducible steps, expected and actual behavior, GlyphFlow version, browser and OS versions, selected voice details, and relevant state changes or diagnostics. A minimal code example is especially helpful; remove private text and credentials first. See the [contribution guide](https://github.com/speech-caption/glyphflow/blob/main/CONTRIBUTING.md) for the full reporting checklist.
