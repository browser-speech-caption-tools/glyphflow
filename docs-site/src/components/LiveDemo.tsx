import { useEffect, useRef, useState } from "react";

import {
  createKaraokeNarrator,
  getSpeechSynthesisSupport,
  type KaraokeNarrator,
  type NarratorState,
} from "../../../src/index";
import "../../../src/styles.css";

import styles from "./LiveDemo.module.css";

const text = "Speech drives text animation in the browser.";

export default function LiveDemo(): JSX.Element {
  const targetRef = useRef<HTMLParagraphElement>(null);
  const narratorRef = useRef<KaraokeNarrator | null>(null);
  const [state, setState] = useState<NarratorState | "ready">("ready");
  const support = getSpeechSynthesisSupport();

  useEffect(() => {
    return () => narratorRef.current?.destroy();
  }, []);

  function speak(): void {
    const target = targetRef.current;
    if (!target || !support.supported) return;

    narratorRef.current?.destroy();
    narratorRef.current = createKaraokeNarrator({
      text,
      target,
      lang: "en-US",
      rate: 1.05,
      className: styles.caption,
      onStateChange(nextState) {
        setState(nextState);
      },
    });
    narratorRef.current.speak();
  }

  return (
    <section className={styles.demo} aria-labelledby="live-demo-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Live demo</p>
          <h2 id="live-demo-heading">Hear it. See it move.</h2>
        </div>
        <span className={styles.state} data-state={state}>
          {state}
        </span>
      </div>

      <p className={styles.description}>
        This uses GlyphFlow in this page. Select Speak and watch the fill move inside
        each spoken word.
      </p>

      {support.supported ? (
        <>
          <p ref={targetRef} className={styles.caption} aria-live="polite">
            {text}
          </p>
          <div className={styles.controls}>
            <button className={styles.primary} type="button" onClick={speak}>
              Speak
            </button>
            <button type="button" onClick={() => narratorRef.current?.pause()}>
              Pause
            </button>
            <button type="button" onClick={() => narratorRef.current?.resume()}>
              Resume
            </button>
            <button type="button" onClick={() => narratorRef.current?.cancel()}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <p className={styles.unsupported}>
          Web Speech API is unavailable in this browser, so the live narration cannot
          start here.
        </p>
      )}
    </section>
  );
}
