import type { WordToken } from "../types";

function pauseDurationMs(trailing: string, rate: number): number {
  const normalizedRate = Math.max(0.1, rate);
  if (/[.!?]/.test(trailing)) return 160 / normalizedRate;
  if (/[,;:]/.test(trailing)) return 85 / normalizedRate;
  if (/\n/.test(trailing)) return 110 / normalizedRate;
  return 0;
}

export class TimingPredictor {
  millisecondsPerUnit: number;
  constructor(initialMsPerUnit = 155) {
    this.millisecondsPerUnit = initialMsPerUnit;
  }
  predict(token: WordToken, rate: number): number {
    const wordMs = (token.units * this.millisecondsPerUnit) / Math.max(0.1, rate);
    return Math.max(90, wordMs) + pauseDurationMs(token.trailing, rate);
  }
  observe(token: WordToken, actualMs: number, rate: number): boolean {
    if (actualMs < 45 || actualMs > 5000) return false;
    const wordMs = actualMs - pauseDurationMs(token.trailing, rate);
    const observed = (wordMs * Math.max(0.1, rate)) / token.units;
    if (observed < 30 || observed > 900) return false;
    this.millisecondsPerUnit = this.millisecondsPerUnit * 0.8 + observed * 0.2;
    return true;
  }
  progress(elapsedMs: number, predictedMs: number): number {
    if (elapsedMs <= predictedMs) return Math.min(94, (elapsedMs / predictedMs) * 94);
    const excess = elapsedMs - predictedMs;
    return Math.min(98.5, 94 + 4.5 * (1 - Math.exp(-excess / 450)));
  }
}
