import type { WordToken } from "./types";

export class TimingPredictor {
  millisecondsPerUnit: number;
  constructor(initialMsPerUnit = 155) { this.millisecondsPerUnit = initialMsPerUnit; }
  predict(token: WordToken, rate: number): number {
    return Math.max(90, (token.units * this.millisecondsPerUnit) / Math.max(0.1, rate));
  }
  observe(token: WordToken, actualMs: number, rate: number): boolean {
    if (actualMs < 45 || actualMs > 5000) return false;
    const observed = (actualMs * Math.max(0.1, rate)) / token.units;
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
