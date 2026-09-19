import type { WordToken } from "./types";

export class Renderer {
  private readonly words: HTMLSpanElement[] = [];
  constructor(private readonly target: HTMLElement, className?: string) {
    if (className) target.classList.add(className);
  }
  render(tokens: readonly WordToken[], sourceText = ""): void {
    this.target.replaceChildren(); this.words.length = 0;
    const initial = sourceText.slice(0, tokens[0]?.start ?? sourceText.length);
    if (initial) { const prefix = document.createElement("span"); prefix.textContent = initial; this.target.append(prefix); }
    for (const token of tokens) {
      const word = document.createElement("span");
      word.className = "kn-word"; word.textContent = token.text;
      word.style.setProperty("--kn-progress", "0%");
      this.target.append(word); this.words.push(word);
      if (token.trailing) { const trailing = document.createElement("span"); trailing.textContent = token.trailing; this.target.append(trailing); }
    }
  }
  progress(index: number, value: number): void { this.words[index]?.style.setProperty("--kn-progress", `${Math.max(0, Math.min(100, value)).toFixed(3)}%`); }
  complete(index: number): void { this.words[index]?.style.setProperty("--kn-progress", "100%"); }
  clear(): void { this.target.replaceChildren(); this.words.length = 0; }
}
