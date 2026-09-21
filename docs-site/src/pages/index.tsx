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
        lede: "Web Speech APIのための小さなTypeScriptライブラリです。ブラウザの音声に合わせ、読み上げ中の単語を文字の内側で左から右へ連続的に塗り進めます。",
        start: "使い始める",
        github: "GitHubで見る",
        visualEyebrow: "見た目の仕組み",
        visualHeading: "単語はひとつのまま、色だけが文字の形の中を進みます。",
        visualBody:
          "アクティブな単語は単一のDOM spanです。GlyphFlowが変更するのは --kn-progress だけなので、単語全体を一度に切り替えるのではなく、ハイライトが文字の形の中を移動します。",
        speakingNow: "読み上げ中",
        notSpoken: "未読み上げ",
        spoken: "読み上げ済み",
        syncEyebrow: "音声を基準にする",
        syncHeading: "ブラウザが単語を話し始めるタイミングが、字幕を進める基準です。",
        syncBody:
          "ブラウザが単語の開始を通知すると、その単語だけが文字の内側でワイプを始めます。次の単語の開始通知を受けると、前の単語を完了します。音声の実際のタイミングに、表示の切り替わりを合わせる仕組みです。",
        syncStart: "ブラウザが「letter」の開始を通知",
        syncNext: "ブラウザが次の単語の開始を通知",
        syncComplete: "「letter」のワイプを完了",
        syncNote: "音声の実際の単語開始が、字幕を進める基準です。",
        calibrationEyebrow: "次のワイプを補正する",
        calibrationHeading: "実測した時間を、後続のワイプ速度に少しだけ反映します。",
        calibrationBody:
          "単語が始まった時点では、終わる時刻はまだ分かりません。GlyphFlowはまず綴りから仮の速度でワイプを始め、次の単語が始まった時に直前の単語の所要時間を確定します。その実測値の20%だけを、同じ再生中の後続予測へ反映します。",
        estimateTitle: "まず予測して開始",
        estimateBody: "綴りから仮の所要時間を見積もり、文字内ワイプを動かします。",
        measureTitle: "次の単語で実測",
        measureBody: "次の単語が始まると、直前の単語にかかった時間が確定します。",
        adaptTitle: "後続のワイプを微調整",
        adaptBody: "実測値の20%を取り込み、次の予測を少しだけ補正します。",
        calibrationNote: "同じ再生の中では、文章が長いほど実測の材料が増えます。",
      }
    : {
        title: "Speech-aware captions for the browser",
        description:
          "A TypeScript library that speaks text with Web Speech API and smoothly fills caption words as they are spoken.",
        eyebrow: "Speech-aware caption animation",
        heading: "Captions that fill inside each spoken word.",
        lede: "A small TypeScript library for the Web Speech API: as the browser speaks, the active word fills continuously from left to right inside its letters.",
        start: "Get started",
        github: "View on GitHub",
        visualEyebrow: "The visual",
        visualHeading:
          "One word stays whole while its colour moves through the glyphs.",
        visualBody:
          "The active word is a single DOM span. GlyphFlow changes only --kn-progress, so the highlight travels through letter shapes instead of flashing an entire word at once.",
        speakingNow: "speaking now",
        notSpoken: "not yet spoken",
        spoken: "already spoken",
        syncEyebrow: "The voice is the clock",
        syncHeading: "The browser's word starts are what move the caption forward.",
        syncBody:
          "When the browser reports that a word has started, only that word begins its inside-letter wipe. When it reports the following word, GlyphFlow completes the prior word. The caption changes on the voice's actual timing.",
        syncStart: "Browser reports “letter” has started",
        syncNext: "Browser reports the next word has started",
        syncComplete: "Complete the “letter” wipe",
        syncNote: "Actual word starts from the voice are the source of truth.",
        calibrationEyebrow: "Tune the next wipe",
        calibrationHeading: "Measured time slightly adjusts later wipe speeds.",
        calibrationBody:
          "A word's end time is unknown when it begins. GlyphFlow starts with a spelling-based estimate, then confirms the previous word's duration when the next word starts. It applies only 20% of that measurement to later predictions in the same narration.",
        estimateTitle: "Start with an estimate",
        estimateBody:
          "Estimate a duration from the spelling, then begin the inside-letter wipe.",
        measureTitle: "Measure at the next word",
        measureBody:
          "When the next word begins, the prior word's duration becomes known.",
        adaptTitle: "Gently tune later wipes",
        adaptBody:
          "Use 20% of the measurement to make the next estimate a little better.",
        calibrationNote:
          "Longer passages provide more measurements within the same narration.",
      };

  return (
    <Layout title={copy.title} description={copy.description}>
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
            <p className={styles.eyebrow}>{copy.syncEyebrow}</p>
            <h2>{copy.syncHeading}</h2>
            <p>{copy.syncBody}</p>
          </div>
          <div className={styles.syncStage} aria-label={copy.syncHeading}>
            <div className={styles.syncEvent}>
              <SpeechIcon /> <span>{copy.syncStart}</span>
            </div>
            <div className={styles.syncSentence} aria-hidden="true">
              <span>Every</span>
              <strong>letter</strong>
              <span>follows</span>
              <span>the voice.</span>
            </div>
            <div className={styles.syncOutcome}>
              <span>{copy.syncNext}</span>
              <strong>{copy.syncComplete}</strong>
            </div>
            <p>{copy.syncNote}</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.story}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>{copy.calibrationEyebrow}</p>
            <h2>{copy.calibrationHeading}</h2>
            <p>{copy.calibrationBody}</p>
          </div>
          <div className={styles.calibrationStage} aria-label={copy.calibrationHeading}>
            <ol className={styles.calibrationSteps}>
              <li>
                <span>1</span>
                <div>
                  <strong>{copy.estimateTitle}</strong>
                  <p>{copy.estimateBody}</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>{copy.measureTitle}</strong>
                  <p>{copy.measureBody}</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>{copy.adaptTitle}</strong>
                  <p>{copy.adaptBody}</p>
                </div>
              </li>
            </ol>
            <p className={styles.calibrationNote}>{copy.calibrationNote}</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
