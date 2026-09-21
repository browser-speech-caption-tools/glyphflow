---
sidebar_position: 3
title: カスタマイズ
---

GlyphFlowは`target`に`kn-caption`、読み上げる各単語に`kn-word`を付けます。inline styleで設定するのはグラデーション境界を表す`--kn-progress`だけです。

## 色と書体を変える

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

`createKaraokeNarrator`に`className: "lesson-caption"`を渡すと、targetにクラスが追加されます。

## 独自のグラデーションを使う

デフォルトのグラデーション全体を置き換えられます。色の切り替え位置には`var(--kn-progress)`を使ってください。

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

読み上げ中に`--kn-progress`を自分で設定しないでください。GlyphFlowがanimation frameごとに更新します。次の単語境界が届くと前の単語を完了し、境界が遅い場合は計測サンプルを作らずに表示だけを安全に進めます。
