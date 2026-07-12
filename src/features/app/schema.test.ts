import { describe, expect, it } from "vitest";
import { contactFormSchema } from "./schema";

describe("contactFormSchema", () => {
  it("accepts a valid contact submission", () => {
    const parsed = contactFormSchema.parse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "Hello there",
      ts: "12345",
    });
    expect(parsed.ts).toBe(12345);
  });

  it("rejects invalid email and empty required fields", () => {
    expect(() =>
      contactFormSchema.parse({
        name: "",
        email: "bad",
        message: "Hello",
      }),
    ).toThrow();
  });
});
