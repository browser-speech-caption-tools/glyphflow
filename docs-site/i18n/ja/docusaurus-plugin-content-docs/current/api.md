---
sidebar_position: 6
title: API
---

## `createKaraokeNarrator(options)`

`speak()`、`pause()`、`resume()`、`cancel()`、`getDiagnostics()`、`destroy()`を持つオブジェクトを返します。

| オプション                | 説明                                                   |
| ------------------------- | ------------------------------------------------------ |
| `text`                    | 読み上げ・描画する元テキスト。                         |
| `target`                  | GlyphFlowが内容を描画する要素。                        |
| `voice`                   | 任意のブラウザ`SpeechSynthesisVoice`。                 |
| `lang`                    | 任意のBCP 47言語タグ（例：`en-US`）。                  |
| `rate`, `pitch`, `volume` | Web Speech utteranceの設定。                           |
| `className`               | スタイル用にtargetへ追加するクラス。                   |
| `onStateChange`           | 状態遷移と任意の理由・診断情報を受け取るコールバック。 |
| `onWordTiming`            | 実測タイミングと診断情報を受け取るコールバック。       |

`speak()`は既存セッションを置き換えます。`pause()`と`resume()`は現在のセッションを操作します。`cancel()`は停止して`cancelled`を通知します。`destroy()`は処理を停止し、targetを空にしてアニメーションを解放します。破棄後のインスタンスは再利用しないでください。

`onStateChange`は`idle`、`starting`、`speaking`、`paused`、`ended`、`cancelled`、`error`、`unsupported`を通知します。`starting`はブラウザの`start`イベントを待つ状態です。10秒以内に開始されないvoiceは`error`になります。利用可能な単語境界がないまま終了したvoiceは`unsupported`になります。タイミングの詳細は[状態と診断](./diagnostics)を参照してください。

## 対応状況ヘルパー

`getSpeechSynthesisSupport()`はSSR環境でも安全です。`getVoices()`はブラウザがvoice一覧を準備するまで空配列を返します。利用アプリケーションでは`voiceschanged`を監視できます。

## スタイル

標準CSSはpackage importに含まれます。`--kn-highlight-color`、`--kn-unhighlight-color`、フォント、サイズ、余白は、GlyphFlowの後からアプリケーション側のCSSを読み込んで上書きできます。
