import { useEffect, useRef, useState } from "react";

import {
  createKaraokeNarrator,
  getSpeechSynthesisSupport,
  type KaraokeNarrator,
  type NarratorState,
} from "../../../src/index";
import "../../../src/styles.css";

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
    <div className={styles.preview} aria-label="Speech synchronized caption preview">
      <div className={styles.topline}>
        <span className={styles.voice} data-speaking={state === "speaking"}>
          <SpeechIcon />{" "}
          {state === "speaking"
            ? "Speaking"
            : state === "starting"
              ? "Starting voice"
              : "Browser speech"}
        </span>
        <span className={styles.hint}>Five words · one continuous wipe per word</span>
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
            ? "Play the sentence to hear the timing"
            : state === "unsupported"
              ? "This voice did not provide word boundaries"
              : state === "error"
                ? (reason ?? "Browser speech could not start")
                : state === "ended"
                  ? "Playback complete · play again"
                  : state === "starting"
                    ? "Waiting for the browser to start speaking"
                    : state === "speaking"
                      ? "The browser voice drives this caption"
                      : state}
        </span>
        <button type="button" onClick={speak} disabled={!supported}>
          <SpeechIcon /> {state === "speaking" ? "Replay" : "Speak"}
        </button>
      </div>
    </div>
  );
}
