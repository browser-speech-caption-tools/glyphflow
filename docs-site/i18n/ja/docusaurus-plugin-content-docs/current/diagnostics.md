---
sidebar_position: 4
title: 状態と診断
---

## 状態

`onStateChange`は次のいずれかを受け取ります。

| 状態          | 意味                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| `idle`        | インスタンスは作成済みですが、読み上げを開始していません。             |
| `starting`    | ブラウザに発話を依頼済みですが、再生開始の確認前です。                 |
| `speaking`    | 音声と字幕アニメーションが動作中です。                                 |
| `paused`      | 音声と字幕の進行が一時停止しています。                                 |
| `ended`       | 利用可能な単語境界を受け取って読み上げが終了しました。                 |
| `cancelled`   | `cancel()`で現在のセッションを停止しました。                           |
| `error`       | ブラウザがエラーを返したか、10秒以内に読み上げが開始されませんでした。 |
| `unsupported` | Web Speech APIがないか、単語境界なしで読み上げが終了しました。         |

```ts
const narrator = createKaraokeNarrator({
  text,
  target,
  onStateChange(state, detail) {
    status.textContent = detail?.reason ?? state;
  },
});
```

## タイミングサンプル

`onWordTiming`は、次の単語境界によって前の単語の時間が計測可能になった時点でサンプルを返します。

```ts
onWordTiming(sample, diagnostics) {
  console.table({
    word: sample.word,
    predictedMs: sample.predictedMs,
    actualMs: sample.actualMs,
    errorMs: sample.errorMs,
  });
}
```

最後の単語には後続境界がないため、計測サンプルはありません。境界が欠落・スキップされた区間もサンプルになりません。

後続境界が遅い場合、GlyphFlowは予測を使って表示を次の単語へ進めることがあります。表示は止まりませんが、実測時間を作ることはありません。ライブデモでは全単語と、計測できなかった単語を確認できます。

`getDiagnostics()`はvoice情報、rate、サンプル、平均絶対誤差、現在のミリ秒/単位推定値、受け取った境界数を返します。ライブラリ自身がデータを収集・保存することはありません。
