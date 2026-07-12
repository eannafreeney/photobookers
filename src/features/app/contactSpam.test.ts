import { describe, expect, it } from "vitest";
import { isContactSpam } from "./contactSpam";

const now = 1_700_000_000_000;
const validTs = now - 5000;

const validInput = {
  message: "Hello, I have a question about photobooks.",
  ts: validTs,
};

describe("isContactSpam", () => {
  it("accepts a normal message", () => {
    expect(isContactSpam(validInput, now)).toEqual({ spam: false });
  });

  it("rejects honeypot field", () => {
    expect(
      isContactSpam({ ...validInput, website: "https://spam.example" }, now),
    ).toEqual({ spam: true, reason: "honeypot" });
  });

  it("rejects submissions faster than 3 seconds", () => {
    expect(isContactSpam({ ...validInput, ts: now - 1000 }, now)).toEqual({
      spam: true,
      reason: "timing",
    });
  });

  it("rejects missing timestamp", () => {
    expect(isContactSpam({ message: validInput.message }, now)).toEqual({
      spam: true,
      reason: "timing",
    });
  });

  it("rejects too many links", () => {
    expect(
      isContactSpam(
        {
          ...validInput,
          message:
            "Check http://a.com and http://b.com and http://c.com please",
        },
        now,
      ),
    ).toEqual({ spam: true, reason: "links" });
  });

  it("rejects short and long messages", () => {
    expect(isContactSpam({ ...validInput, message: "short" }, now)).toEqual({
      spam: true,
      reason: "length",
    });
    expect(
      isContactSpam({ ...validInput, message: "a".repeat(2001) }, now),
    ).toEqual({ spam: true, reason: "length" });
  });

  it("rejects blocked keywords", () => {
    expect(
      isContactSpam({ ...validInput, message: "Buy viagra cheap today!!!" }, now),
    ).toEqual({ spam: true, reason: "keywords" });
  });
});
