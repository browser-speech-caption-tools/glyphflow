import { useEffect, useRef, useState } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  createKaraokeNarrator,
  getSpeechSynthesisSupport,
  type KaraokeNarrator,
  type NarratorState,
} from "../../../src/index.browser";

import { claimSpeech, releaseSpeech } from "./speech-session";
import styles from "./HeroSpeech.module.css";

const sentence = "Watch every letter come alive.";
const words = ["Watch", "every", "letter", "come", "alive."];

function SpeechIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
    </svg>
  );
}

export default function HeroSpeech(): JSX.Element {
  const isJapanese = useDocusaurusContext().i18n.currentLocale === "ja";
  const copy = isJapanese
    ? {
        ariaLabel: "音声同期字幕のプレビュー",
        speaking: "読み上げ中",
        starting: "音声を開始中",
        browserSpeech: "ブラウザ音声",
        hint: "5語 · 単語ごとに連続した文字内ワイプ",
        ready: "文を再生してタイミングを確認",
        unsupported: "このvoiceは単語境界を返しませんでした",
        error: "ブラウザの音声を開始できませんでした",
        ended: "再生完了 · もう一度再生",
        waiting: "ブラウザの音声開始を待っています",
        active: "ブラウザの音声がこの字幕を動かします",
        speak: "Speak",
        replay: "もう一度再生",
      }
    : {
        ariaLabel: "Speech synchronized caption preview",
        speaking: "Speaking",
        starting: "Starting voice",
        browserSpeech: "Browser speech",
        hint: "Five words · one continuous wipe per word",
        ready: "Play the sentence to hear the timing",
        unsupported: "This voice did not provide word boundaries",
        error: "Browser speech could not start",
        ended: "Playback complete · play again",
        waiting: "Waiting for the browser to start speaking",
        active: "The browser voice drives this caption",
        speak: "Speak",
        replay: "Replay",
      };
  const targetRef = useRef<HTMLParagraphElement>(null);
  const narratorRef = useRef<KaraokeNarrator | null>(null);
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<NarratorState | "ready">("ready");
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    setSupported(getSpeechSynthesisSupport().supported);
    return () => {
      releaseSpeech(narratorRef.current);
      narratorRef.current?.destroy();
    };
  }, []);

  function speak(): void {
    if (!targetRef.current || !supported) return;
    releaseSpeech(narratorRef.current);
    narratorRef.current?.destroy();
    narratorRef.current = createKaraokeNarrator({
      text: sentence,
      target: targetRef.current,
      lang: "en-US",
      rate: 1,
      onStateChange(nextState, detail) {
        setState(nextState);
        setReason(detail?.reason ?? null);
        if (
          nextState === "ended" ||
          nextState === "cancelled" ||
          nextState === "unsupported" ||
          nextState === "error"
        ) {
          releaseSpeech(narratorRef.current);
        }
      },
    });
    claimSpeech(narratorRef.current);
    narratorRef.current.speak();
  }

  return (
    <div className={styles.preview} aria-label={copy.ariaLabel}>
      <div className={styles.topline}>
        <span className={styles.voice} data-speaking={state === "speaking"}>
          <SpeechIcon />{" "}
          {state === "speaking"
            ? copy.speaking
            : state === "starting"
              ? copy.starting
              : copy.browserSpeech}
        </span>
        <span className={styles.hint}>{copy.hint}</span>
      </div>

      <div className={styles.captionFrame}>
        {state === "ready" ? (
          <p className={styles.caption} aria-hidden="true">
            {words.map((word, index) => (
              <span
                className={styles.previewWord}
                key={word}
                style={{ animationDelay: `${index * 0.7}s` }}
              >
                {word}
                {index < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        ) : null}
        <p
          ref={targetRef}
          className={styles.caption}
          aria-live="off"
          hidden={state === "ready"}
        />
      </div>

      <div className={styles.footer}>
        <span>
          {state === "ready"
            ? copy.ready
            : state === "unsupported"
              ? copy.unsupported
              : state === "error"
                ? (reason ?? copy.error)
                : state === "ended"
                  ? copy.ended
                  : state === "starting"
                    ? copy.waiting
                    : state === "speaking"
                      ? copy.active
                      : state}
        </span>
        <button type="button" onClick={speak} disabled={!supported}>
          <SpeechIcon /> {state === "speaking" ? copy.replay : copy.speak}
        </button>
      </div>
    </div>
  );
}
