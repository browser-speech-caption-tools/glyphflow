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

Some browsers require speech to begin from a user gesture. Trigger `narrator.speak()` from a click or keyboard event, and check `getSpeechSynthesisSupport()` before enabling the control.

## Another feature's speech stopped

The browser exposes one shared speech queue. GlyphFlow uses `speechSynthesis.cancel()` when replacing or cancelling a session, which can stop another feature's utterance. Coordinate speech ownership in the host application.

## The wipe is not visually correct

Start with the bundled stylesheet, then check application CSS for rules that override `background-clip`, `-webkit-text-fill-color`, or the `--kn-progress` property. Use the [Customization](./customization) guide as a known-good base.
