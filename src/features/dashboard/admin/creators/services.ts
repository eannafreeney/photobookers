import { and, count, eq, ilike, isNull, not, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  books,
  Creator,
  creators,
  NewCreator,
  UpdateCreator,
  User,
  users,
} from "../../../../db/schema";
import { getRandomCoverUrl, slugify } from "../../../../utils";
import { getCreatorById } from "../../creators/services";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";

export const getAllUserProfilesAdmin = async (): Promise<
  Pick<User, "id" | "email" | "firstName" | "lastName">[]
> => {
  return await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .leftJoin(creators, eq(creators.ownerUserId, users.id))
    .where(isNull(creators.id));
};

export const getAllCreatorProfilesByTypeAdmin = async (
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

export const getAllCreatorProfiles = async () => {
  try {
    const foundCreators = await db.query.creators.findMany({
      where: isNull(creators.ownerUserId),
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
    });
    return ok(foundCreators ?? []);
  } catch (error) {
    console.error("Failed to get all creator profiles", error);
    return err({ reason: "Failed to get all creator profiles", cause: error });
  }
};

export const getCreatorByIdAdmin = async (creatorId: string) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      with: {
        booksAsArtist: true,
        booksAsPublisher: true,
      },
    });
    return ok(creator ?? null);
  } catch (error) {
    console.error("Failed to get creator by id", error);
    return err({ reason: "Failed to get creator by id", cause: error });
  }
};

export const createStubCreatorProfileAdmin = async (
  displayName: string,
  userId: string,
  type: "publisher" | "artist",
  website?: string,
  email?: string,
) => {
  try {
    const newCreator = await createCreatorProfileAdmin({
      displayName: displayName.trim(),
      slug: slugify(displayName),
      coverUrl: getRandomCoverUrl(),
      ownerUserId: null,
      type,
      status: "stub",
      createdByUserId: userId,
      website: website || null,
      email: email || null,
    });
    return ok(newCreator);
  } catch (error) {
    console.error("Failed to create artist", error);
    return err({ reason: "Failed to create artist", cause: error });
  }
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
      email: updateableFields.email || null,
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
  const normalizedEmail = email.trim().toLowerCase();
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
    const [error, creator] = await getCreatorById(artist_id);
    if (error || !creator) {
      return "error";
    }
    return creator?.type === "artist" ? creator : "error";
  }

  // Create new stub artist
  if (new_artist_name) {
    const [error, creator] = await createStubCreatorProfileAdmin(
      new_artist_name,
      userId,
      "artist",
    );
    if (error || !creator) {
      return "error";
    }
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
    const [error, creator] = await getCreatorById(publisher_id);
    if (error || !creator) {
      return "error";
    }
    return creator?.type === "publisher" ? creator : "error";
  }

  // Create new stub publisher
  if (new_publisher_name) {
    const [error, publisher] = await createStubCreatorProfileAdmin(
      new_publisher_name,
      userId,
      "publisher",
    );
    if (error || !publisher) {
      return "error";
    }
    return publisher?.type === "publisher" ? publisher : "error";
  }

  return null;
};

export const getBooksByCreatorId = async (
  creatorId: string,
  currentPage: number,
  searchQuery?: string,
) => {
  const baseFilter = or(
    eq(books.artistId, creatorId),
    eq(books.publisherId, creatorId),
  );
  const titleFilter = searchQuery?.trim()
    ? ilike(books.title, `%${searchQuery.trim()}%`)
    : undefined;

  const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;

  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(whereClause);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30,
    );

    const foundBooks = await db.query.books.findMany({
      where: whereClause,
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      with: {
        artist: true,
        publisher: true,
      },
      limit,
      offset,
    });
    if (foundBooks.length === 0) return err({ reason: "No books found" });

    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by creator id", error);
    return err({ reason: "Failed to get books by creator id", cause: error });
  }
};

export const markWelcomeEmailSentAdmin = async (creatorId: string) => {
  try {
    await db
      .update(creators)
      .set({ welcomeEmailSent: new Date() })
      .where(eq(creators.id, creatorId));

    return ok(undefined);
  } catch (error) {
    console.error("Failed to mark welcome email sent", error);
    return err({ reason: "Failed to mark welcome email sent", cause: error });
  }
};
