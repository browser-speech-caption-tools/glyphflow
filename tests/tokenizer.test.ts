import { describe, expect, it } from "vitest";
import { findTokenIndex, tokenize } from "../src/tokenizer";

describe("tokenize", () => {
  it("preserves punctuation, whitespace, newlines, and apostrophes", () => {
    const text = "Don't  stop,\nplease!"; const tokens = tokenize(text);
    expect(tokens.map((t) => t.text)).toEqual(["Don't", "stop", "please"]);
    expect(tokens.map((t) => t.trailing)).toEqual(["  ", ",\n", "!"]);
    expect(tokens.map((t) => t.text + t.trailing).join("")).toBe(text);
  });
  it("maps char indexes including punctuation to stable words", () => {
    const tokens = tokenize("one, two three");
    expect(findTokenIndex(tokens, 5)).toBe(1); expect(findTokenIndex(tokens, 3)).toBe(1);
  });
  it("distinguishes repeated words by index", () => {
    const tokens = tokenize("go go go");
    expect(findTokenIndex(tokens, 0)).toBe(0); expect(findTokenIndex(tokens, 3)).toBe(1); expect(findTokenIndex(tokens, 6)).toBe(2);
  });
});
