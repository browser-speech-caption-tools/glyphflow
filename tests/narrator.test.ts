// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { KaraokeNarratorImpl } from "../src/narrator";
import { createKaraokeNarrator } from "../src/narrator";
import type { SpeechDriver } from "../src/types";

class Driver implements SpeechDriver {
  autoStart = true;
  handlers?: {
    start(): void;
    boundary(event: { charIndex: number; elapsedTime: number; name?: string }): void;
    end(): void;
    error(reason: string): void;
  };
  supported = () => ({ supported: true });
  speak(_text: string, _options: object, handlers: NonNullable<Driver["handlers"]>) {
    this.handlers = handlers;
    if (this.autoStart) handlers.start();
  }
  pause = vi.fn();
  resume = vi.fn();
  cancel = vi.fn();
}
const raf = vi.stubGlobal(
  "requestAnimationFrame",
  vi.fn(() => 1),
);
vi.stubGlobal("cancelAnimationFrame", vi.fn());
afterEach(() => {
  vi.clearAllMocks();
});
describe("KaraokeNarrator", () => {
  it("reports unsupported instead of throwing when Web Speech is missing", () => {
    const states: string[] = [];
    const narrator = createKaraokeNarrator({
      text: "hello",
      target: document.createElement("div"),
      onStateChange: (state) => states.push(state),
    });
    expect(() => narrator.speak()).not.toThrow();
    expect(states).toEqual(["unsupported"]);
  });
  it("does not cancel unrelated speech before its first session or after its own end", () => {
    const driver = new Driver();
    const n = new KaraokeNarratorImpl({
      text: "hello",
      target: document.createElement("div"),
      driver,
    });
    n.speak();
    expect(driver.cancel).not.toHaveBeenCalled();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    driver.handlers!.end();
    n.destroy();
    expect(driver.cancel).not.toHaveBeenCalled();
  });
  it("completes the previous word at a boundary", () => {
    const driver = new Driver();
    const target = document.createElement("div");
    const n = new KaraokeNarratorImpl({ text: "one two", target, driver });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    driver.handlers!.boundary({ charIndex: 4, elapsedTime: 0.4, name: "word" });
    expect(target.querySelector(".kn-word")?.getAttribute("style")).toContain("100%");
    expect(n.getDiagnostics().meanAbsoluteErrorMs).toBe(
      n.getDiagnostics().samples[0]!.absoluteErrorMs,
    );
  });
  it("normalizes boundary elapsed time reported in either seconds or milliseconds", () => {
    let time = 0;
    const clock = vi.spyOn(performance, "now").mockImplementation(() => time);

    for (const elapsedTime of [0.24, 240]) {
      const driver = new Driver();
      const narrator = new KaraokeNarratorImpl({
        text: "one two",
        target: document.createElement("div"),
        driver,
      });
      narrator.speak();
      driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
      time = 240;
      driver.handlers!.boundary({ charIndex: 4, elapsedTime, name: "word" });
      expect(narrator.getDiagnostics().samples[0]?.actualMs).toBe(240);
      time = 0;
    }

    clock.mockRestore();
  });
  it("renders the source text exactly, including a leading punctuation mark", () => {
    const target = document.createElement("div");
    new KaraokeNarratorImpl({ text: "… hello!", target, driver: new Driver() });
    expect(target.textContent).toBe("… hello!");
  });
  it("marks captions so whitespace and newlines are preserved by the stylesheet", () => {
    const target = document.createElement("div");
    new KaraokeNarratorImpl({ text: "  one  \ntwo", target, driver: new Driver() });
    expect(target.textContent).toBe("  one  \ntwo");
    expect(target.classList.contains("kn-caption")).toBe(true);
  });
  it("completes skipped words without learning a mixed duration", () => {
    const driver = new Driver();
    const target = document.createElement("div");
    const n = new KaraokeNarratorImpl({ text: "one two three", target, driver });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    driver.handlers!.boundary({ charIndex: 8, elapsedTime: 0.8, name: "word" });
    const words = target.querySelectorAll<HTMLElement>(".kn-word");
    expect(words[0]?.style.getPropertyValue("--kn-progress")).toBe("100%");
    expect(words[1]?.style.getPropertyValue("--kn-progress")).toBe("100%");
    expect(n.getDiagnostics().samples).toHaveLength(0);
    driver.handlers!.end();
    expect(words[2]?.style.getPropertyValue("--kn-progress")).toBe("100%");
  });
  it("completes words before the first reported boundary", () => {
    const driver = new Driver();
    const target = document.createElement("div");
    const n = new KaraokeNarratorImpl({ text: "one two", target, driver });
    n.speak();
    driver.handlers!.boundary({ charIndex: 4, elapsedTime: 0.3, name: "word" });
    expect(
      target
        .querySelector<HTMLElement>(".kn-word")
        ?.style.getPropertyValue("--kn-progress"),
    ).toBe("100%");
    expect(n.getDiagnostics().samples).toHaveLength(0);
  });
  it("ignores unknown, duplicate, reversed, and invalid boundaries", () => {
    const driver = new Driver();
    const n = new KaraokeNarratorImpl({
      text: "one two",
      target: document.createElement("div"),
      driver,
    });
    n.speak();
    const boundary = driver.handlers!.boundary;
    boundary({ charIndex: 0, elapsedTime: 0.1, name: "word" });
    boundary({ charIndex: 4, elapsedTime: 0.2, name: "sentence" });
    boundary({ charIndex: 0, elapsedTime: 0.3, name: "word" });
    boundary({ charIndex: 4, elapsedTime: 0.05, name: "word" });
    boundary({ charIndex: Number.NaN, elapsedTime: 0.4, name: "word" });
    expect(n.getDiagnostics().receivedBoundaryEvents).toBe(1);
    boundary({ charIndex: 4, elapsedTime: 0.5, name: "word" });
    expect(n.getDiagnostics().receivedBoundaryEvents).toBe(2);
    expect(n.getDiagnostics().samples).toHaveLength(1);
  });
  it("does not animate while paused", () => {
    const driver = new Driver();
    const target = document.createElement("div");
    let time = 0;
    const clock = vi.spyOn(performance, "now").mockImplementation(() => time);
    let frame: FrameRequestCallback | undefined;
    const schedule = vi.mocked(requestAnimationFrame);
    schedule.mockImplementationOnce((callback) => {
      frame = callback;
      return 1;
    });
    const n = new KaraokeNarratorImpl({
      text: "one",
      target,
      driver,
    });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    time = 100;
    frame?.(time);
    const word = target.querySelector<HTMLElement>(".kn-word")!;
    const beforePause = word.style.getPropertyValue("--kn-progress");
    n.pause();
    time = 1000;
    frame?.(time);
    expect(word.style.getPropertyValue("--kn-progress")).toBe(beforePause);
    schedule.mockImplementationOnce((callback) => {
      frame = callback;
      return 1;
    });
    n.resume();
    frame?.(time);
    expect(word.style.getPropertyValue("--kn-progress")).toBe(beforePause);
    expect(cancelAnimationFrame).toHaveBeenCalled();
    clock.mockRestore();
  });
  it("ignores callbacks after cancel", () => {
    const driver = new Driver();
    const states: string[] = [];
    const n = new KaraokeNarratorImpl({
      text: "one",
      target: document.createElement("div"),
      driver,
      onStateChange: (s) => states.push(s),
    });
    n.speak();
    const old = driver.handlers!;
    n.cancel();
    old.end();
    expect(states).toEqual(["starting", "speaking", "cancelled"]);
  });
  it("replaces a session and accepts fresh elapsed times", () => {
    const driver = new Driver();
    const n = new KaraokeNarratorImpl({
      text: "one two",
      target: document.createElement("div"),
      driver,
    });
    n.speak();
    const old = driver.handlers!;
    old.boundary({ charIndex: 4, elapsedTime: 2, name: "word" });
    n.speak();
    old.end();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    expect(n.getDiagnostics().receivedBoundaryEvents).toBe(1);
  });
  it("reports a voice without boundaries as unsupported", () => {
    const driver = new Driver();
    const states: string[] = [];
    const n = new KaraokeNarratorImpl({
      text: "one",
      target: document.createElement("div"),
      driver,
      onStateChange: (s) => states.push(s),
    });
    n.speak();
    driver.handlers!.end();
    expect(states.at(-1)).toBe("unsupported");
  });
  it("reports a voice that never starts instead of claiming it is speaking", () => {
    vi.useFakeTimers();
    const driver = new Driver();
    driver.autoStart = false;
    const states: string[] = [];
    const reasons: string[] = [];
    const n = new KaraokeNarratorImpl({
      text: "one",
      target: document.createElement("div"),
      driver,
      onStateChange: (state, detail) => {
        states.push(state);
        if (detail?.reason) reasons.push(detail.reason);
      },
    });
    n.speak();
    expect(states).toEqual(["starting"]);
    vi.advanceTimersByTime(10_000);
    expect(states).toEqual(["starting", "error"]);
    expect(reasons.at(-1)).toContain("did not start");
    expect(driver.cancel).toHaveBeenCalledOnce();
    n.destroy();
    vi.useRealTimers();
  });
  it("starts animation only after the browser starts speaking", () => {
    const driver = new Driver();
    driver.autoStart = false;
    const states: string[] = [];
    const n = new KaraokeNarratorImpl({
      text: "one two",
      target: document.createElement("div"),
      driver,
      onStateChange: (state) => states.push(state),
    });
    n.speak();
    expect(states).toEqual(["starting"]);
    driver.handlers!.start();
    expect(states).toEqual(["starting", "speaking"]);
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    expect(n.getDiagnostics().receivedBoundaryEvents).toBe(1);
    n.destroy();
  });
  it("cancels scheduled animation on destroy", () => {
    const driver = new Driver();
    const target = document.createElement("div");
    const n = new KaraokeNarratorImpl({
      text: "one",
      target,
      driver,
      className: "custom-caption another-caption",
    });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    n.destroy();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(target.textContent).toBe("");
    expect(target.classList.contains("kn-caption")).toBe(false);
    expect(target.classList.contains("custom-caption")).toBe(false);
    expect(target.classList.contains("another-caption")).toBe(false);
  });
});
void raf;
