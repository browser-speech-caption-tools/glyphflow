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
            <p className={styles.eyebrow}>Web Speech API + continuous glyph wipe</p>
            <h1>Hear the word. Watch it fill from first letter to last.</h1>
            <p className={styles.lede}>
              GlyphFlow speaks English text in the browser while a CSS gradient travels
              continuously through the letters of the spoken word. Word boundaries then
              calibrate the timing for what comes next.
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
              <span className={styles.boundary}>word boundary → timing update</span>
            </div>
            <p className={styles.caption} aria-hidden="true">
              <span className={`${styles.word} ${styles.wordOne}`}>
                synchronization
              </span>
            </p>
            <div className={styles.timeline} aria-hidden="true">
              <span className={styles.timelineActive} />
            </div>
            <p className={styles.previewNote}>
              One continuous boundary moves through the glyphs — not a whole-word flash.
            </p>
          </div>
        </section>

        <LiveDemo />

        <section className={`${styles.section} ${styles.explainer}`}>
          <div className={styles.explainerCopy}>
            <p className={styles.eyebrow}>The signal behind the wipe</p>
            <h2>One boundary starts the fill. The next boundary teaches it.</h2>
            <p>
              The browser voice remains the clock. GlyphFlow does not split a word into
              letters or guess phonemes: it moves one gradient boundary through the
              glyphs until the voice reports the next word.
            </p>
          </div>

          <div
            className={styles.signalDiagram}
            aria-label="How a spoken word becomes a glyph wipe"
          >
            <article className={styles.signalSource}>
              <span className={styles.diagramLabel}>
                <Icon name="wave" /> Browser voice
              </span>
              <strong>“caption” begins</strong>
              <p>Web Speech speaks the original text.</p>
            </article>
            <div className={styles.diagramConnector} aria-hidden="true">
              <span />
            </div>
            <article className={styles.signalBoundary}>
              <span className={styles.diagramLabel}>Word boundary</span>
              <strong>charIndex: 12</strong>
              <p>The voice tells us which word just started.</p>
            </article>
            <div className={styles.diagramConnector} aria-hidden="true">
              <span />
            </div>
            <article className={styles.signalWipe}>
              <span className={styles.diagramLabel}>Inside the glyphs</span>
              <strong className={styles.diagramWord}>caption</strong>
              <p>
                A continuous CSS gradient advances — one boundary, not seven letter
                elements.
              </p>
            </article>
            <div className={styles.diagramConnector} aria-hidden="true">
              <span />
            </div>
            <article className={styles.signalLearn}>
              <span className={styles.diagramLabel}>Next word</span>
              <strong>prediction adjusts</strong>
              <p>Observed duration refines the following wipe.</p>
            </article>
          </div>

          <ul className={styles.operatingNotes}>
            <li>
              <strong>Browser-native</strong>
              <span>Web Speech API only; no server or audio file.</span>
            </li>
            <li>
              <strong>Continuous, bounded motion</strong>
              <span>Progress eases toward 94% and waits near 98.5% for reality.</span>
            </li>
            <li>
              <strong>No hidden state</strong>
              <span>
                No storage, network calls, models, analytics, or runtime dependencies.
              </span>
            </li>
          </ul>
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
