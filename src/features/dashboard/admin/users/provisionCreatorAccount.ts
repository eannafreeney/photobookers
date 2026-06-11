import { eq } from "drizzle-orm";
import { db } from "../../../../db/client";
import { creators } from "../../../../db/schema";
import { err, ok, type Result } from "../../../../lib/result";
import { assignUserAsCreatorOwnerAdmin } from "../claims/services";
import { findUserByEmailAdmin } from "../creators/services";
import { createAuthUser, createUserWithAuthId } from "./services";

function appBaseUrl(): string {
  return (
    process.env.SITE_URL ??
    process.env.PUBLIC_APP_URL ??
    "https://www.photobookers.com"
  ).replace(/\/$/, "");
}

export function buildCreatorLoginUrl(params: {
  email: string;
  temporaryPassword?: string;
  redirectUrl?: string;
}): string {
  const url = new URL(`${appBaseUrl()}/auth/login`);
  url.searchParams.set("email", params.email);
  if (params.temporaryPassword) {
    url.searchParams.set("password", params.temporaryPassword);
  }
  if (params.redirectUrl) {
    url.searchParams.set("redirectUrl", params.redirectUrl);
  }
  return url.toString();
}

function nameFromDisplayName(displayName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Creator", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export type ProvisionCreatorAccountOutcome =
  | { status: "already_claimed"; ownerUserId: string }
  | {
      status: "created";
      ownerUserId: string;
      email: string;
      temporaryPassword: string;
      loginUrl: string;
    }
  | {
      status: "linked_existing";
      ownerUserId: string;
      email: string;
      loginUrl: string;
    }
  | { status: "failed"; reason: string };

/** Creates or links a user account for an unclaimed creator profile. */
export async function provisionCreatorUserAccount(params: {
  creatorId: string;
  email: string;
  displayName: string;
}): Promise<Result<ProvisionCreatorAccountOutcome, { reason: string }>> {
  const email = params.email.trim();
  if (!email) {
    return err({ reason: "Email is required" });
  }

  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, params.creatorId),
      columns: { id: true, ownerUserId: true, slug: true },
    });
    if (!creator) return err({ reason: "Creator not found" });

    const dashboardRedirect = `/dashboard/creators/${creator.slug}`;

    if (creator.ownerUserId) {
      return ok({
        status: "already_claimed",
        ownerUserId: creator.ownerUserId,
      });
    }

    const existingUser = await findUserByEmailAdmin(email);
    if (existingUser) {
      const [assignError] = await assignUserAsCreatorOwnerAdmin(
        existingUser.id,
        creator.id,
      );
      if (assignError) {
        return ok({ status: "failed", reason: assignError.reason });
      }
      return ok({
        status: "linked_existing",
        ownerUserId: existingUser.id,
        email,
        loginUrl: buildCreatorLoginUrl({
          email,
          redirectUrl: dashboardRedirect,
        }),
      });
    }

    const temporaryPassword = crypto.randomUUID();
    const { firstName, lastName } = nameFromDisplayName(params.displayName);
    const formData = {
      email,
      firstName,
      lastName,
      creatorId: params.creatorId,
    };

    const [authError, authData] = await createAuthUser(
      temporaryPassword,
      formData,
    );
    if (authError) {
      return ok({ status: "failed", reason: authError.reason });
    }

    const authUserId = authData.data.user.id;
    const [userError] = await createUserWithAuthId(authUserId, formData, {
      mustResetPassword: true,
    });
    if (userError) {
      return ok({ status: "failed", reason: userError.reason });
    }

    const [assignError] = await assignUserAsCreatorOwnerAdmin(
      authUserId,
      creator.id,
    );
    if (assignError) {
      return ok({ status: "failed", reason: assignError.reason });
    }

    return ok({
      status: "created",
      ownerUserId: authUserId,
      email,
      temporaryPassword,
      loginUrl: buildCreatorLoginUrl({
        email,
        temporaryPassword,
        redirectUrl: dashboardRedirect,
      }),
    });
  } catch (error) {
    console.error("provisionCreatorUserAccount", error);
    return err({
      reason: "Failed to provision creator account",
      cause: error,
    });
  }
}
