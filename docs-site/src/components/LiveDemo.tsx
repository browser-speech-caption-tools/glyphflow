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
import { tokenize } from "../../../src/core/tokenizer";

import { claimSpeech, releaseSpeech } from "./speech-session";
import styles from "./LiveDemo.module.css";

const exampleText = "Every letter follows the voice as the sentence unfolds.";
const isEnglishDemoText = (value: string) =>
  /^[\t\n\r\x20-\x7e]*$/.test(value) && /[A-Za-z]/.test(value);

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
      <span className={styles.idleWipe}>letter</span>
      <span className={styles.idleMuted}>
        {" "}
        follows the voice as the sentence unfolds.
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
  const [reason, setReason] = useState<string | null>(null);
  const [support, setSupport] = useState<SpeechSynthesisSupport | null>(null);
  const [text, setText] = useState(exampleText);
  const [spokenText, setSpokenText] = useState(exampleText);
  const [rate, setRate] = useState(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const startAtRef = useRef(0);

  useEffect(() => {
    setSupport(getSpeechSynthesisSupport());

    return () => {
      releaseSpeech(narratorRef.current);
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
    if (!target || !support?.supported || !isEnglishDemoText(text)) return;

    releaseSpeech(narratorRef.current);
    narratorRef.current?.destroy();
    setMetrics(initialMetrics);
    setElapsedMs(0);
    setSpokenText(text);
    narratorRef.current = createKaraokeNarrator({
      text,
      target,
      lang: "en-US",
      rate,
      className: styles.caption,
      onStateChange(nextState, detail) {
        setState(nextState);
        setReason(detail?.reason ?? null);
        if (nextState === "speaking") startAtRef.current = performance.now();
        if (
          nextState === "ended" ||
          nextState === "cancelled" ||
          nextState === "unsupported" ||
          nextState === "error"
        ) {
          releaseSpeech(narratorRef.current);
        }
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
    claimSpeech(narratorRef.current);
    narratorRef.current.speak();
  }

  function downloadDiagnostics(): void {
    const diagnostics = narratorRef.current?.getDiagnostics();
    if (!diagnostics) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(diagnostics, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "glyphflow-diagnostics.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const isSpeaking = state === "speaking";
  const isActive = state === "starting" || isSpeaking || state === "paused";
  const canSpeak = isEnglishDemoText(text);
  const invalidText = text.trim().length > 0 && !canSpeak;
  const tokens = tokenize(state === "ready" ? text : spokenText, "en-US");
  const samplesByIndex = new Map(
    metrics.samples.map((sample) => [sample.index, sample]),
  );
  const timingStatus =
    state === "ended"
      ? `${metrics.samples.length} of ${tokens.length} words measured`
      : state === "speaking"
        ? `${metrics.boundaries} boundary events received`
        : state === "starting"
          ? "Waiting for the browser voice to start"
          : state === "error"
            ? (reason ?? "Browser speech could not start")
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
          <div className={styles.setup}>
            <label className={styles.field}>
              <span>English text to speak</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={2}
                disabled={isActive}
                lang="en"
                aria-describedby="live-demo-text-help"
                aria-invalid={invalidText}
                data-invalid={invalidText}
              />
            </label>
            <p
              id="live-demo-text-help"
              className={invalidText ? styles.inputError : styles.inputHint}
            >
              {invalidText
                ? "This live demo supports English text only."
                : "English text only. Japanese and other languages are outside the v0.1 support target."}
            </p>
            <div className={styles.setupRow}>
              <label className={styles.field}>
                <span>Speech rate: {rate.toFixed(1)}×</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                  disabled={isActive}
                />
              </label>
            </div>
          </div>

          <div className={styles.playback} data-speaking={isSpeaking}>
            <WaveIcon />
            <strong>
              {isSpeaking
                ? "Speaking with"
                : state === "starting"
                  ? "Starting"
                  : "Uses"}{" "}
              the browser's default voice
            </strong>
            <span className={styles.elapsed}>{(elapsedMs / 1000).toFixed(2)} s</span>
          </div>

          <div className={styles.captionFrame}>
            {state === "ready" ? (
              <p className={styles.caption} aria-hidden="true">
                {text === exampleText ? <IdleCaption /> : text}
              </p>
            ) : null}
            <p
              ref={targetRef}
              className={styles.caption}
              aria-live="off"
              hidden={state === "ready"}
            />
          </div>

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
            <button
              className={styles.primary}
              type="button"
              onClick={speak}
              disabled={!canSpeak}
            >
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
              disabled={!isActive}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={downloadDiagnostics}
              disabled={!narratorRef.current}
            >
              Download diagnostics
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
            {state !== "ready" && tokens.length ? (
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
                    {tokens.map((token, index) => {
                      const sample = samplesByIndex.get(index);
                      return (
                        <tr key={`${index}-${token.start}`}>
                          <th scope="row">{token.text}</th>
                          {sample ? (
                            <>
                              <td>{Math.round(sample.predictedMs)} ms</td>
                              <td>{Math.round(sample.actualMs)} ms</td>
                              <td data-positive={sample.errorMs >= 0}>
                                {sample.errorMs >= 0 ? "+" : ""}
                                {Math.round(sample.errorMs)} ms
                              </td>
                            </>
                          ) : (
                            <td className={styles.unmeasured} colSpan={3}>
                              {state === "ended"
                                ? index === tokens.length - 1
                                  ? "Not measured · final word has no next boundary"
                                  : "Not measured · no usable next word boundary"
                                : "Waiting for a following word boundary"}
                            </td>
                          )}
                        </tr>
                      );
                    })}
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
