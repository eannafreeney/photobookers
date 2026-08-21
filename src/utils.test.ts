import { describe, expect, it, vi } from "vitest";

vi.mock("./db/client", () => ({ db: {} }));

import { slugify } from "./utils";
import { slugSchema } from "./features/app/schema";

describe("slugify", () => {
  it("slugifies ordinary names unchanged", () => {
    expect(slugify("YURI GOTO")).toBe("yuri-goto");
    expect(slugify("Hoxton Mini Press")).toBe("hoxton-mini-press");
  });

  it("folds diacritics to ASCII", () => {
    expect(slugify("Café Society")).toBe("cafe-society");
    expect(slugify("Ólafur Elíasson")).toBe("olafur-eliasson");
  });

  it("returns an empty string when nothing survives", () => {
    // The case behind the `/creators/` 404: callers must not store this.
    expect(slugify("後藤由里")).toBe("");
    expect(slugify("🎉🎉")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("only ever produces slugs that slugSchema accepts", () => {
    for (const name of [
      "YURI GOTO",
      "Café Society",
      "A Tear for Someone / Undeserving!",
      "status_01 Schloss Tylsen",
    ]) {
      const slug = slugify(name);
      expect(() => slugSchema.parse({ slug })).not.toThrow();
    }
  });
});
