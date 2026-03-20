import { eq } from "drizzle-orm";
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
  try {
    const newCreator = await createCreatorProfile({
      displayName: displayName.trim(),
      slug: slugify(displayName),
      coverUrl: getRandomCoverUrl(),
      ownerUserId: id,
      type,
      status: "stub",
      createdByUserId: id,
      website: website || null,
    });
    return ok(newCreator);
  } catch (error) {
    console.error("Failed to create artist", error);
    return err({ reason: "Failed to create artist" });
  }
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
    return newCreator;
  } catch (error) {
    console.error("Failed to create artist", error);
    return null;
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
