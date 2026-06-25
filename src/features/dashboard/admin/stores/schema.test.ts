import { describe, expect, it } from "vitest";
import { storeFormAdminSchema } from "./schema";

describe("storeFormAdminSchema", () => {
  it("requires address, city, and country", () => {
    const result = storeFormAdminSchema.safeParse({
      name: "Test Store",
      slug: "test-store",
      address: "",
      city: "Paris",
      country: "France",
      status: "draft",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid store form", () => {
    const result = storeFormAdminSchema.safeParse({
      name: "Test Store",
      slug: "test-store",
      description: "A photobook shop",
      address: "1 Rue de Rivoli",
      city: "Paris",
      country: "France",
      website: "",
      status: "published",
    });

    expect(result.success).toBe(true);
  });
});
