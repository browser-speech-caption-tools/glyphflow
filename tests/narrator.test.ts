// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { KaraokeNarratorImpl } from "../src/narrator";
import type { SpeechDriver } from "../src/types";

class Driver implements SpeechDriver {
  handlers?: { boundary(event: { charIndex: number; elapsedTime: number; name?: string }): void; end(): void; error(reason: string): void };
  supported = () => ({ supported: true }); speak(_text: string, _options: object, handlers: NonNullable<Driver["handlers"]>) { this.handlers = handlers; }
  pause = vi.fn(); resume = vi.fn(); cancel = vi.fn();
}
const raf = vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1)); vi.stubGlobal("cancelAnimationFrame", vi.fn());
afterEach(() => { vi.clearAllMocks(); });
describe("KaraokeNarrator", () => {
  it("completes the previous word at a boundary", () => { const driver = new Driver(); const target = document.createElement("div"); const n = new KaraokeNarratorImpl({ text: "one two", target, driver }); n.speak(); driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" }); driver.handlers!.boundary({ charIndex: 4, elapsedTime: 0.4, name: "word" }); expect(target.querySelector(".kn-word")?.getAttribute("style")).toContain("100%"); });
  it("renders the source text exactly, including a leading punctuation mark", () => { const target = document.createElement("div"); new KaraokeNarratorImpl({ text: "… hello!", target, driver: new Driver() }); expect(target.textContent).toBe("… hello!"); });
  it("does not animate while paused", () => { const driver = new Driver(); const n = new KaraokeNarratorImpl({ text: "one", target: document.createElement("div"), driver }); n.speak(); driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" }); n.pause(); expect(cancelAnimationFrame).toHaveBeenCalled(); });
  it("ignores callbacks after cancel", () => { const driver = new Driver(); const states: string[] = []; const n = new KaraokeNarratorImpl({ text: "one", target: document.createElement("div"), driver, onStateChange: (s) => states.push(s) }); n.speak(); const old = driver.handlers!; n.cancel(); old.end(); expect(states).toEqual(["speaking", "cancelled"]); });
  it("reports a voice without boundaries as unsupported", () => { const driver = new Driver(); const states: string[] = []; const n = new KaraokeNarratorImpl({ text: "one", target: document.createElement("div"), driver, onStateChange: (s) => states.push(s) }); n.speak(); driver.handlers!.end(); expect(states.at(-1)).toBe("unsupported"); });
  it("cancels scheduled animation on destroy", () => { const driver = new Driver(); const n = new KaraokeNarratorImpl({ text: "one", target: document.createElement("div"), driver }); n.speak(); driver.handlers!.boundary({ charIndex: 0, elapsedTime: 0, name: "word" }); n.destroy(); expect(cancelAnimationFrame).toHaveBeenCalled(); });
});
void raf;
