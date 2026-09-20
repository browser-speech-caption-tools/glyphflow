import Link from "@docusaurus/Link";
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
  return (
    <Layout
      title="Speech-aware captions for the browser"
      description="A TypeScript library that speaks text with Web Speech API and smoothly fills caption words as they are spoken."
    >
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Speech-aware caption animation</p>
            <h1>Captions that fill inside each spoken word.</h1>
            <p className={styles.lede}>
              A small TypeScript library for the Web Speech API: as the browser speaks,
              the active word fills continuously from left to right inside its letters.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to="/docs/getting-started">
                Get started
              </Link>
              <a
                className={styles.secondaryAction}
                href="https://github.com/enumura1/glyphflow"
              >
                View on GitHub
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
            <p className={styles.eyebrow}>The visual</p>
            <h2>One word stays whole while its colour moves through the glyphs.</h2>
            <p>
              The active word is a single DOM span. GlyphFlow changes only
              <code> --kn-progress</code>, so the highlight travels through letter
              shapes instead of flashing an entire word at once.
            </p>
          </div>
          <div className={styles.glyphStage} aria-label="Animated glyph interior wipe">
            <div className={styles.stageLabel}>
              <SpeechIcon /> speaking now
            </div>
            <strong className={styles.stageWord}>caption</strong>
            <div className={styles.stageLegend} aria-hidden="true">
              <span>not yet spoken</span>
              <i />
              <span>already spoken</span>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.story} ${styles.storyReverse}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>The measurement</p>
            <h2>The next word boundary turns motion into a real timing sample.</h2>
            <p>
              When the browser starts the following word, GlyphFlow completes the prior
              wipe and records its observed duration. The table is not simulated: it is
              the same sample shape exposed by <code>onWordTiming</code>.
            </p>
          </div>
          <div className={styles.timingStage} aria-label="Word timing sample example">
            <div className={styles.boundaryEvent}>
              <SpeechIcon /> <span>boundary</span>
              <strong>charIndex 18</strong>
            </div>
            <div className={styles.sampleRow}>
              <span>completed word</span>
              <strong>caption</strong>
              <span>observed</span>
              <strong>428 ms</strong>
            </div>
            <p>The next voice event makes the previous word&apos;s timing factual.</p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.story}`}>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>The adjustment</p>
            <h2>Prediction keeps the wipe moving between real events.</h2>
            <p>
              Before the next boundary arrives, a lightweight spelling estimate advances
              the gradient toward 94%. Each observed word updates the session&apos;s
              timing estimate, so later words better match the selected voice&apos;s
              rhythm.
            </p>
          </div>
          <div className={styles.adjustStage} aria-label="Timing adjustment example">
            <div className={styles.adjustHeader}>
              <span>milliseconds per unit</span>
              <strong>155 → 149</strong>
            </div>
            <div className={styles.adjustLine} aria-hidden="true">
              <span className={styles.predictionMark}>predicted</span>
              <span className={styles.observedMark}>observed</span>
              <i />
            </div>
            <div className={styles.adjustFooter}>
              <span>next word begins</span>
              <strong>the next wipe adapts</strong>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
