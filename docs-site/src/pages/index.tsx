import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import HeroSpeech from "../components/HeroSpeech";
import LiveDemo from "../components/LiveDemo";
import styles from "./index.module.css";

function SpeechIcon(): JSX.Element {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path {...common} d="M5 10v4M9 7v10M13 5v14M17 8v8M21 10v4" />
    </svg>
  );
}

export default function Home(): JSX.Element {
  const isJapanese = useDocusaurusContext().i18n.currentLocale === "ja";
  const copy = isJapanese
    ? {
        title: "ブラウザ音声に連動する字幕アニメーション",
        description:
          "Web Speech APIでテキストを読み上げ、発話中の単語を文字の内側で連続的に塗り進めるTypeScriptライブラリです。",
        eyebrow: "音声に連動する字幕アニメーション",
        heading: "発話中の単語を、文字の内側から塗り進める。",
        lede:
          "Web Speech APIのための小さなTypeScriptライブラリです。ブラウザの音声に合わせ、読み上げ中の単語を文字の内側で左から右へ連続的に塗り進めます。",
        start: "使い始める",
        github: "GitHubで見る",
        visualEyebrow: "見た目の仕組み",
        visualHeading: "単語はひとつのまま、色だけが文字の形の中を進みます。",
        visualBody:
          "アクティブな単語は単一のDOM spanです。GlyphFlowが変更するのは --kn-progress だけなので、単語全体を一度に切り替えるのではなく、ハイライトが文字の形の中を移動します。",
        speakingNow: "読み上げ中",
        notSpoken: "未読み上げ",
        spoken: "読み上げ済み",
        measurementEyebrow: "計測の仕組み",
        measurementHeading: "次の単語境界で、動きは実測の時間データになります。",
        measurementBody:
          "ブラウザが次の単語を開始した時点で、GlyphFlowは前の単語のワイプを完了し、実測時間を記録します。この表はシミュレーションではなく、onWordTimingで取得できるデータと同じ形です。",
        boundary: "境界イベント",
        completed: "完了した単語",
        observed: "実測値",
        measurementNote: "次の音声イベントが、直前の単語の時間を確定させます。",
        adjustmentEyebrow: "予測の調整",
        adjustmentHeading: "実際のイベントの合間も、予測がワイプを動かし続けます。",
        adjustmentBody:
          "次の単語境界が届くまで、軽量な綴りの推定でグラデーションを94%まで進めます。実測された各単語がそのセッションの時間推定を更新するため、後続の単語は選択したvoiceのリズムにより近づきます。",
        milliseconds: "1単位あたりのミリ秒",
        predicted: "予測",
        nextWord: "次の単語が開始",
        adapts: "次のワイプへ反映",
      }
    : {
        title: "Speech-aware captions for the browser",
        description:
          "A TypeScript library that speaks text with Web Speech API and smoothly fills caption words as they are spoken.",
        eyebrow: "Speech-aware caption animation",
        heading: "Captions that fill inside each spoken word.",
        lede:
          "A small TypeScript library for the Web Speech API: as the browser speaks, the active word fills continuously from left to right inside its letters.",
        start: "Get started",
        github: "View on GitHub",
        visualEyebrow: "The visual",
        visualHeading: "One word stays whole while its colour moves through the glyphs.",
        visualBody:
          "The active word is a single DOM span. GlyphFlow changes only --kn-progress, so the highlight travels through letter shapes instead of flashing an entire word at once.",
        speakingNow: "speaking now",
        notSpoken: "not yet spoken",
        spoken: "already spoken",
        measurementEyebrow: "The measurement",
        measurementHeading: "The next word boundary turns motion into a real timing sample.",
        measurementBody:
          "When the browser starts the following word, GlyphFlow completes the prior wipe and records its observed duration. The table is not simulated: it is the same sample shape exposed by onWordTiming.",
        boundary: "boundary",
        completed: "completed word",
        observed: "observed",
        measurementNote: "The next voice event makes the previous word's timing factual.",
        adjustmentEyebrow: "The adjustment",
        adjustmentHeading: "Prediction keeps the wipe moving between real events.",
        adjustmentBody:
          "Before the next boundary arrives, a lightweight spelling estimate advances the gradient toward 94%. Each observed word updates the session's timing estimate, so later words better match the selected voice's rhythm.",
        milliseconds: "milliseconds per unit",
        predicted: "predicted",
        nextWord: "next word begins",
        adapts: "the next wipe adapts",
      };

  return (
    <Layout
      title={copy.title}
      description={copy.description}
    >
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1>{copy.heading}</h1>
            <p className={styles.lede}>{copy.lede}</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to="/docs/getting-started">
                {copy.start}
              </Link>
              <a
                className={styles.secondaryAction}
                href="https://github.com/enumura1/glyphflow"
              >
                {copy.github}
              </a>
            </div>
            <pre className={styles.install}>
              <code>npm install @enumura1/glyphflow</code>
            </pre>
          </div>

          <HeroSpeech />
        </section>

        <LiveDemo />

        <section className={`${styles.section} ${styles.story}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>{copy.visualEyebrow}</p>
            <h2>{copy.visualHeading}</h2>
            <p>{copy.visualBody}</p>
          </div>
          <div className={styles.glyphStage} aria-label={copy.visualHeading}>
            <div className={styles.stageLabel}>
              <SpeechIcon /> {copy.speakingNow}
            </div>
            <strong className={styles.stageWord}>caption</strong>
            <div className={styles.stageLegend} aria-hidden="true">
              <span>{copy.notSpoken}</span>
              <i />
              <span>{copy.spoken}</span>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.story} ${styles.storyReverse}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>{copy.measurementEyebrow}</p>
            <h2>{copy.measurementHeading}</h2>
            <p>{copy.measurementBody}</p>
          </div>
          <div className={styles.timingStage} aria-label={copy.measurementHeading}>
            <div className={styles.boundaryEvent}>
              <SpeechIcon /> <span>{copy.boundary}</span>
              <strong>charIndex 18</strong>
            </div>
            <div className={styles.sampleRow}>
              <span>{copy.completed}</span>
              <strong>caption</strong>
              <span>{copy.observed}</span>
              <strong>428 ms</strong>
            </div>
            <p>{copy.measurementNote}</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.story}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>{copy.adjustmentEyebrow}</p>
            <h2>{copy.adjustmentHeading}</h2>
            <p>{copy.adjustmentBody}</p>
          </div>
          <div className={styles.adjustStage} aria-label={copy.adjustmentHeading}>
            <div className={styles.adjustHeader}>
              <span>{copy.milliseconds}</span>
              <strong>155 → 149</strong>
            </div>
            <div className={styles.adjustLine} aria-hidden="true">
              <span className={styles.predictionMark}>{copy.predicted}</span>
              <span className={styles.observedMark}>{copy.observed}</span>
              <i />
            </div>
            <div className={styles.adjustFooter}>
              <span>{copy.nextWord}</span>
              <strong>{copy.adapts}</strong>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
