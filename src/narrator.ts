import { Renderer } from "./browser/renderer";
import { BrowserSpeechDriver } from "./browser/speech-driver";
import { findTokenIndex, tokenize } from "./core/tokenizer";
import { TimingPredictor } from "./core/timing-predictor";
import type {
  KaraokeNarrator,
  KaraokeNarratorOptions,
  NarrationDiagnostics,
  NarratorState,
  SpeechDriver,
  WordTimingSample,
  WordToken,
} from "./types";

type InternalOptions = KaraokeNarratorOptions & { driver?: SpeechDriver };
const now = () => (typeof performance === "undefined" ? Date.now() : performance.now());

export class KaraokeNarratorImpl implements KaraokeNarrator {
  private readonly options: InternalOptions;
  private readonly driver: SpeechDriver;
  private readonly renderer: Renderer;
  private readonly tokens: WordToken[];
  private predictor = new TimingPredictor();
  private state: NarratorState = "idle";
  private session = 0;
  private active = -1;
  private boundaryAt = 0;
  private observedIndex = -1;
  private observedElapsed = 0;
  private observedPredicted = 0;
  private boundaryElapsedScale: 1 | 1000 | null = null;
  private speechStartedAt = 0;
  private predicted = 0;
  private pauseAt = 0;
  private pausedMs = 0;
  private raf = 0;
  private startTimer: ReturnType<typeof setTimeout> | undefined;
  private samples: WordTimingSample[] = [];
  private absoluteErrorTotal = 0;
  private boundaries = 0;
  private hasUtterance = false;
  private destroyed = false;
  constructor(options: InternalOptions) {
    this.options = options;
    this.driver = options.driver ?? new BrowserSpeechDriver();
    this.renderer = new Renderer(options.target, options.className);
    this.tokens = tokenize(options.text, options.lang);
    this.renderer.render(this.tokens, options.text);
  }
  private diagnostics(): NarrationDiagnostics {
    return {
      text: this.options.text,
      voice: this.options.voice
        ? {
            name: this.options.voice.name,
            lang: this.options.voice.lang,
            localService: this.options.voice.localService,
          }
        : null,
      rate: this.rate,
      samples: this.samples,
      meanAbsoluteErrorMs: this.samples.length
        ? this.absoluteErrorTotal / this.samples.length
        : null,
      millisecondsPerUnit: this.predictor.millisecondsPerUnit,
      receivedBoundaryEvents: this.boundaries,
    };
  }
  getDiagnostics(): NarrationDiagnostics {
    return this.diagnostics();
  }
  private setState(state: NarratorState, reason?: string): void {
    this.state = state;
    this.options.onStateChange?.(state, { reason, diagnostics: this.diagnostics() });
  }
  private get rate(): number {
    return this.options.rate ?? 1;
  }
  speak(): void {
    if (this.destroyed) return;
    this.stop(false);
    const support = this.driver.supported();
    if (!support.supported) {
      this.setState("unsupported", support.reason);
      return;
    }
    const id = ++this.session;
    this.predictor = new TimingPredictor();
    this.samples = [];
    this.absoluteErrorTotal = 0;
    this.boundaries = 0;
    this.active = -1;
    this.observedIndex = -1;
    this.observedElapsed = 0;
    this.observedPredicted = 0;
    this.boundaryElapsedScale = null;
    this.pausedMs = 0;
    this.renderer.render(this.tokens, this.options.text);
    this.setState("starting");
    this.hasUtterance = true;
    try {
      this.driver.speak(
        this.options.text,
        {
          voice: this.options.voice,
          lang: this.options.lang,
          rate: this.rate,
          pitch: this.options.pitch ?? 1,
          volume: this.options.volume ?? 1,
        },
        {
          start: () => this.onStart(id),
          boundary: (event) => this.onBoundary(id, event),
          end: () => this.onEnd(id),
          error: (reason) => {
            if (id === this.session && this.hasUtterance) {
              this.stop(false);
              this.setState("error", reason);
            }
          },
        },
      );
      if (id === this.session && this.state === "starting") {
        this.startTimer = setTimeout(() => {
          if (id !== this.session || this.state !== "starting") return;
          this.stop(false);
          this.setState("error", "The browser voice did not start within 10 seconds");
        }, 10_000);
      }
    } catch (error) {
      if (id !== this.session) return;
      this.stop(false);
      this.setState("error", error instanceof Error ? error.message : String(error));
    }
  }
  private onStart(id: number): void {
    if (id !== this.session || this.destroyed || this.state !== "starting") return;
    clearTimeout(this.startTimer);
    this.startTimer = undefined;
    this.speechStartedAt = now();
    this.setState("speaking");
  }
  private onBoundary(
    id: number,
    event: { charIndex: number; elapsedTime: number; name?: string },
  ): void {
    if (
      id !== this.session ||
      this.destroyed ||
      (this.state !== "speaking" && this.state !== "starting") ||
      (event.name && event.name !== "word") ||
      !Number.isInteger(event.charIndex) ||
      !Number.isFinite(event.elapsedTime)
    )
      return;
    const index = findTokenIndex(this.tokens, event.charIndex);
    if (index < 0 || index <= this.observedIndex) return;
    if (this.state === "starting") this.onStart(id);
    const elapsed = this.normalizeBoundaryElapsed(event.elapsedTime);
    if (elapsed < this.observedElapsed) return;
    this.boundaries++;
    const previous = this.tokens[this.observedIndex];
    if (previous && index === this.observedIndex + 1) {
      const actual = elapsed - this.observedElapsed;
      const sample: WordTimingSample = {
        index: this.observedIndex,
        word: previous.text,
        charIndex: previous.start,
        predictedMs: this.observedPredicted,
        actualMs: actual,
        errorMs: actual - this.observedPredicted,
        absoluteErrorMs: Math.abs(actual - this.observedPredicted),
        boundaryElapsedMs: this.observedElapsed,
      };
      this.predictor.observe(previous, actual, this.rate);
      this.samples.push(sample);
      this.absoluteErrorTotal += sample.absoluteErrorMs;
      this.options.onWordTiming?.(sample, this.diagnostics());
    }
    this.observedIndex = index;
    this.observedElapsed = elapsed;
    const token = this.tokens[index];
    if (token) this.observedPredicted = this.predictor.predict(token, this.rate);

    // A delayed boundary can describe a word already entered by the visual
    // fallback. Keep its current fill instead of jumping back to zero.
    if (index <= this.active) return;
    for (let completed = Math.max(0, this.active); completed < index; completed++)
      this.renderer.complete(completed);
    this.active = index;
    this.boundaryAt = now();
    this.pausedMs = 0;
    this.predicted = this.observedPredicted;
    this.renderer.progress(index, 0);
    this.animate(id);
  }
  private normalizeBoundaryElapsed(rawElapsed: number): number {
    if (rawElapsed === 0) return 0;
    if (this.boundaryElapsedScale) return rawElapsed * this.boundaryElapsedScale;

    // The Web Speech specification defines elapsedTime in seconds, but some
    // Chrome desktop voices report milliseconds. Select the scale whose value
    // matches the elapsed local clock and keep it for this utterance.
    const localElapsed = Math.max(0, now() - this.speechStartedAt);
    const asMilliseconds = rawElapsed;
    const asSeconds = rawElapsed * 1000;
    this.boundaryElapsedScale =
      Math.abs(asSeconds - localElapsed) <= Math.abs(asMilliseconds - localElapsed)
        ? 1000
        : 1;
    return rawElapsed * this.boundaryElapsedScale;
  }
  private animate(id: number): void {
    cancelAnimationFrame(this.raf);
    const tick = () => {
      if (id !== this.session || this.state !== "speaking" || this.active < 0) return;
      const elapsed = now() - this.boundaryAt - this.pausedMs;
      const fallbackAfter = this.predicted + Math.max(100, this.predicted * 0.35);
      if (elapsed > fallbackAfter && this.active < this.tokens.length - 1) {
        this.renderer.complete(this.active);
        this.active++;
        this.boundaryAt = now();
        this.pausedMs = 0;
        const next = this.tokens[this.active];
        if (next) this.predicted = this.predictor.predict(next, this.rate);
      }
      this.renderer.progress(
        this.active,
        this.predictor.progress(
          now() - this.boundaryAt - this.pausedMs,
          this.predicted,
        ),
      );
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  pause(): void {
    if (this.state !== "speaking") return;
    this.pauseAt = now();
    cancelAnimationFrame(this.raf);
    this.driver.pause();
    this.setState("paused");
  }
  resume(): void {
    if (this.state !== "paused") return;
    this.pausedMs += now() - this.pauseAt;
    this.driver.resume();
    this.setState("speaking");
    this.animate(this.session);
  }
  cancel(): void {
    if (this.destroyed) return;
    this.stop(true);
  }
  private stop(notify: boolean): void {
    clearTimeout(this.startTimer);
    this.startTimer = undefined;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    ++this.session;
    if (this.hasUtterance) this.driver.cancel();
    this.hasUtterance = false;
    if (notify) this.setState("cancelled");
  }
  private onEnd(id: number): void {
    if (id !== this.session || this.destroyed || !this.hasUtterance) return;
    clearTimeout(this.startTimer);
    this.startTimer = undefined;
    cancelAnimationFrame(this.raf);
    this.hasUtterance = false;
    if (!this.boundaries) {
      this.setState(
        "unsupported",
        "The selected voice emitted no word boundary events",
      );
      return;
    }
    for (let index = this.active; index < this.tokens.length; index++)
      this.renderer.complete(index);
    this.setState("ended");
  }
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop(false);
    this.renderer.clear();
  }
}

export function createKaraokeNarrator(
  options: KaraokeNarratorOptions,
): KaraokeNarrator {
  return new KaraokeNarratorImpl(options);
}
