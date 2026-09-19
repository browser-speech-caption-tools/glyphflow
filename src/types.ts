export type NarratorState =
  "idle" | "speaking" | "paused" | "ended" | "cancelled" | "error" | "unsupported";

export type SpeechSynthesisSupport = { supported: boolean; reason?: string };

export type WordToken = {
  text: string;
  start: number;
  end: number;
  trailing: string;
  units: number;
};

export type WordTimingSample = {
  index: number;
  word: string;
  charIndex: number;
  predictedMs: number;
  actualMs: number;
  errorMs: number;
  absoluteErrorMs: number;
  boundaryElapsedMs: number;
};

export type NarrationDiagnostics = {
  text: string;
  voice: { name: string; lang: string; localService: boolean } | null;
  rate: number;
  samples: readonly WordTimingSample[];
  meanAbsoluteErrorMs: number | null;
  millisecondsPerUnit: number;
  receivedBoundaryEvents: number;
};

export type KaraokeNarratorDetail = {
  reason?: string;
  diagnostics?: NarrationDiagnostics;
};

export type KaraokeNarratorOptions = {
  text: string;
  target: HTMLElement;
  voice?: SpeechSynthesisVoice;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  className?: string;
  onStateChange?: (state: NarratorState, detail?: KaraokeNarratorDetail) => void;
  onWordTiming?: (sample: WordTimingSample, diagnostics: NarrationDiagnostics) => void;
};

export interface KaraokeNarrator {
  speak(): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  getDiagnostics(): NarrationDiagnostics;
  destroy(): void;
}

export type BoundaryEventData = {
  charIndex: number;
  elapsedTime: number;
  name?: string;
};
export type SpeechDriver = {
  supported(): SpeechSynthesisSupport;
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
      boundary(event: BoundaryEventData): void;
      end(): void;
      error(reason: string): void;
    },
  ): void;
  pause(): void;
  resume(): void;
  cancel(): void;
};
