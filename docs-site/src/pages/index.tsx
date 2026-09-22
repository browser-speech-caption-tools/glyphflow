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
        syncLabel: "音声と字幕の同期",
        syncFirst: "音声が「Every」を読み始める",
        syncSecond: "「letter」の開始で、Everyが完了",
        syncThird: "「follows」の開始で、letterが完了",
        syncNote:
          "次の単語が話し始められるたびに、前の単語を完了し、現在の単語だけを文字の内側で塗り進めます。",
        calibrationEyebrow: "次のワイプを補正する",
        calibrationHeading: "話す速さに合わせて、次のワイプを少しずつ整えます。",
        calibrationBody:
          "単語が始まった時点では、終わる正確な時刻はまだ分かりません。GlyphFlowは次の単語が始まるまで、いったんおおよその速さで文字内ワイプを動かします。次の単語が始まると前の単語にかかった時間が分かるため、後ろの単語の動きを少し合わせます。",
        currentWord: "いま読んでいる単語",
        currentBody: "初めはおおよその速さで、文字の内側を塗り進めます。",
        nextWordStarts: "次の単語が始まる",
        measuredTime: "前の単語にかかった実際の時間が分かる",
        nextWord: "次の単語",
        nextBody: "分かった時間を少しだけ反映して、次のワイプを始めます。",
        calibrationNote:
          "これは文字ごとの発音に合わせる機能ではありません。ブラウザが単語の開始を知らせるvoiceで動きます。",
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
        syncLabel: "Voice and caption in sync",
        syncFirst: "The voice begins “Every”",
        syncSecond: "“letter” begins; Every completes",
        syncThird: "“follows” begins; letter completes",
        syncNote:
          "Each next-word start completes the prior word and begins the inside-letter wipe for the current one.",
        calibrationEyebrow: "Tune the next wipe",
        calibrationHeading: "Later wipes gently adapt to the voice's pace.",
        calibrationBody:
          "A word's exact end time is unknown when it starts. GlyphFlow moves the inside-letter wipe at an approximate pace until the next word begins. That next-word start reveals how long the prior word took, so later wipes can adjust a little to the voice's pace.",
        currentWord: "Word being spoken",
        currentBody: "Start the inside-letter wipe at an approximate pace.",
        nextWordStarts: "The next word begins",
        measuredTime: "The prior word's actual duration is now known",
        nextWord: "Next word",
        nextBody: "Use a small part of that result when starting the next wipe.",
        calibrationNote:
          "This is not character-by-character pronunciation timing. It works with voices that report word starts to the browser.",
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
                href="https://github.com/speech-caption-tools/glyphflow"
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
            <div className={styles.syncLabel}>
              <SpeechIcon /> {copy.syncLabel}
            </div>
            <ol className={styles.syncFrames}>
              <li>
                <p>{copy.syncFirst}</p>
                <div className={styles.syncWords} aria-hidden="true">
                  <strong data-state="active">Every</strong>
                  <span>letter</span>
                  <span>follows</span>
                  <span>the voice.</span>
                </div>
              </li>
              <li>
                <p>{copy.syncSecond}</p>
                <div className={styles.syncWords} aria-hidden="true">
                  <strong data-state="complete">Every</strong>
                  <strong data-state="active">letter</strong>
                  <span>follows</span>
                  <span>the voice.</span>
                </div>
              </li>
              <li>
                <p>{copy.syncThird}</p>
                <div className={styles.syncWords} aria-hidden="true">
                  <strong data-state="complete">Every</strong>
                  <strong data-state="complete">letter</strong>
                  <strong data-state="active">follows</strong>
                  <span>the voice.</span>
                </div>
              </li>
            </ol>
            <p className={styles.syncNote}>{copy.syncNote}</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.story}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>{copy.calibrationEyebrow}</p>
            <h2>{copy.calibrationHeading}</h2>
            <p>{copy.calibrationBody}</p>
          </div>
          <div className={styles.calibrationStage} aria-label={copy.calibrationHeading}>
            <div className={styles.calibrationDiagram}>
              <div className={styles.calibrationNode}>
                <span>{copy.currentWord}</span>
                <strong data-state="active">Every</strong>
                <p>{copy.currentBody}</p>
              </div>
              <div className={styles.calibrationArrow}>
                <div>
                  <SpeechIcon /> <span>{copy.nextWordStarts}</span>
                </div>
                <i aria-hidden="true" />
                <p>{copy.measuredTime}</p>
              </div>
              <div className={styles.calibrationNode}>
                <span>{copy.nextWord}</span>
                <strong data-state="active">letter</strong>
                <p>{copy.nextBody}</p>
              </div>
            </div>
            <p className={styles.calibrationNote}>{copy.calibrationNote}</p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
