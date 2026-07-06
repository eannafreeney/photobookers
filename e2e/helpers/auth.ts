import { createClient } from "@supabase/supabase-js";
import type { BrowserContext } from "@playwright/test";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "../../src/db/schema";
import { getE2eDb } from "./db";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type E2eUser = {
  id: string;
  email: string;
  password: string;
};

export async function createE2eUser(opts?: {
  emailDomain?: string;
  isAdmin?: boolean;
}): Promise<E2eUser> {
  const domain = opts?.emailDomain ?? "example.com";
  const email = `e2e-claim-${nanoid(10)}@${domain}`;
  const password = `E2e-${nanoid(16)}!`;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create Supabase user");
  }

  await getE2eDb()
    .insert(users)
    .values({
      id: data.user.id,
      email,
      firstName: "E2E",
      lastName: "Claim",
      isAdmin: opts?.isAdmin ?? false,
      acceptsTerms: new Date(),
    });

  return { id: data.user.id, email, password };
}

export async function deleteE2eAuthUsers(userIds: string[]) {
  const supabase = getSupabaseAdmin();
  for (const userId of userIds) {
    await supabase.auth.admin.deleteUser(userId);
  }
}

export async function signInAndSetCookies(
  context: BrowserContext,
  user: Pick<E2eUser, "email" | "password">,
  baseUrl: string,
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Failed to sign in test user");
  }

  const hostname = new URL(baseUrl).hostname;
  const secure = baseUrl.startsWith("https://");

  await context.addCookies([
    {
      name: "token",
      value: data.session.access_token,
      domain: hostname,
      path: "/",
      httpOnly: true,
      secure,
      sameSite: "Lax",
    },
    {
      name: "refresh_token",
      value: data.session.refresh_token,
      domain: hostname,
      path: "/",
      httpOnly: true,
      secure,
      sameSite: "Lax",
    },
  ]);
}

export async function setUserAdmin(userId: string, isAdmin: boolean) {
  await getE2eDb()
    .update(users)
    .set({ isAdmin })
    .where(eq(users.id, userId));
}
