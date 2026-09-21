---
sidebar_position: 1
title: はじめに
slug: /
hide_table_of_contents: true
---

<div className="gf-docs-hero">

# GlyphFlow ドキュメント

GlyphFlowは、Web Speech APIで文章を読み上げながら、読み上げ中の各単語を文字の内側で左から右へ連続的に塗り進めるTypeScriptライブラリです。

<div className="gf-docs-hero-actions">

<a href="./getting-started">使い始める</a>
<a href="./api">APIリファレンス</a>

</div>
</div>

## できること

<div className="gf-docs-feature-grid">

<div>

### 文字内部の連続ワイプ

各単語をCSSグラデーションで左から右へ塗り進めます。単語全体の色を一度に切り替えたり、1文字ずつDOM要素に分割したりしません。

</div>

<div>

### ブラウザ標準の音声

`window.speechSynthesis`だけを使います。音声ファイル、サーバー、外部モデル、保存領域、分析機能はありません。

</div>

<div>

### 読み上げ中に改善する時間予測

単語境界イベントから実測時間を取得します。境界の間は予測で動かし、実測値を後続の予測に反映します。

</div>

</div>

## クイックスタート

```sh
npm install @enumura1/glyphflow
```

```ts
import { createKaraokeNarrator } from "@enumura1/glyphflow";
import "@enumura1/glyphflow/styles.css";

const narrator = createKaraokeNarrator({
  text: "This is a caption.",
  target: document.querySelector("#caption")!,
  rate: 1,
});
narrator.speak();
```

ライブラリが`target`の中に字幕用のspanを描画します。CSSを一度importし、色や書体はアプリケーション側で上書きしてください。

## 向いている用途

読み上げに合わせた視覚的な読書ガイドが必要な、アクセシビリティ支援、語学学習、ガイド付き読書、製品デモ、インタラクティブ字幕などに使えます。

初期対応対象は、単語境界イベントを返すChrome Desktopの英語voiceです。音声ファイルの同期やforced alignmentは行いません。音声の可用性と自然さはブラウザ、OS、voiceに依存します。

## ドキュメントを読む

- [インストールと最初の読み上げ](./getting-started)
- [字幕のスタイル](./customization)
- [状態・タイミング・診断](./diagnostics)
- [APIリファレンス](./api)
- [ブラウザ対応と手動確認](./browser-support)
