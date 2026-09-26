import { useEffect, useRef, useState } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  createKaraokeNarrator,
  getSpeechSynthesisSupport,
  type KaraokeNarrator,
  type NarratorState,
  type SpeechSynthesisSupport,
  type WordTimingSample,
} from "../../../src/index.browser";
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
  const isJapanese = useDocusaurusContext().i18n.currentLocale === "ja";
  const copy = isJapanese
    ? {
        liveExample: "ライブ音声デモ",
        heading: "Speakを押して、字幕の動きを見てください。",
        description:
          "この字幕自体がデモです。読み上げ中の単語は、文字の内側で順番に塗り進みます。再生後も下に計測結果が残ります。",
        checking: "ブラウザの音声対応を確認しています…",
        textLabel: "読み上げる英語テキスト",
        invalidInput: "このライブデモは英語テキストのみ対応しています。",
        inputHint:
          "このデモで入力・読み上げできるのは英語のみです。日本語などはv0.1の対応対象外です。",
        rate: "読み上げ速度",
        speakingWith: "ブラウザ既定のvoiceで読み上げ中",
        starting: "音声を開始しています",
        usesVoice: "ブラウザ既定のvoiceを使用",
        currentWord: "現在の単語",
        speak: "Speak",
        pause: "Pause",
        resume: "Resume",
        cancel: "Cancel",
        download: "診断情報をダウンロード",
        timingTrace: "タイミング記録",
        measured: "ブラウザが計測した内容",
        wordsMeasured: (measured: number, total: number) => `${total}語中${measured}語を計測済み`,
        boundaries: (count: number) => `単語境界イベントを${count}件受信`,
        waitingStart: "ブラウザの音声開始を待っています",
        speechError: "ブラウザの音声を開始できませんでした",
        paused: "音声と文字内ワイプを一時停止しています",
        actualNote: "実測時間は次の単語が始まった時点で記録されます",
        word: "単語",
        predicted: "予測",
        observed: "実測",
        difference: "差分",
        finalNotMeasured: "未計測 · 最終単語には次の境界がありません",
        boundaryNotMeasured: "未計測 · 利用可能な次の単語境界がありません",
        waitingBoundary: "次の単語境界を待っています",
        emptyTrace: "Speakを押してください。次の単語境界が届くと、最初の完了単語がここに表示されます。",
        unavailable:
          "このブラウザではWeb Speech APIを利用できないため、ここでライブ読み上げを開始できません。",
      }
    : {
        liveExample: "Live speech example",
        heading: "Press Speak. Keep your eyes on the caption.",
        description:
          "The caption is the demo: one spoken word at a time fills inside its glyphs. The timing record stays below after playback.",
        checking: "Checking browser speech support…",
        textLabel: "English text to speak",
        invalidInput: "This live demo supports English text only.",
        inputHint: "English text only. Japanese and other languages are outside the v0.1 support target.",
        rate: "Speech rate",
        speakingWith: "Speaking with the browser's default voice",
        starting: "Starting the browser's default voice",
        usesVoice: "Uses the browser's default voice",
        currentWord: "Current word",
        speak: "Speak",
        pause: "Pause",
        resume: "Resume",
        cancel: "Cancel",
        download: "Download diagnostics",
        timingTrace: "Timing trace",
        measured: "What the browser has measured",
        wordsMeasured: (measured: number, total: number) => `${measured} of ${total} words measured`,
        boundaries: (count: number) => `${count} boundary events received`,
        waitingStart: "Waiting for the browser voice to start",
        speechError: "Browser speech could not start",
        paused: "Speech and the glyph wipe are paused",
        actualNote: "Actual time is recorded when the next word starts",
        word: "Word",
        predicted: "Predicted",
        observed: "Observed",
        difference: "Difference",
        finalNotMeasured: "Not measured · final word has no next boundary",
        boundaryNotMeasured: "Not measured · no usable next word boundary",
        waitingBoundary: "Waiting for a following word boundary",
        emptyTrace:
          "Start speaking. The first completed word appears here when its following word boundary arrives.",
        unavailable:
          "Web Speech API is unavailable in this browser, so the live narration cannot start here.",
      };
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
      ? copy.wordsMeasured(metrics.samples.length, tokens.length)
      : state === "speaking"
        ? copy.boundaries(metrics.boundaries)
      : state === "starting"
          ? copy.waitingStart
        : state === "error"
            ? (reason ?? copy.speechError)
          : state === "paused"
              ? copy.paused
              : copy.actualNote;

  return (
    <section className={styles.demo} aria-labelledby="live-demo-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{copy.liveExample}</p>
          <h2 id="live-demo-heading">{copy.heading}</h2>
        </div>
        <span className={styles.state} data-state={state}>
          <WaveIcon /> {state}
        </span>
      </div>

      <p className={styles.description}>
        {copy.description}
      </p>

      {support === null ? (
        <p className={styles.unsupported}>{copy.checking}</p>
      ) : support.supported ? (
        <>
          <div className={styles.setup}>
            <label className={styles.field}>
              <span>{copy.textLabel}</span>
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
                ? copy.invalidInput
                : copy.inputHint}
            </p>
            <div className={styles.setupRow}>
              <label className={styles.field}>
                <span>{copy.rate}: {rate.toFixed(1)}×</span>
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
              {isSpeaking ? copy.speakingWith : state === "starting" ? copy.starting : copy.usesVoice}
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
                <span>{copy.currentWord}</span>
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
              <WaveIcon /> {copy.speak}
            </button>
            <button
              type="button"
              onClick={() => narratorRef.current?.pause()}
              disabled={!isSpeaking}
            >
              {copy.pause}
            </button>
            <button
              type="button"
              onClick={() => narratorRef.current?.resume()}
              disabled={state !== "paused"}
            >
              {copy.resume}
            </button>
            <button
              type="button"
              onClick={() => narratorRef.current?.cancel()}
              disabled={!isActive}
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={downloadDiagnostics}
              disabled={!narratorRef.current}
            >
              {copy.download}
            </button>
          </div>

          <section className={styles.trace} aria-labelledby="timing-trace-heading">
            <div className={styles.traceHeading}>
              <div>
                <p>{copy.timingTrace}</p>
                <h3 id="timing-trace-heading">{copy.measured}</h3>
              </div>
              <span>{timingStatus}</span>
            </div>
            {state !== "ready" && tokens.length ? (
              <div className={styles.tableScroll}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">{copy.word}</th>
                      <th scope="col">{copy.predicted}</th>
                      <th scope="col">{copy.observed}</th>
                      <th scope="col">{copy.difference}</th>
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
                                  ? copy.finalNotMeasured
                                  : copy.boundaryNotMeasured
                                : copy.waitingBoundary}
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
                {copy.emptyTrace}
              </p>
            )}
          </section>
        </>
      ) : (
        <p className={styles.unsupported}>
          {support.reason ?? copy.unavailable}
        </p>
      )}
    </section>
  );
}
