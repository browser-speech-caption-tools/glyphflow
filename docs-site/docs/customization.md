---
sidebar_position: 3
title: Customization
---

GlyphFlow adds the `kn-caption` class to the target and `kn-word` to each spoken word. The only inline style it writes is `--kn-progress`, which controls the gradient boundary.

## Change colors and typography

```css
.lesson-caption {
  font-family: ui-rounded, "Avenir Next", sans-serif;
  font-size: clamp(2rem, 7vw, 5rem);
  font-weight: 700;
  line-height: 1.2;
}

.lesson-caption .kn-word {
  --kn-highlight-color: #fff4ba;
  --kn-unhighlight-color: #6d6780;
}
```

Pass `className: "lesson-caption"` to `createKaraokeNarrator` to attach this class to the target.

## Use your own gradient

You can replace the default gradient entirely. Keep `var(--kn-progress)` as the color transition point.

```css
.lesson-caption .kn-word {
  color: transparent;
  background: linear-gradient(
    90deg,
    #ffdc76 0%,
    #ffdc76 var(--kn-progress),
    #4f5568 var(--kn-progress),
    #4f5568 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Do not set `--kn-progress` yourself while narration is active. GlyphFlow updates it on animation frames and completes the preceding word when the next word boundary arrives.
