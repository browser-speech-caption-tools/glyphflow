import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import LiveDemo from "../components/LiveDemo";
import styles from "./index.module.css";

function Icon({
  name,
}: {
  name: "motion" | "browser" | "timing" | "wave";
}): JSX.Element {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  if (name === "motion") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M4 17 9 12l3 3 8-9" />
        <path {...common} d="M16 6h4v4" />
      </svg>
    );
  }
  if (name === "browser") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect {...common} x="3" y="4" width="18" height="16" rx="2" />
        <path {...common} d="M3 8h18M7 6h.01M10 6h.01" />
      </svg>
    );
  }
  if (name === "timing") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle {...common} cx="12" cy="12" r="8" />
        <path {...common} d="M12 8v4l3 2" />
      </svg>
    );
  }
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
            <p className={styles.eyebrow}>Web Speech API + text animation</p>
            <h1>Animate text as the browser speaks.</h1>
            <p className={styles.lede}>
              GlyphFlow connects browser speech synthesis to a smooth, word-by-word text
              wipe. Each spoken word fills from left to right in real time.
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

          <div className={styles.preview} aria-label="Animated caption preview">
            <div className={styles.previewTop}>
              <span className={styles.previewLabel}>
                <Icon name="wave" /> Speech input
              </span>
              <span className={styles.boundary}>word boundary · 420ms</span>
            </div>
            <p className={styles.caption} aria-hidden="true">
              <span className={`${styles.word} ${styles.wordOne}`}>Speech</span>{" "}
              <span className={`${styles.word} ${styles.wordTwo}`}>drives</span>{" "}
              <span className={`${styles.word} ${styles.wordThree}`}>text.</span>
            </p>
            <div className={styles.timeline} aria-hidden="true">
              <span className={styles.timelineActive} />
              <span />
              <span />
              <span />
            </div>
            <p className={styles.previewNote}>
              Speech-driven text animation · visual preview
            </p>
          </div>
        </section>

        <LiveDemo />

        <section className={styles.section}>
          <p className={styles.eyebrow}>Why GlyphFlow</p>
          <h2>Small surface area, deliberate behavior.</h2>
          <div className={styles.cardGrid}>
            <article>
              <span className={styles.icon}>
                <Icon name="motion" />
              </span>
              <h3>Continuous inside-word motion</h3>
              <p>
                CSS gradients animate through the letters. No character-by-character DOM
                splitting.
              </p>
            </article>
            <article>
              <span className={styles.icon}>
                <Icon name="browser" />
              </span>
              <h3>No service to operate</h3>
              <p>
                No audio files, servers, models, analytics, storage, or runtime
                dependencies.
              </p>
            </article>
            <article>
              <span className={styles.icon}>
                <Icon name="timing" />
              </span>
              <h3>Observed timing, then prediction</h3>
              <p>
                It learns from received word boundaries and uses a bounded prediction
                between them.
              </p>
            </article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.flowSection}`}>
          <p className={styles.eyebrow}>How it works</p>
          <h2>Speech stays the source of truth.</h2>
          <ol className={styles.steps}>
            <li>
              <strong>Speak text</strong>
              <span>The browser speaks an ordinary `SpeechSynthesisUtterance`.</span>
            </li>
            <li>
              <strong>Receive word boundaries</strong>
              <span>GlyphFlow maps each boundary to its original word position.</span>
            </li>
            <li>
              <strong>Fill the current word</strong>
              <span>
                A lightweight model moves the gradient until the next boundary arrives.
              </span>
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <div className={styles.callout}>
            <div>
              <p className={styles.eyebrow}>Support target</p>
              <h2>
                Chrome Desktop, English text, and voices that emit word boundaries.
              </h2>
              <p>
                Voice behavior depends on the browser and OS. GlyphFlow reports an
                unsupported state when usable boundaries are unavailable.
              </p>
            </div>
            <Link className={styles.secondaryAction} to="/docs/browser-support">
              Browser support
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
