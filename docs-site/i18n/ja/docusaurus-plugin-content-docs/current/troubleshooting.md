---
sidebar_position: 7
title: トラブルシューティング
---

## voice選択欄にvoiceが表示されない

ブラウザはvoice一覧を非同期で準備することがあります。最初に`getVoices()`を呼び、`voiceschanged`イベントを受けてUIを更新してください。最初に空配列が返るのは正常です。

## `unsupported`で終了する

Web Speech APIに対応していても、選択したvoiceが利用可能な単語境界を返さないことがあります。この状態は、GlyphFlowがそのvoiceの単語ワイプを同期できないことを示します。Desktop Chromeで別の英語voiceを試してください。

## 音声は聞こえるが字幕が動かない

`@enumura1/glyphflow/styles.css`をimportしたか、選択したvoiceが単語境界を返すかを確認してください。音声終了後に`unsupported`になる場合は境界がないvoiceです。

## 音声が開始されない

ブラウザによってはユーザー操作から音声を開始する必要があります。クリックやキーボードイベントから`narrator.speak()`を呼び、`getSpeechSynthesisSupport()`を確認してください。`starting`のまま10秒後に`error`になる場合、ブラウザが再生開始を確認できていません。同じブラウザで直接Web Speechを試し、別ブラウザやブラウザ再起動も確認してください。

直接確認するには`npm run demo`を実行し、`http://127.0.0.1:5173/speech-probe.html`を開きます。voiceを選んで**Speak directly**を押すと、GlyphFlowを経由せず、ブラウザの`start`、`boundary`、`end`、`error`イベントを表示します。`speaking=true`のまま`start`も音声もない場合、ブラウザの音声エンジンがutteranceを開始していません。

## 別の音声機能が停止する

ブラウザの音声キューは共有です。GlyphFlowがセッションを置き換えたりキャンセルしたりすると、別機能の音声も停止する可能性があります。利用アプリケーション側で音声の所有権を調整してください。

## ワイプの見た目が正しくない

まず付属stylesheetを使い、アプリケーションのCSSが`background-clip`、`-webkit-text-fill-color`、`--kn-progress`を上書きしていないか確認してください。[カスタマイズ](./customization)を正常系の基準にできます。

## バグを見つけた

このドキュメントと異なる挙動を見つけた場合は、[GitHub Issueを作成してください](https://github.com/speech-caption-tools/glyphflow/issues/new?template=bug_report.yml)。作成前に、既存Issueとこのトラブルシューティングを確認してください。再現手順、期待する挙動と実際の挙動、GlyphFlowのバージョン、ブラウザとOSのバージョン、選択したvoiceの情報、関連する状態変化や診断情報を記載してください。最小のコード例があると調査しやすくなります。公開Issueに個人情報、秘密情報、非公開の入力テキストを含めないでください。完全な記載項目は[コントリビューションガイド](https://github.com/speech-caption-tools/glyphflow/blob/main/CONTRIBUTING.md)を参照してください。
