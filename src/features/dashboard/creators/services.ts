import { db } from "../../../db/client";
import { creators, NewCreator } from "../../../db/schema";
import { getRandomCoverUrl, slugify } from "../../../utils";

export const createStubCreatorProfile = async (
  displayName: string,
  userId: string,
  type: "publisher" | "artist",
  website?: string,
) => {
  return await createCreatorProfile({
    displayName: displayName.trim(),
    slug: slugify(displayName),
    coverUrl: getRandomCoverUrl(),
    ownerUserId: null,
    type,
    status: "stub",
    createdByUserId: userId,
    website: website || null,
  });
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
