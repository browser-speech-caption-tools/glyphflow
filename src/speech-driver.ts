import type { SpeechDriver, SpeechSynthesisSupport } from "./types";

export function getSpeechSynthesisSupport(): SpeechSynthesisSupport {
  if (typeof window === "undefined") return { supported: false, reason: "window is unavailable (SSR environment)" };
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return { supported: false, reason: "Web Speech API is unavailable" };
  return { supported: true };
}

export function getVoices(): SpeechSynthesisVoice[] {
  return getSpeechSynthesisSupport().supported ? window.speechSynthesis.getVoices() : [];
}

export class BrowserSpeechDriver implements SpeechDriver {
  supported = getSpeechSynthesisSupport;
  speak(text: string, options: { voice?: SpeechSynthesisVoice; lang?: string; rate: number; pitch: number; volume: number }, events: { boundary(event: { charIndex: number; elapsedTime: number; name?: string }): void; end(): void; error(reason: string): void }): void {
    if (!this.supported().supported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = options.voice ?? null; utterance.lang = options.lang ?? "";
    utterance.rate = options.rate; utterance.pitch = options.pitch; utterance.volume = options.volume;
    utterance.onboundary = (event) => events.boundary({ charIndex: event.charIndex, elapsedTime: event.elapsedTime, name: event.name });
    utterance.onend = () => events.end();
    utterance.onerror = (event) => events.error(event.error || "speech synthesis error");
    window.speechSynthesis.speak(utterance);
  }
  pause(): void { window.speechSynthesis.pause(); }
  resume(): void { window.speechSynthesis.resume(); }
  cancel(): void { window.speechSynthesis.cancel(); }
}
