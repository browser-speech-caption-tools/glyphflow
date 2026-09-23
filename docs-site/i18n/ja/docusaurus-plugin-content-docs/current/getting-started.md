---
sidebar_position: 2
title: 使い始める
---

## インストール

```sh
npm install @enumura/glyphflow
```

アプリケーションのエントリーポイントからAPIとstylesheetをimportします。

```ts
import { createKaraokeNarrator, getSpeechSynthesisSupport } from "@enumura/glyphflow";
import "@enumura/glyphflow/styles.css";
```

## 字幕の描画先を用意する

`target`に渡した要素へ字幕用spanを描画します。

```html
<p id="caption" aria-live="polite"></p>
```

コントロールを有効にする前に対応状況を確認できます。この関数はSSR環境でも安全にimport・呼び出しできます。

```ts
const support = getSpeechSynthesisSupport();

if (!support.supported) {
  console.log(support.reason);
}
```

## 文章を読み上げる

```ts
const target = document.querySelector<HTMLElement>("#caption");

if (!target) throw new Error("Caption target is missing");

const narrator = createKaraokeNarrator({
  text: "Read each word as its highlight moves across the letters.",
  target,
  lang: "en-US",
  rate: 1.2,
  onStateChange(state, detail) {
    if (state === "unsupported") console.log(detail?.reason);
  },
});

narrator.speak();
```

`speak()`を再度呼ぶと現在のセッションをキャンセルして新しいセッションを開始します。UIを破棄するときは`destroy()`を呼んでください。

## voiceを選ぶ

ブラウザがvoice一覧を非同期で準備することがあります。そのため`getVoices()`は準備前には空配列を返します。`voiceschanged`イベントでUIを更新してください。

```ts
import { getVoices } from "@enumura/glyphflow";

function refreshVoices() {
  const englishVoices = getVoices().filter((voice) => voice.lang.startsWith("en"));
  // englishVoicesでselectなどのUIを更新します。
}

refreshVoices();
speechSynthesis.addEventListener("voiceschanged", refreshVoices);
```

選択した`SpeechSynthesisVoice`を`voice`として渡します。voiceの設定や保存は利用アプリケーションの責務です。
