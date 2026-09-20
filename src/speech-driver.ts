import type { SpeechDriver, SpeechSynthesisSupport } from "./types";

export function getSpeechSynthesisSupport(): SpeechSynthesisSupport {
  if (typeof window === "undefined")
    return { supported: false, reason: "window is unavailable (SSR environment)" };
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window))
    return { supported: false, reason: "Web Speech API is unavailable" };
  return { supported: true };
}

export function getVoices(): SpeechSynthesisVoice[] {
  return getSpeechSynthesisSupport().supported
    ? window.speechSynthesis.getVoices()
    : [];
}

export class BrowserSpeechDriver implements SpeechDriver {
  supported = getSpeechSynthesisSupport;
  speak(
    text: string,
    options: {
      voice?: SpeechSynthesisVoice;
      lang?: string;
      rate: number;
      pitch: number;
      volume: number;
    },
    events: {
      boundary(event: { charIndex: number; elapsedTime: number; name?: string }): void;
      end(): void;
      error(reason: string): void;
    },
  ): void {
    if (!this.supported().supported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Leave the voice unset when callers request the browser default. Some
    // engines treat an explicit `null` assignment as an invalid voice and
    // immediately emit an `error` event without speaking.
    if (options.voice) utterance.voice = options.voice;
    utterance.lang = options.lang ?? "";
    utterance.rate = options.rate;
    utterance.pitch = options.pitch;
    utterance.volume = options.volume;
    utterance.onboundary = (event) =>
      events.boundary({
        charIndex: event.charIndex,
        elapsedTime: event.elapsedTime,
        name: event.name,
      });
    utterance.onend = () => events.end();
    utterance.onerror = (event) =>
      events.error(event.error || "speech synthesis error");
    // Chrome can retain the paused state after a previous utterance was
    // cancelled. Resume only that stale paused queue before enqueueing ours;
    // this keeps a new Speak click from becoming a silent no-op.
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }
  pause(): void {
    if (this.supported().supported) window.speechSynthesis.pause();
  }
  resume(): void {
    if (this.supported().supported) window.speechSynthesis.resume();
  }
  cancel(): void {
    if (this.supported().supported) window.speechSynthesis.cancel();
  }
}
