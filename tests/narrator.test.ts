// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { KaraokeNarratorImpl } from "../src/narrator";
import { createKaraokeNarrator } from "../src/narrator";
import type { SpeechDriver } from "../src/types";

class Driver implements SpeechDriver {
  handlers?: {
    boundary(event: { charIndex: number; elapsedTime: number; name?: string }): void;
    end(): void;
    error(reason: string): void;
  };
  supported = () => ({ supported: true });
  speak(_text: string, _options: object, handlers: NonNullable<Driver["handlers"]>) {
    this.handlers = handlers;
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
  it("completes the previous word at a boundary", () => {
    const driver = new Driver();
    const target = document.createElement("div");
    const n = new KaraokeNarratorImpl({ text: "one two", target, driver });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    driver.handlers!.boundary({ charIndex: 4, elapsedTime: 0.4, name: "word" });
    expect(target.querySelector(".kn-word")?.getAttribute("style")).toContain("100%");
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
    const n = new KaraokeNarratorImpl({
      text: "one",
      target: document.createElement("div"),
      driver,
    });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    n.pause();
    expect(cancelAnimationFrame).toHaveBeenCalled();
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
    expect(states).toEqual(["speaking", "cancelled"]);
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
  it("cancels scheduled animation on destroy", () => {
    const driver = new Driver();
    const n = new KaraokeNarratorImpl({
      text: "one",
      target: document.createElement("div"),
      driver,
    });
    n.speak();
    driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" });
    n.destroy();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
void raf;
