<!--
DEV Community draft

Suggested tags: webdev, javascript, typescript, css
Do not use this as a backlink-only announcement.

Disclosure required by DEV if this draft materially shapes the published prose:
"Disclosure: I used AI assistance to organize and edit this article. I verified
the technical details against the linked source code and documentation."
-->

# I wanted browser speech captions to move, not blink

The first version of this UI only changed the color of the current word.

That did answer one question: which word is the browser speaking? It did not
look like the caption was moving with the voice. A word would sit unchanged and
then switch all at once. For a read-along interface, I wanted the color boundary
to travel through the letters instead.

I built [GlyphFlow](https://github.com/speech-caption/glyphflow) around that
constraint. It is a small TypeScript library for Web Speech captions. This post
is about the rendering and timing decisions behind it, not a claim that the
browser can provide character-level speech alignment.

## The useful event is also an incomplete one

`SpeechSynthesisUtterance` can emit a `boundary` event while an utterance is
spoken. The event includes a character index and elapsed time.

```ts
utterance.onboundary = (event) => {
  console.log(event.name, event.charIndex, event.elapsedTime);
};
```

That is enough to identify a word start in the original input. It is not enough
to say when the voice reached the second `t` in `letter`.

This distinction shaped the whole implementation. The browser is the source of
truth for word starts. The motion between word starts is a visual estimate.

It also puts a real limit on the project: Web Speech behavior depends on the
browser, OS, and installed voice. The initial support target is Chrome Desktop,
English text, and voices that produce usable word-boundary events. MDN marks
the event as limited availability rather than a Baseline feature. [Its boundary
event documentation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event)
is worth reading before treating it as a universal captioning API.

## One word, one element

I did not split each word into character elements. That would make it easy to
light up letters one at a time, but that is a different visual language: a
sequence of discrete changes rather than one boundary moving through a glyph.

The rendered word stays as one span.

```html
<span class="kn-word" style="--kn-progress: 42%">caption</span>
```

The CSS background is the moving part.

```css
.kn-word {
  color: transparent;
  background: linear-gradient(
    90deg,
    var(--kn-highlight-color, #f3f7ff) 0%,
    var(--kn-highlight-color, #8da7ff) var(--kn-progress),
    var(--kn-unhighlight-color, #475061) var(--kn-progress),
    var(--kn-unhighlight-color, #475061) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Updating `--kn-progress` from `0%` to `100%` moves the transition through the
actual letter shapes. The DOM still represents a word as a word, and punctuation
and whitespace can remain faithful to the source text.

## A boundary starts the motion; the next one measures it

There is a quiet gap in this model. A boundary tells me a word has started, but
the next boundary has not arrived yet. Leaving the word static for that whole
gap looks broken, so GlyphFlow starts a `requestAnimationFrame` loop.

The initial duration estimate is intentionally lightweight: word length, a few
letter patterns, speech rate, and nearby punctuation. There is no dictionary,
phoneme model, audio file, or network call involved.

The estimate does not complete the word at exactly 100%. It reaches 94% at the
predicted end, then eases no farther than 98.5%. When the next word boundary
arrives, the previous word becomes 100% and the elapsed-time difference becomes
an observed duration.

```ts
const actualDuration = nextBoundary.elapsedTime - currentBoundary.elapsedTime;
```

That observed duration can gently influence later estimates in the same
utterance. It is useful when a particular voice and rate are consistently faster
or slower than the initial guess. It is not phoneme alignment, and a final word
has no following boundary from which to derive an observed duration.

## Browser events need defensive state handling

The more interesting bugs were not in the gradient. They were in event timing.

A word boundary can be duplicated, arrive out of order, point near rather than
at a token start, or arrive after a narration was cancelled. A paused caption
must not keep progressing just because an animation frame is still scheduled.

GlyphFlow assigns each `speak()` call a session identity. Events from an older
utterance cannot update a newer session's DOM or state. Duplicate and stale
boundaries are ignored. Pause time is excluded from visual progress. If speech
finishes without usable word boundaries, the caller receives an `unsupported`
state instead of a caption that quietly pretends it was synchronized.

Those cases are less impressive in a demo than a flowing gradient, but they are
the difference between a visual experiment and a component that can be embedded
in another page.

## What this is, and what it is not

The result is useful when a browser voice should give a reader a place to look:
read-along captions, language exercises, or a narrated explanation. It is not a
tool for synchronizing supplied audio, producing MP3 files, or deriving
per-letter pronunciation timestamps.

The project is MIT-licensed. If you want to inspect the implementation or try
the demo:

- Source: https://github.com/speech-caption/glyphflow
- Package: https://www.npmjs.com/package/@enumura/glyphflow
- Demo: https://speech-caption.github.io/glyphflow/
