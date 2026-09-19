import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Speech-aware captions for the browser"
      description="A TypeScript library that speaks text with Web Speech API and smoothly fills caption words as they are spoken."
    >
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Browser-native speech captions</p>
            <h1>Text that keeps up with speech.</h1>
            <p className={styles.lede}>
              GlyphFlow speaks text with the Web Speech API and smoothly fills each
              caption word from left to right as it is spoken.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to="/docs/getting-started">
                Get started
              </Link>
              <a className={styles.secondaryAction} href="https://github.com/enumura1/glyphflow">
                View on GitHub
              </a>
            </div>
            <pre className={styles.install}>
              <code>npm install @enumura1/glyphflow</code>
            </pre>
          </div>

          <div className={styles.preview} aria-label="Animated caption preview">
            <span className={styles.previewLabel}>Animated text wipe</span>
            <p className={styles.caption} aria-hidden="true">
              <span className={`${styles.word} ${styles.wordOne}`}>Read</span>{" "}
              <span className={`${styles.word} ${styles.wordTwo}`}>with</span>{" "}
              <span className={`${styles.word} ${styles.wordThree}`}>flow.</span>
            </p>
            <p className={styles.previewNote}>
              A visual preview. Actual timing follows browser word-boundary events.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>Why GlyphFlow</p>
          <h2>Small surface area, deliberate behavior.</h2>
          <div className={styles.cardGrid}>
            <article>
              <h3>Continuous inside-word motion</h3>
              <p>CSS gradients animate through the letters. No character-by-character DOM splitting.</p>
            </article>
            <article>
              <h3>No service to operate</h3>
              <p>No audio files, servers, models, analytics, storage, or runtime dependencies.</p>
            </article>
            <article>
              <h3>Observed timing, then prediction</h3>
              <p>It learns from received word boundaries and uses a bounded prediction between them.</p>
            </article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.flowSection}`}>
          <p className={styles.eyebrow}>How it works</p>
          <h2>Speech stays the source of truth.</h2>
          <ol className={styles.steps}>
            <li><strong>Speak text</strong><span>The browser speaks an ordinary `SpeechSynthesisUtterance`.</span></li>
            <li><strong>Receive word boundaries</strong><span>GlyphFlow maps each boundary to its original word position.</span></li>
            <li><strong>Fill the current word</strong><span>A lightweight model moves the gradient until the next boundary arrives.</span></li>
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.callout}>
            <div>
              <p className={styles.eyebrow}>Support target</p>
              <h2>Chrome Desktop, English text, and voices that emit word boundaries.</h2>
              <p>Voice behavior depends on the browser and OS. GlyphFlow reports an unsupported state when usable boundaries are unavailable.</p>
            </div>
            <Link className={styles.secondaryAction} to="/docs/browser-support">Browser support</Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
