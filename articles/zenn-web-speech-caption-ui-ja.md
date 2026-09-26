---
title: "Web Speech APIの単語境界だけで、文字の内側を塗り進める字幕UIを作る"
emoji: "🔊"
type: "tech"
topics: ["typescript", "webapi", "css", "webspeechapi"]
published: false
---

## はじめに

ブラウザの読み上げに合わせて字幕を動かすなら、今読んでいる単語だけ色を変えればよいと思っていました。

実際に表示してみると、それでは足りませんでした。単語の切り替わりは分かりますが、音声と文字が一緒に進んでいる感じが出ません。欲しかったのは、単語が一瞬で明るくなる表示ではなく、文字の形の中を左から右へ色が進む表示です。

この記事では、Web Speech APIが返す単語境界イベントだけを使い、音声ファイルや強制アラインメントなしでその表示を作るまでの設計をまとめます。完成コードは [GlyphFlow](https://github.com/speech-caption/glyphflow) にあります。

## この記事で扱う範囲

対象は、Chrome Desktopで英語テキストを読み上げ、単語境界を返すvoiceです。Web Speech APIの挙動はブラウザ、OS、voiceで変わります。特に`boundary`イベントは広く一律に使えるAPIではありません。 [MDN](https://developer.mozilla.org/ja/docs/Web/API/SpeechSynthesisUtterance/boundary_event)

この記事は、文字や音素ごとの正確な発音時刻を求めるものではありません。そこまで必要なら、音声ファイルとアラインメント情報を使う別の問題になります。

## まず分かるのは「単語の開始」だけ

`SpeechSynthesisUtterance` の `boundary` イベントには、発話テキスト内の位置である `charIndex` と、発話開始からの `elapsedTime` が入ります。

```ts
utterance.onboundary = (event) => {
  console.log(event.name, event.charIndex, event.elapsedTime);
};
```

ここで重要なのは、イベントがアニメーションのフレームではないことです。`charIndex` が教えてくれるのは「このあたりの単語が始まった」であって、「この文字を発音した」ではありません。

そのため、元のテキストを先に単語化し、各単語の開始・終了位置を保存します。句読点や連続する空白を壊さずに表示したいので、単語そのものと、その後ろに続く文字列を分けて保持します。

```ts
type WordToken = {
  text: string;
  start: number;
  end: number;
  trailing: string;
  units: number;
};
```

同じ単語が続く文でも、単語の文字列ではなく`charIndex`で探せば区別できます。実際のvoiceが単語の先頭ぴったりではない位置を返す場合もあるため、GlyphFlowでは最も近い該当トークンを安全に探します。

## 1文字ずつDOMにしなかった

最初に考えたのは、単語を1文字ずつ`span`へ分割して順番に色を変える方法でした。ただ、この表示で欲しいのは文字ごとの段階的な点灯ではありません。境界が連続的に通過する見た目です。

そこで、単語は1要素のままにし、文字だけを背景グラデーションで切り抜く形にしました。

```html
<span class="kn-word" style="--kn-progress: 42%">caption</span>
```

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

更新するインラインスタイルは`--kn-progress`だけです。DOMを文字単位に増やさず、単語の途中にも連続した境界を作れます。

## イベントが来ない間をどう見せるか

単語の開始イベントを受け取った直後は、次の単語がいつ始まるか分かりません。それでも、その間ずっと表示を止めると字幕らしく見えません。

GlyphFlowでは、単語の長さ、簡単な文字パターン、rate、直後の句読点から、その単語が終わるまでの時間を軽く見積もります。辞書や音声モデルは使いません。これは実測値ではなく、次のイベントまでの見た目を動かすための仮の時間です。

予測どおりの時刻に100%まで到達させると、次のイベントが少し遅れたときに、単語が完了したまま待ってしまいます。そこで、予測時間では94%まで進め、その後は最大98.5%までゆっくり近づけます。

次の単語境界が届いた瞬間に、直前の単語を100%にします。同時に、2つの開始イベントの`elapsedTime`の差から、直前の単語に実際にかかった時間を得られます。

```ts
const actualDuration = nextBoundary.elapsedTime - currentBoundary.elapsedTime;
```

この値は同じ読み上げセッション内だけで使います。計測値の一部を後続の予測に反映しますが、極端に短い・長い値は学習に使いません。長い文章ほど材料が増える一方、これはvoiceの発音を完全に理解する仕組みではありません。

## イベントをそのまま信じない

ブラウザイベントの扱いでは、見た目より状態管理の方が難しい部分でした。

- 同じ`boundary`が重複して届く
- 順番が逆のイベントが届く
- pause中も`requestAnimationFrame`だけは進んでしまう
- cancel後に古いutteranceのイベントが届く
- 終了まで単語境界を返さないvoiceがある

このため、再生ごとにセッションIDを持ち、現在のセッションと一致しないイベントは無視します。pause中はワイプを進めず、resume後はpause時間を補正します。終了まで有効な単語境界が来なかった場合は、同期できなかったことを`unsupported`として利用側に伝えます。

ここは「すべてのvoiceを支援する」と言い切らないための設計でもあります。音声品質やイベントの粒度は、ライブラリ側で改善できるものではありません。

## 使う側のコードは小さくした

ライブラリの利用側は、テキスト、描画先、voice、rateを渡して`speak()`するだけです。

```ts
import { createKaraokeNarrator } from "@enumura/glyphflow";
import "@enumura/glyphflow/styles.css";

const narrator = createKaraokeNarrator({
  text: "Every letter follows the voice.",
  target: document.querySelector("#caption")!,
  rate: 1,
});

narrator.speak();
```

読み上げに伴う単語ごとの予測値・実測値は`onWordTiming`と`getDiagnostics()`から取得できます。ただし、最後の単語には次の境界がないため、実測時間サンプルはありません。この点も、表示用の推定と、観測できた時間データを混同しないために明示しています。

## まとめ

Web Speech APIの単語境界だけでは、文字ごとの発音時刻は分かりません。それでも、単語を1要素のまま残し、CSSグラデーションの境界を動かし、次のイベントまでの表示を控えめに予測すれば、単語の内側を進む字幕UIは作れます。

実装とデモは以下です。

- GitHub: https://github.com/speech-caption/glyphflow
- npm: https://www.npmjs.com/package/@enumura/glyphflow
- Demo: https://speech-caption.github.io/glyphflow/
