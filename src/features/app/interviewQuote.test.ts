import { describe, expect, it } from "vitest";
import { interviewPullQuote } from "./interviewQuote";

describe("interviewPullQuote", () => {
  it("returns short answers untouched", () => {
    expect(interviewPullQuote("I photograph my street.")).toBe(
      "I photograph my street.",
    );
  });

  it("collapses whitespace from textarea answers", () => {
    expect(interviewPullQuote("I photograph\n\n  my street.")).toBe(
      "I photograph my street.",
    );
  });

  it("cuts on a sentence when one ends near the limit", () => {
    const answer =
      "The book began as a diary. I kept it for eleven years and never meant to show anyone, least of all a publisher who would want to make sense of it.";
    expect(interviewPullQuote(answer, 40)).toBe("The book began as a diary.");
  });

  it("cuts on a word with an ellipsis when no sentence fits", () => {
    const answer =
      "A long unbroken thought about photography that simply keeps going and never pauses for breath at all";
    const quote = interviewPullQuote(answer, 40);

    expect(quote?.endsWith("…")).toBe(true);
    expect(quote?.length).toBeLessThanOrEqual(41);
    expect(answer.startsWith(quote!.slice(0, -1))).toBe(true);
  });

  it("drops a dangling function word before the ellipsis", () => {
    const answer =
      "There is something intimate about being quiet and alone and responding instinctively and emotionally to a photograph";
    expect(interviewPullQuote(answer, 100)).toBe(
      "There is something intimate about being quiet and alone and responding instinctively…",
    );
  });

  it("returns null for empty answers", () => {
    expect(interviewPullQuote(undefined)).toBeNull();
    expect(interviewPullQuote("   ")).toBeNull();
  });
});
