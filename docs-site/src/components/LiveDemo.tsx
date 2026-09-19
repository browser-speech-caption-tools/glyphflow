import { useEffect, useRef, useState } from "react";

import {
  createKaraokeNarrator,
  getSpeechSynthesisSupport,
  type KaraokeNarrator,
  type NarratorState,
  type SpeechSynthesisSupport,
  type WordTimingSample,
} from "../../../src/index";
import "../../../src/styles.css";

import styles from "./LiveDemo.module.css";

const text = "Every spoken word fills from its first letter to its last.";

type LiveMetrics = {
  activeWord: string;
  progress: number;
  boundaries: number;
  samples: readonly WordTimingSample[];
};

const initialMetrics: LiveMetrics = {
  activeWord: "Waiting for speech",
  progress: 0,
  boundaries: 0,
  samples: [],
};

function WaveIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
    </svg>
  );
}

export default function LiveDemo(): JSX.Element {
  const targetRef = useRef<HTMLParagraphElement>(null);
  const narratorRef = useRef<KaraokeNarrator | null>(null);
  const [state, setState] = useState<NarratorState | "ready">("ready");
  const [support, setSupport] = useState<SpeechSynthesisSupport | null>(null);
  const [voiceLabel, setVoiceLabel] = useState("Browser default voice");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const startAtRef = useRef(0);

  useEffect(() => {
    setSupport(getSpeechSynthesisSupport());

    const updateVoiceLabel = () => {
      const defaultVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.default);
      setVoiceLabel(defaultVoice?.name ?? "Browser default voice");
    };

    updateVoiceLabel();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoiceLabel);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoiceLabel);
      narratorRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (state !== "speaking") return;

    let frame = 0;
    let lastRender = 0;
    const renderMetrics = (time: number) => {
      if (time - lastRender >= 80) {
        lastRender = time;
        const words = Array.from(
          targetRef.current?.querySelectorAll<HTMLElement>(".kn-word") ?? [],
        );
        const active = words.find((word) => {
          const progress = Number.parseFloat(
            word.style.getPropertyValue("--kn-progress"),
          );
          return progress > 0 && progress < 100;
        });
        const diagnostics = narratorRef.current?.getDiagnostics();

        setElapsedMs(Math.max(0, performance.now() - startAtRef.current));
        setMetrics((previous) => ({
          activeWord: active?.textContent ?? previous.activeWord,
          progress: active
            ? Number.parseFloat(active.style.getPropertyValue("--kn-progress"))
            : previous.progress,
          boundaries: diagnostics?.receivedBoundaryEvents ?? previous.boundaries,
          samples: diagnostics?.samples ?? previous.samples,
        }));
      }
      frame = requestAnimationFrame(renderMetrics);
    };

    frame = requestAnimationFrame(renderMetrics);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  function speak(): void {
    const target = targetRef.current;
    if (!target || !support?.supported) return;

    narratorRef.current?.destroy();
    setMetrics(initialMetrics);
    setElapsedMs(0);
    startAtRef.current = performance.now();
    narratorRef.current = createKaraokeNarrator({
      text,
      target,
      lang: "en-US",
      rate: 1.05,
      className: styles.caption,
      onStateChange(nextState, detail) {
        setState(nextState);
        const diagnostics = detail?.diagnostics;
        if (diagnostics) {
          setMetrics((previous) => ({
            ...previous,
            boundaries: diagnostics.receivedBoundaryEvents,
            samples: diagnostics.samples,
          }));
        }
      },
      onWordTiming(_sample, diagnostics) {
        setMetrics((previous) => ({
          ...previous,
          boundaries: diagnostics.receivedBoundaryEvents,
          samples: diagnostics.samples,
        }));
      },
    });
    narratorRef.current.speak();
  }

  const latest = metrics.samples.at(-1);
  const isSpeaking = state === "speaking";

  return (
    <section className={styles.demo} aria-labelledby="live-demo-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Live timing demo</p>
          <h2 id="live-demo-heading">Hear the sentence. Watch the letters fill.</h2>
        </div>
        <span className={styles.state} data-state={state}>
          <WaveIcon /> {state}
        </span>
      </div>

      <p className={styles.description}>
        This runs GlyphFlow in the page using your browser&apos;s system voice. During
        speech, the active word fills continuously from left to right; each following
        boundary records an actual duration and tunes the next prediction.
      </p>

      {support === null ? (
        <p className={styles.unsupported}>Checking browser speech support…</p>
      ) : support.supported ? (
        <>
          <div className={styles.playback} data-speaking={isSpeaking}>
            <div className={styles.voice}>
              <WaveIcon />
              <div>
                <span>Voice output</span>
                <strong>{voiceLabel}</strong>
              </div>
            </div>
            <span className={styles.elapsed}>{(elapsedMs / 1000).toFixed(2)} s</span>
          </div>

          <p ref={targetRef} className={styles.caption} aria-live="polite">
            {text}
          </p>

          <div className={styles.progressPanel}>
            <div>
              <span>Active wipe</span>
              <strong>{metrics.activeWord}</strong>
            </div>
            <div
              className={styles.meter}
              aria-label={`${Math.round(metrics.progress)}% through current word`}
            >
              <span
                style={{ width: `${Math.max(0, Math.min(100, metrics.progress))}%` }}
              />
            </div>
            <span>{Math.round(metrics.progress)}%</span>
          </div>

          <div className={styles.controls}>
            <button className={styles.primary} type="button" onClick={speak}>
              <WaveIcon /> Speak
            </button>
            <button
              type="button"
              onClick={() => narratorRef.current?.pause()}
              disabled={!isSpeaking}
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => narratorRef.current?.resume()}
              disabled={state !== "paused"}
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => narratorRef.current?.cancel()}
              disabled={!isSpeaking && state !== "paused"}
            >
              Cancel
            </button>
          </div>

          <div className={styles.metrics}>
            <article>
              <span>Word boundaries</span>
              <strong>{metrics.boundaries}</strong>
              <small>received from the browser</small>
            </article>
            <article>
              <span>Latest word</span>
              <strong>{latest?.word ?? "—"}</strong>
              <small>measured after its next boundary</small>
            </article>
            <article>
              <span>Predicted / actual</span>
              <strong>
                {latest
                  ? `${Math.round(latest.predictedMs)} / ${Math.round(latest.actualMs)} ms`
                  : "—"}
              </strong>
              <small>
                {latest
                  ? `error ${Math.round(latest.errorMs)} ms`
                  : "waiting for two boundaries"}
              </small>
            </article>
          </div>
        </>
      ) : (
        <p className={styles.unsupported}>
          {support.reason ??
            "Web Speech API is unavailable in this browser, so the live narration cannot start here."}
        </p>
      )}
    </section>
  );
}
