---
sidebar_position: 5
title: サンプル
---

## インタラクティブデモ

リポジトリの`examples/basic`にブラウザデモがあります。テキストエリア、voice選択、rate操作、読み上げボタン、大きな字幕、タイミング表、診断情報のダウンロードを備えています。

```sh
npm install
npm run demo
```

Viteが表示するローカルURLを開き、英語voiceを選んで**Speak**を押してください。

## コントロール

字幕要素が表示されている間はnarratorインスタンスを保持し、メソッドにUI操作を接続します。

```ts
speakButton.addEventListener("click", () => narrator.speak());
pauseButton.addEventListener("click", () => narrator.pause());
resumeButton.addEventListener("click", () => narrator.resume());
cancelButton.addEventListener("click", () => narrator.cancel());
```

## 診断情報を出力する

GlyphFlowは保存や分析を行いません。セッション記録が必要な場合は、利用アプリケーション側で診断情報を保存してください。

```ts
downloadButton.addEventListener("click", () => {
  const json = JSON.stringify(narrator.getDiagnostics(), null, 2);
  const file = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "glyphflow-diagnostics.json";
  link.click();
  URL.revokeObjectURL(url);
});
```

## コンポーネントUIのライフサイクル

v0.1ではframework adapterを提供していません。コンポーネントUIではtargetが存在してからnarratorを作成し、コンポーネントのcleanup時に破棄してください。

```ts
const narrator = createKaraokeNarrator({ text, target });

// 所有するコンポーネントや画面を削除するとき
narrator.destroy();
```
