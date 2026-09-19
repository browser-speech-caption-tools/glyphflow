import { describe, expect, it } from "vitest";
import { TimingPredictor } from "../src/timing-predictor";
import { tokenize } from "../src/tokenizer";

describe("TimingPredictor", () => {
  const word = tokenize("karaoke")[0]!;
  it("makes a bounded initial estimate", () => {
    expect(new TimingPredictor().predict(word, 1.6)).toBeGreaterThanOrEqual(90);
    expect(new TimingPredictor().predict(word, 1)).toBeLessThan(2000);
  });
  it("learns toward observed durations and rejects outliers", () => {
    const predictor = new TimingPredictor(100);
    predictor.observe(word, 900, 1);
    expect(predictor.millisecondsPerUnit).toBeGreaterThan(100);
    const learned = predictor.millisecondsPerUnit;
    expect(predictor.observe(word, 10_000, 1)).toBe(false);
    expect(predictor.millisecondsPerUnit).toBe(learned);
  });
  it("adds short punctuation and sentence pauses", () => {
    const predictor = new TimingPredictor();
    const plain = tokenize("hello world")[0]!;
    const comma = tokenize("hello, world")[0]!;
    const sentence = tokenize("hello! world")[0]!;
    expect(predictor.predict(comma, 1)).toBeGreaterThan(predictor.predict(plain, 1));
    expect(predictor.predict(sentence, 1)).toBeGreaterThan(predictor.predict(comma, 1));
    expect(predictor.predict(comma, 1.6)).toBeLessThan(predictor.predict(comma, 1));
  });
  it("excludes punctuation pauses when learning speaking speed", () => {
    const predictor = new TimingPredictor(155);
    const comma = tokenize("hello, world")[0]!;
    const expected = predictor.predict(comma, 1);
    expect(predictor.observe(comma, expected, 1)).toBe(true);
    expect(predictor.millisecondsPerUnit).toBeCloseTo(155);
  });
  it("reaches 94% at prediction then remains below 98.5%", () => {
    const predictor = new TimingPredictor();
    expect(predictor.progress(500, 500)).toBe(94);
    expect(predictor.progress(100_000, 500)).toBeLessThanOrEqual(98.5);
  });
});
