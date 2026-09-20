import type { SpeechDriver, SpeechSynthesisSupport } from "../types";

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
  private utterance: SpeechSynthesisUtterance | null = null;
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
      start(): void;
      boundary(event: { charIndex: number; elapsedTime: number; name?: string }): void;
      end(): void;
      error(reason: string): void;
    },
  ): void {
    if (!this.supported().supported) return;
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;
    const voices = synthesis.getVoices();
    const requestedVoice =
      options.voice ??
      voices.find((voice) => voice.default) ??
      voices.find((voice) =>
        options.lang ? voice.lang.toLowerCase() === options.lang.toLowerCase() : true,
      );
    if (requestedVoice) utterance.voice = requestedVoice;
    utterance.lang = options.lang ?? "";
    utterance.rate = options.rate;
    utterance.pitch = options.pitch;
    utterance.volume = options.volume;
    utterance.onstart = () => events.start();
    utterance.onboundary = (event) =>
      events.boundary({
        charIndex: event.charIndex,
        elapsedTime: event.elapsedTime,
        name: event.name,
      });
    utterance.onend = () => {
      if (this.utterance === utterance) this.utterance = null;
      events.end();
    };
    utterance.onerror = (event) => {
      if (this.utterance === utterance) this.utterance = null;
      events.error(event.error || "speech synthesis error");
    };
    if (synthesis.paused) synthesis.resume();
    synthesis.speak(utterance);
  }
  pause(): void {
    if (this.supported().supported) window.speechSynthesis.pause();
  }
  resume(): void {
    if (this.supported().supported) window.speechSynthesis.resume();
  }
  cancel(): void {
    if (!this.utterance) return;
    this.utterance = null;
    if (this.supported().supported) window.speechSynthesis.cancel();
  }
}
