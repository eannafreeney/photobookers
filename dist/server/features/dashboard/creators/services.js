import { eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { creators } from "../../../db/schema.js";
import { getRandomCoverUrl, slugify } from "../../../utils.js";
import { err, ok } from "../../../lib/result.js";
const createStubCreatorProfile = async (session) => {
  const { user } = session;
  const { id, email, user_metadata } = user;
  if (!email) {
    return err({ reason: "User has no email", cause: void 0 });
  }
  const { displayName, type, website } = user_metadata ?? {};
  const [newCreatorError, newCreator] = await createCreatorProfile({
    displayName: displayName.trim(),
    slug: slugify(displayName),
    coverUrl: getRandomCoverUrl(),
    ownerUserId: id,
    type,
    status: "stub",
    createdByUserId: id,
    website: website || null,
    email
  });
  if (newCreatorError || !newCreator)
    return err({ reason: "Failed to create creator" });
  return ok(newCreator);
};
const createCreatorProfile = async (input) => {
  try {
    const parts = input.displayName.trim().split(/\s+/);
    const sortName = parts[parts.length - 1];
    const [newCreator] = await db.insert(creators).values({
      ...input,
      sortName
    }).returning();
    if (!newCreator) return err({ reason: "Failed to create creator" });
    return ok(newCreator);
  } catch (error) {
    console.error("Failed to create artist", error);
    return err({ reason: "Failed to create artist", cause: error });
  }
};
const getCreatorById = async (creatorId) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      with: {
        booksAsArtist: true,
        booksAsPublisher: true
      }
    });
    if (!creator) return err({ reason: "Creator not found" });
    return ok(creator);
  } catch (error) {
    console.error("Failed to get creator by id", error);
    return err({ reason: "Failed to get creator by id" });
  }
};
const getCreatorEmailById = async (creatorId) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: {
        id: true,
        email: true,
        displayName: true,
        type: true,
        ownerUserId: true,
        slug: true
      }
    });
    if (!creator) return err({ reason: "Creator not found" });
    return ok(creator);
  } catch (error) {
    console.error("Failed to get creator by id", error);
    return err({ reason: "Failed to get creator by id" });
  }
};
export {
  createCreatorProfile,
  createStubCreatorProfile,
  getCreatorById,
  getCreatorEmailById
};
