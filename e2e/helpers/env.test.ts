import { afterEach, describe, expect, it } from "vitest";
import {
  allowsProductionE2eTarget,
  e2eTargetBlockReason,
  hasE2eEnv,
  isProductionE2eTarget,
} from "./env";

const REQUIRED = {
  DATABASE_URL:
    "postgresql://postgres:pass@db.dbmbrwmygpnhjyyccbjp.supabase.co:5432/postgres",
  SUPABASE_URL: "https://dbmbrwmygpnhjyyccbjp.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  AUTH_SECRET: "test-auth-secret",
} as const;

const STAGING = {
  DATABASE_URL:
    "postgresql://postgres:pass@db.stagingref.supabase.co:5432/postgres",
  SUPABASE_URL: "https://stagingref.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  AUTH_SECRET: "test-auth-secret",
} as const;

describe("e2e env guard", () => {
  const prev: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  function saveEnv(keys: string[]) {
    for (const key of keys) {
      prev[key] = process.env[key];
    }
  }

  function setEnv(values: Record<string, string | undefined>) {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  it("blocks production Supabase/DB config", () => {
    saveEnv([...Object.keys(REQUIRED), "E2E_ALLOW_PRODUCTION", "SITE_URL"]);
    setEnv({ ...REQUIRED, SITE_URL: "https://www.photobookers.com" });

    expect(isProductionE2eTarget()).toBe(true);
    expect(hasE2eEnv()).toBe(false);
    expect(e2eTargetBlockReason()).toMatch(/refuses to run against production/i);
  });

  it("allows staging Supabase/DB config", () => {
    saveEnv([...Object.keys(STAGING), "E2E_ALLOW_PRODUCTION", "SITE_URL"]);
    setEnv({ ...STAGING, SITE_URL: undefined });

    expect(isProductionE2eTarget()).toBe(false);
    expect(hasE2eEnv()).toBe(true);
    expect(e2eTargetBlockReason()).toBeNull();
  });

  it("allows production config when E2E_ALLOW_PRODUCTION=1", () => {
    saveEnv([...Object.keys(REQUIRED), "E2E_ALLOW_PRODUCTION", "SITE_URL"]);
    setEnv({
      ...REQUIRED,
      SITE_URL: "https://www.photobookers.com",
      E2E_ALLOW_PRODUCTION: "1",
    });

    expect(allowsProductionE2eTarget()).toBe(true);
    expect(isProductionE2eTarget()).toBe(false);
    expect(hasE2eEnv()).toBe(true);
  });
});
