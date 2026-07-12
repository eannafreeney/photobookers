import { and, eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { creators, NewCreator } from "../../../db/schema";
import { getRandomCoverUrl, slugify } from "../../../utils";
import { err, ok } from "../../../lib/result";
import { AuthSession } from "@supabase/supabase-js";

export const createStubCreatorProfile = async (session: AuthSession) => {
  const { user } = session;
  const { id, email, user_metadata } = user;
  if (!email) {
    return err({ reason: "User has no email", cause: undefined });
  }
  const { displayName, type, website } = user_metadata ?? {};
  if (!displayName?.trim() || !type) {
    return err({ reason: "Missing creator profile details", cause: undefined });
  }

  const existingCreator = await db.query.creators.findFirst({
    where: and(eq(creators.ownerUserId, id), eq(creators.type, type)),
  });
  if (existingCreator) return ok(existingCreator);

  const [newCreatorError, newCreator] = await createCreatorProfile({
    displayName: displayName.trim(),
    slug: slugify(displayName),
    coverUrl: getRandomCoverUrl(),
    ownerUserId: id,
    type,
    status: "stub",
    createdByUserId: id,
    website: website || null,
    email,
  });
  if (newCreatorError || !newCreator)
    return err({ reason: "Failed to create creator" });
  return ok(newCreator);
};

export const createCreatorProfile = async (input: NewCreator) => {
  try {
    const parts = input.displayName.trim().split(/\s+/);
    const sortName = parts[parts.length - 1];

    const [newCreator] = await db
      .insert(creators)
      .values({
        ...input,
        sortName,
      })
      .returning();
    if (!newCreator) return err({ reason: "Failed to create creator" });
    return ok(newCreator);
  } catch (error) {
    console.error("Failed to create artist", error);
    const pgCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : null;
    if (pgCode === "23505") {
      return err({
        reason:
          "This display name is already taken. If this is your profile, try signing in or use the claim flow from the artist page.",
        cause: error,
      });
    }
    return err({ reason: "Failed to create artist profile", cause: error });
  }
};

export const getCreatorById = async (creatorId: string) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      with: {
        booksAsArtist: true,
        booksAsPublisher: true,
      },
    });
    if (!creator) return err({ reason: "Creator not found" });
    return ok(creator);
  } catch (error) {
    console.error("Failed to get creator by id", error);
    return err({ reason: "Failed to get creator by id" });
  }
};

export const getCreatorEmailById = async (creatorId: string) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        email: true,
        displayName: true,
        type: true,
        ownerUserId: true,
        slug: true,
      },
    });
    if (!creator) return err({ reason: "Creator not found" });
    return ok(creator);
  } catch (error) {
    console.error("Failed to get creator by id", error);
    return err({ reason: "Failed to get creator by id" });
  }
};
