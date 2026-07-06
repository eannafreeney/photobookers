const REQUIRED_VARS = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTH_SECRET",
] as const;

export function hasE2eEnv(): boolean {
  return REQUIRED_VARS.every((key) => Boolean(process.env[key]?.trim()));
}

export function missingE2eEnvVars(): string[] {
  return REQUIRED_VARS.filter((key) => !process.env[key]?.trim());
}

export function e2eBaseUrl(): string {
  const port = process.env.E2E_PORT ?? "5199";
  return (process.env.E2E_BASE_URL ?? `http://localhost:${port}`).replace(
    /\/$/,
    "",
  );
}
