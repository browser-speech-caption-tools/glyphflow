import type { WordToken } from "./types";

export class Renderer {
  private readonly words: HTMLSpanElement[] = [];
  private readonly hadCaptionClass: boolean;
  private readonly addedClassNames: string[] = [];
  constructor(
    private readonly target: HTMLElement,
    className?: string,
  ) {
    this.hadCaptionClass = target.classList.contains("kn-caption");
    target.classList.add("kn-caption");
    for (const name of className?.split(/\s+/).filter(Boolean) ?? []) {
      if (!target.classList.contains(name)) {
        target.classList.add(name);
        this.addedClassNames.push(name);
      }
    }
  }
  render(tokens: readonly WordToken[], sourceText = ""): void {
    this.words.length = 0;
    const document = this.target.ownerDocument;
    const fragment = document.createDocumentFragment();
    const initial = sourceText.slice(0, tokens[0]?.start ?? sourceText.length);
    if (initial) {
      const prefix = document.createElement("span");
      prefix.textContent = initial;
      fragment.append(prefix);
    }
    for (const token of tokens) {
      const word = document.createElement("span");
      word.className = "kn-word";
      word.textContent = token.text;
      word.style.setProperty("--kn-progress", "0%");
      fragment.append(word);
      this.words.push(word);
      if (token.trailing) {
        const trailing = document.createElement("span");
        trailing.textContent = token.trailing;
        fragment.append(trailing);
      }
    }
    this.target.replaceChildren(fragment);
  }
  progress(index: number, value: number): void {
    this.words[index]?.style.setProperty(
      "--kn-progress",
      `${Math.max(0, Math.min(100, value)).toFixed(3)}%`,
    );
  }
  complete(index: number): void {
    this.words[index]?.style.setProperty("--kn-progress", "100%");
  }
  clear(): void {
    this.target.replaceChildren();
    this.words.length = 0;
    if (!this.hadCaptionClass) this.target.classList.remove("kn-caption");
    for (const name of this.addedClassNames) this.target.classList.remove(name);
  }
}
