import { and, count, eq, ilike } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  Creator,
  creatorClaims,
  creators,
  NewCreator,
  UpdateCreator,
  User,
  users,
} from "../../../../db/schema";
import { getRandomCoverUrl, slugify } from "../../../../utils";
import { nanoid } from "nanoid";
import {
  createStubCreatorProfile,
  getCreatorById,
} from "../../creators/services";
import { getPagination } from "../../../../lib/pagination";

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

export const getAllCreatorProfilesAdmin = async (
  searchQuery?: string,
  currentPage: number = 1,
  type: "artist" | "publisher" | undefined = undefined,
): Promise<{ creators: Creator[]; totalPages: number; page: number }> => {
  let creatorIds: string[] = [];
  if (searchQuery) {
    const rows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, `%${searchQuery}%`));
    creatorIds = rows.map((r) => r.id);
  }

  const searchCondition =
    searchQuery && searchQuery.trim() !== ""
      ? ilike(creators.displayName, `%${searchQuery}%`)
      : undefined;

  const typeCondition = type ? eq(creators.type, type) : undefined;

  const whereCondition =
    searchCondition && typeCondition
      ? searchCondition && typeCondition
      : (searchCondition ?? typeCondition ?? undefined);

  const [{ value: totalCount = 0 }] = await db
    .select({ value: count() })
    .from(creators)
    .where(whereCondition);

  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    30,
  );

  const foundCreators = await db.query.creators.findMany({
    where: whereCondition,
    offset,
    limit,
  });
  return { creators: foundCreators, totalPages, page };
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

export const getAllCreatorOptions = async (
  creatorType: "artist" | "publisher",
) => {
  const foundCreators = await db.query.creators.findMany({
    where: eq(creators.type, creatorType),
    orderBy: (creators, { asc }) => [asc(creators.sortName)],
  });
  return (
    foundCreators?.map((creator) => ({
      id: creator.id,
      label: creator.displayName,
    })) ?? []
  );
};

export const resolveArtist = async (
  formData: { artist_id?: string; new_artist_name?: string },
  userId: string,
): Promise<Creator | null | "error"> => {
  const { artist_id, new_artist_name } = formData;

  // Using existing artist
  if (artist_id) {
    const creator = await getCreatorById(artist_id);
    return creator?.type === "artist" ? creator : "error";
  }

  // Create new stub artist
  if (new_artist_name) {
    const creator = await createStubCreatorProfile(
      new_artist_name,
      userId,
      "artist",
    );
    return creator?.type === "artist" ? creator : "error";
  }

  return null;
};

export const resolvePublisher = async (
  formData: { publisher_id?: string; new_publisher_name?: string },
  userId: string,
): Promise<Creator | null | "error"> => {
  const { publisher_id, new_publisher_name } = formData;

  // No publisher specified
  if (!publisher_id && !new_publisher_name) {
    return null;
  }

  // Using existing publisher
  if (publisher_id) {
    const creator = await getCreatorById(publisher_id);
    return creator?.type === "publisher" ? creator : "error";
  }

  // Create new stub publisher
  if (new_publisher_name) {
    const publisher = await createStubCreatorProfile(
      new_publisher_name,
      userId,
      "publisher",
    );
    return publisher?.type === "publisher" ? publisher : "error";
  }

  return null;
};
