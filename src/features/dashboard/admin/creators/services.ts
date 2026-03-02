import { eq } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  creatorClaims,
  creators,
  NewCreator,
  UpdateCreator,
  User,
  users,
} from "../../../../db/schema";
import { getRandomCoverUrl, slugify } from "../../../../utils";
import { nanoid } from "nanoid";
import { updateCreatorOwnerAndStatus } from "../../../../services/claims";

export const getAllUserProfilesAdmin = async (): Promise<
  Pick<User, "id" | "email" | "firstName" | "lastName">[]
> => {
  return await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });
};

export const getCreatorByIdAdmin = async (creatorId: string) => {
  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    with: {
      booksAsArtist: true,
      booksAsPublisher: true,
    },
  });
  return creator ?? null;
};

export const createStubCreatorProfileAdmin = async (
  displayName: string,
  userId: string,
  type: "publisher" | "artist",
  website?: string,
) => {
  return await createCreatorProfileAdmin({
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

export const createCreatorProfileAdmin = async (input: NewCreator) => {
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

export const deleteCreatorByIdAdmin = async (creatorId: string) => {
  try {
    const [deletedCreator] = await db
      .delete(creators)
      .where(eq(creators.id, creatorId))
      .returning();
    return deletedCreator;
  } catch (error) {
    console.error("Failed to delete creator", error);
    return null;
  }
};

export const updateCreatorProfileAdmin = async (
  input: UpdateCreator,
  creatorId: string,
) => {
  try {
    // Exclude fields that shouldn't be updated
    const { id, slug, ownerUserId, createdAt, ...updateableFields } =
      input as any;

    const parts = updateableFields.displayName?.trim().split(/\s+/) ?? [];
    const sortName = parts.length > 0 ? parts[parts.length - 1] : undefined;

    const cleanedInput = {
      ...updateableFields,
      sortName,
      website: updateableFields.website || null,
      facebook: updateableFields.facebook || null,
      twitter: updateableFields.twitter || null,
      instagram: updateableFields.instagram || null,
      updatedAt: new Date(),
    };

    const [updatedCreator] = await db
      .update(creators)
      .set(cleanedInput)
      .where(eq(creators.id, creatorId))
      .returning();

    return updatedCreator;
  } catch (error) {
    console.error("Failed to update artist", error);
    return null;
  }
};

export const findUserByEmailAdmin = async (email: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user ?? null;
  } catch (error) {
    console.error("Failed to find user by email", error);
    return null;
  }
};

export const getUserByIdAdmin = async (id: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user ?? null;
  } catch (error) {
    console.error("Failed to get user by id", error);
    return null;
  }
};

export const assignCreatorToUserManually = async (
  userId: string,
  creatorId: string,
  websiteUrl?: string | null,
) => {
  const verificationToken = nanoid(32);
  const [claim] = await db
    .insert(creatorClaims)
    .values({
      userId,
      creatorId,
      verificationToken,
      verificationMethod: "website",
      verificationUrl: websiteUrl ?? null,
      status: "approved",
      verifiedAt: new Date(),
    })
    .returning();

  if (!claim) return null;
  await updateCreatorOwnerAndStatus(claim);
  return claim;
};
