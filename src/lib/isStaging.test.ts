import { describe, expect, it, afterEach } from "vitest";
import { isStaging } from "./isStaging";

describe("isStaging", () => {
  const prev: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  function saveEnv(key: string) {
    prev[key] = process.env[key];
  }

  it("detects staging SITE_URL", () => {
    saveEnv("SITE_URL");
    saveEnv("DATABASE_URL");
    saveEnv("SUPABASE_URL");
    process.env.SITE_URL = "https://staging.photobookers.com";
    process.env.DATABASE_URL =
      "postgresql://postgres:pass@db.dbmbrwmygpnhjyyccbjp.supabase.co:5432/postgres";
    process.env.SUPABASE_URL = "https://dbmbrwmygpnhjyyccbjp.supabase.co";
    expect(isStaging()).toBe(true);
  });

  it("detects non-production Supabase config", () => {
    saveEnv("DATABASE_URL");
    saveEnv("SUPABASE_URL");
    saveEnv("SITE_URL");
    delete process.env.SITE_URL;
    process.env.DATABASE_URL =
      "postgresql://postgres:pass@db.stagingref.supabase.co:5432/postgres";
    process.env.SUPABASE_URL = "https://stagingref.supabase.co";
    expect(isStaging()).toBe(true);
  });

  it("does not flag production config", () => {
    saveEnv("DATABASE_URL");
    saveEnv("SUPABASE_URL");
    saveEnv("SITE_URL");
    process.env.SITE_URL = "https://www.photobookers.com";
    process.env.DATABASE_URL =
      "postgresql://postgres:pass@db.dbmbrwmygpnhjyyccbjp.supabase.co:5432/postgres";
    process.env.SUPABASE_URL = "https://dbmbrwmygpnhjyyccbjp.supabase.co";
    expect(isStaging()).toBe(false);
  });
});
