import { describe, expect, it } from "vitest";
import {
  assertSafeStagingSyncConfig,
  parseDatabaseUrlForSync,
} from "./syncStagingFromProduction";

describe("parseDatabaseUrlForSync", () => {
  it("parses postgres URLs", () => {
    expect(
      parseDatabaseUrlForSync(
        "postgresql://user:pass@db.prod.supabase.co:5432/postgres",
      ),
    ).toEqual({
      host: "db.prod.supabase.co",
      port: "5432",
      database: "postgres",
      usesPgBouncer: false,
    });
  });

  it("flags transaction pooler URLs", () => {
    expect(
      parseDatabaseUrlForSync(
        "postgresql://user:pass@aws-0-eu.pooler.supabase.com:6543/postgres?pgbouncer=true",
      ).usesPgBouncer,
    ).toBe(true);
  });
});

describe("assertSafeStagingSyncConfig", () => {
  it("rejects identical source and target", () => {
    const url = "postgresql://user:pass@db.prod.supabase.co:5432/postgres";
    const [error] = assertSafeStagingSyncConfig(url, url);
    expect(error?.reason).toMatch(/different databases/);
  });

  it("allows distinct hosts", () => {
    const [error] = assertSafeStagingSyncConfig(
      "postgresql://user:pass@db.prod.supabase.co:5432/postgres",
      "postgresql://user:pass@db.staging.supabase.co:5432/postgres",
    );
    expect(error).toBeNull();
  });

  it("rejects pooler URLs", () => {
    const [error] = assertSafeStagingSyncConfig(
      "postgresql://user:pass@aws-0-eu.pooler.supabase.com:6543/postgres",
      "postgresql://user:pass@db.staging.supabase.co:5432/postgres",
    );
    expect(error?.reason).toMatch(/transaction pooler/);
  });
});
