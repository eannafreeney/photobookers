import { describe, expect, it } from "vitest";
import { newsletterMarkSentSchema } from "./schema";

describe("newsletterMarkSentSchema", () => {
  it("coerces Hono plain-object form values (checkbox + hidden)", () => {
    expect(newsletterMarkSentSchema.safeParse({ sent: "false" }).data).toEqual(
      { sent: false },
    );
    expect(newsletterMarkSentSchema.safeParse({ sent: "true" }).data).toEqual({
      sent: true,
    });
    expect(
      newsletterMarkSentSchema.safeParse({ sent: ["false", "true"] }).data,
    ).toEqual({ sent: true });
    expect(
      newsletterMarkSentSchema.safeParse({ sent: ["false"] }).data,
    ).toEqual({ sent: false });
  });

  it("still accepts FormData", () => {
    const unchecked = new FormData();
    unchecked.append("sent", "false");
    expect(newsletterMarkSentSchema.safeParse(unchecked).data).toEqual({
      sent: false,
    });

    const checked = new FormData();
    checked.append("sent", "false");
    checked.append("sent", "true");
    expect(newsletterMarkSentSchema.safeParse(checked).data).toEqual({
      sent: true,
    });
  });
});
