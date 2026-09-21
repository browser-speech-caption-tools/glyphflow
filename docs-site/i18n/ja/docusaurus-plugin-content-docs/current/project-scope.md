---
sidebar_position: 8
title: プロジェクトの範囲
---

## v0.1の目的

GlyphFlowの役割は、ブラウザ標準の音声で英語テキストを読み上げ、読み上げ中の各単語を文字の内側で左から右へ連続的に塗り進めることです。

| 領域     | v0.1の範囲                                                |
| -------- | --------------------------------------------------------- |
| 音声     | ブラウザのWeb Speech API（`speechSynthesis`）             |
| 字幕     | 単語境界に合わせたCSSグラデーションによる単語内部のワイプ |
| 統合     | framework非依存のTypeScript DOM API。SSR importに対応     |
| 依存     | ランタイム依存ゼロ                                        |
| 初期対象 | Desktop Chrome、英語テキスト、単語境界を返すvoice         |

## 意図的な対象外

| 領域         | このライブラリの対象外                          |
| ------------ | ----------------------------------------------- |
| 音声処理     | 音声ファイル、MP3生成、forced alignment         |
| 外部サービス | サーバー、通信、外部AIモデル                    |
| 保存・分析   | データの保存や分析の収集を行わない              |
| 互換性       | すべてのブラウザ、OS、voice、言語への保証       |
| 音声品質     | 自然さ、voiceの可用性、境界イベントの挙動の改善 |

音声の自然さと境界イベントの挙動はブラウザとOSが提供するものであり、GlyphFlowが改善するものではありません。

## ロードマップ

| 検討項目                 | v0.1の状態   |
| ------------------------ | ------------ |
| framework adapter        | 未対応       |
| custom renderer          | 未対応       |
| voice互換性マトリクス    | 未対応       |
| テキストと提供音声の同期 | v0.1の対象外 |

## 開発コマンド

```sh
npm install
npm run lint
npm run format:check
npm test
npm run build
npm run demo
npm run docs:build
```
