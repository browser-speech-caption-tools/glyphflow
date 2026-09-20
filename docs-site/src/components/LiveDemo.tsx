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

function IdleCaption(): JSX.Element {
  return (
    <>
      <span className={styles.idleMuted}>Every </span>
      <span className={styles.idleWipe}>spoken</span>
      <span className={styles.idleMuted}>
        {" "}
        word fills from its first letter to its last.
      </span>
    </>
  );
}

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

  const isSpeaking = state === "speaking";
  const timingStatus =
    state === "ended"
      ? `${metrics.samples.length} completed word timings captured`
      : state === "speaking"
        ? `${metrics.boundaries} boundary events received`
        : state === "paused"
          ? "Speech and the glyph wipe are paused"
          : "Actual time is recorded when the next word starts";

  return (
    <section className={styles.demo} aria-labelledby="live-demo-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Live speech example</p>
          <h2 id="live-demo-heading">Press Speak. Keep your eyes on the caption.</h2>
        </div>
        <span className={styles.state} data-state={state}>
          <WaveIcon /> {state}
        </span>
      </div>

      <p className={styles.description}>
        The caption is the demo: one spoken word at a time fills inside its glyphs. The
        timing record stays below after playback.
      </p>

      {support === null ? (
        <p className={styles.unsupported}>Checking browser speech support…</p>
      ) : support.supported ? (
        <>
          <div className={styles.playback} data-speaking={isSpeaking}>
            <WaveIcon />
            <strong>
              {isSpeaking ? "Speaking with" : "Uses"} {voiceLabel}
            </strong>
            <span className={styles.elapsed}>{(elapsedMs / 1000).toFixed(2)} s</span>
          </div>

          <p ref={targetRef} className={styles.caption} aria-live="polite">
            {state === "ready" ? <IdleCaption /> : text}
          </p>

          {isSpeaking ? (
            <div className={styles.progressPanel}>
              <div className={styles.currentWord}>
                <span>Current word</span>
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
          ) : null}

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

          <section className={styles.trace} aria-labelledby="timing-trace-heading">
            <div className={styles.traceHeading}>
              <div>
                <p>Timing trace</p>
                <h3 id="timing-trace-heading">What the browser has measured</h3>
              </div>
              <span>{timingStatus}</span>
            </div>
            {metrics.samples.length ? (
              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Word</th>
                      <th scope="col">Predicted</th>
                      <th scope="col">Observed</th>
                      <th scope="col">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.samples.map((sample) => (
                      <tr key={`${sample.index}-${sample.boundaryElapsedMs}`}>
                        <th scope="row">{sample.word}</th>
                        <td>{Math.round(sample.predictedMs)} ms</td>
                        <td>{Math.round(sample.actualMs)} ms</td>
                        <td data-positive={sample.errorMs >= 0}>
                          {sample.errorMs >= 0 ? "+" : ""}
                          {Math.round(sample.errorMs)} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.emptyTrace}>
                Start speaking. The first completed word appears here when its following
                word boundary arrives.
              </p>
            )}
          </section>
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
