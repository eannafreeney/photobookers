import { isStaging } from "../../src/lib/isStaging";

const REQUIRED_VARS = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTH_SECRET",
] as const;

/** Escape hatch for local debugging only — never set in CI. */
export function allowsProductionE2eTarget(): boolean {
  return process.env.E2E_ALLOW_PRODUCTION === "1";
}

export function missingE2eEnvVars(): string[] {
  return REQUIRED_VARS.filter((key) => !process.env[key]?.trim());
}

export function isProductionE2eTarget(): boolean {
  if (allowsProductionE2eTarget()) return false;
  if (missingE2eEnvVars().length > 0) return false;
  return !isStaging();
}

export function e2eTargetBlockReason(): string | null {
  const missing = missingE2eEnvVars();
  if (missing.length > 0) {
    return `Missing env vars: ${missing.join(", ")}`;
  }
  if (isProductionE2eTarget()) {
    return (
      "E2E refuses to run against production. Use staging credentials " +
      "(non-production SUPABASE_URL / DATABASE_URL, or IS_STAGING=true). " +
      "To override locally: E2E_ALLOW_PRODUCTION=1"
    );
  }
  return null;
}

export function hasE2eEnv(): boolean {
  return e2eTargetBlockReason() === null;
}

export function assertE2eTargetAllowed(): void {
  const reason = e2eTargetBlockReason();
  if (reason) throw new Error(reason);
}

export function e2eBaseUrl(): string {
  const port = process.env.E2E_PORT ?? "5199";
  return (process.env.E2E_BASE_URL ?? `http://localhost:${port}`).replace(
    /\/$/,
    "",
  );
}
