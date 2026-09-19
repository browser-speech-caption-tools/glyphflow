import type { WordToken } from "./types";

const isWord = (value: string) => /[\p{L}\p{N}]/u.test(value);

function estimateUnits(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return 1;
  let groups = normalized.match(/[aeiouy]+/g)?.length ?? 1;
  if (normalized.length > 3 && /[^aeiou]e$/.test(normalized)) groups -= 0.5;
  const digraphs = normalized.match(/th|sh|ch|ph|ng/g)?.length ?? 0;
  return Math.max(
    1,
    groups * 2 + Math.max(0, normalized.length - groups) * 0.2 - digraphs * 0.15,
  );
}

export function tokenize(text: string, locale = "en"): WordToken[] {
  const positions: Array<{ text: string; start: number; end: number }> = [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    for (const part of segmenter.segment(text)) {
      if (part.isWordLike)
        positions.push({
          text: part.segment,
          start: part.index,
          end: part.index + part.segment.length,
        });
    }
  } else {
    for (const match of text.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)) {
      positions.push({
        text: match[0],
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      });
    }
  }
  return positions
    .filter((item) => isWord(item.text))
    .map((item, index) => ({
      ...item,
      trailing: text.slice(item.end, positions[index + 1]?.start ?? text.length),
      units: estimateUnits(item.text),
    }));
}

/** Finds the containing word, otherwise the closest following word then closest prior word. */
export function findTokenIndex(
  tokens: readonly WordToken[],
  charIndex: number,
): number {
  if (!tokens.length) return -1;
  let low = 0;
  let high = tokens.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (tokens[middle]!.end <= charIndex) low = middle + 1;
    else high = middle;
  }
  return Math.min(low, tokens.length - 1);
}
