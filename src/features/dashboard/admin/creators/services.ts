import { and, count, desc, eq, ilike, isNull, not, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  books,
  Creator,
  creatorInterviews,
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
import { createNewPublisherNotification } from "../notifications/utils";
import { AuthUser } from "../../../../../types";

export const removeCreatorOwnerAdminDB = async (creatorId: string) => {
  try {
    const [updatedCreator] = await db
      .update(creators)
      .set({
        ownerUserId: null,
        status: "stub",
      })
      .where(eq(creators.id, creatorId))
      .returning();
    if (!updatedCreator) {
      return err({ reason: "Creator not found", cause: undefined });
    }
    return ok(updatedCreator);
  } catch (error) {
    console.error("Failed to remove creator owner", error);
    return err({ reason: "Failed to remove creator owner", cause: error });
  }
};

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
    20,
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
) => {
  const { artist_id, new_artist_name } = formData;
  if (!artist_id && !new_artist_name)
    return err({ reason: "No artist selected" });

  if (artist_id) {
    const [error, creator] = await getCreatorById(artist_id);
    if (error || !creator) return err({ reason: "Invalid artist" });
    if (creator.type !== "artist")
      return err({ reason: "Creator is not an artist" });

    return ok(creator);
  }

  const [stubError, stubArtist] = await createStubCreatorProfileAdmin(
    new_artist_name!,
    userId,
    "artist",
  );
  if (stubError || !stubArtist)
    return err({ reason: "Failed to create artist" });
  if (stubArtist.type !== "artist")
    return err({ reason: "Created creator is not an artist" });

  return ok(stubArtist);
};

export const resolvePublisher = async (
  formData: { publisher_id?: string; new_publisher_name?: string },
  user: AuthUser,
) => {
  const { publisher_id, new_publisher_name } = formData;

  if (!publisher_id && !new_publisher_name) {
    return ok(null);
  }

  if (publisher_id) {
    const [error, creator] = await getCreatorById(publisher_id);
    if (error || !creator) return err({ reason: "Invalid publisher" });
    if (creator.type !== "publisher")
      return err({ reason: "Creator is not a publisher" });

    return ok(creator);
  }

  // only new_publisher_name branch remains
  const [stubError, stubPublisher] = await createStubCreatorProfileAdmin(
    new_publisher_name!,
    user.id,
    "publisher",
  );

  if (stubError || !stubPublisher)
    return err({ reason: "Failed to create publisher" });
  if (stubPublisher.type !== "publisher")
    return err({ reason: "Created creator is not a publisher" });

  await createNewPublisherNotification(user, stubPublisher);
  return ok(stubPublisher);
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
    const [row] = await db
      .update(creators)
      .set({ welcomeEmailSent: new Date() })
      .where(eq(creators.id, creatorId))
      .returning();
    return ok(row);
  } catch (error) {
    console.error("Failed to mark welcome email sent", error);
    return err({ reason: "Failed to mark welcome email sent", cause: error });
  }
};

export const getCreatorRecipientEmailAdmin = async (creatorId: string) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      with: { owner: true },
    });
    if (!creator) return err({ reason: "Creator not found" });

    return ok({
      creator,
      recipientEmail: creator.email ?? creator.owner?.email ?? null,
    });
  } catch (error) {
    console.error("Failed to get creator recipient email", error);
    return err({
      reason: "Failed to get creator recipient email",
      cause: error,
    });
  }
};

export const createCreatorInterviewInviteAdmin = async (input: {
  creatorId: string;
  recipientEmail: string;
  invitedByUserId: string;
  inviteToken: string;
  interviewType?: "introduction" | "book";
  bookId?: string | null;
}) => {
  try {
    const [row] = await db
      .insert(creatorInterviews)
      .values({
        creatorId: input.creatorId,
        recipientEmail: input.recipientEmail,
        invitedByUserId: input.invitedByUserId,
        inviteToken: input.inviteToken,
        interviewType: input.interviewType ?? "introduction",
        bookId: input.bookId ?? null,
        status: "sent",
        invitedAt: new Date(),
      })
      .returning();
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to create interview invite", cause: error });
  }
};

export const getInterviewByToken = async (inviteToken: string) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.inviteToken, inviteToken),
      with: { creator: true },
    });
    return ok(interview);
  } catch (error) {
    return err({ reason: "Failed to get interview by token", cause: error });
  }
};

export const completeInterviewByToken = async (
  inviteToken: string,
  answers: { q1: string; q2: string; q3: string; q4: string; q5: string },
) => {
  try {
    const [row] = await db
      .update(creatorInterviews)
      .set({
        status: "completed",
        completedAt: new Date(),
        answers,
      })
      .where(
        and(
          eq(creatorInterviews.inviteToken, inviteToken),
          eq(creatorInterviews.status, "sent"),
        ),
      )
      .returning();

    if (!row) {
      return err({
        reason: "Interview not found or already completed",
        cause: undefined,
      });
    }

    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to complete interview", cause: error });
  }
};

export const getAdminCreatorInterviews = async (currentPage: number) => {
  try {
    const rows = await db.query.creatorInterviews.findMany({
      orderBy: [desc(creatorInterviews.invitedAt)],
      with: { creator: true },
    });
    const totalCount = rows.length;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30,
    );
    return ok({
      interviews: rows.slice(offset, offset + limit),
      page,
      totalPages,
    });
  } catch (error) {
    return err({
      reason: "Failed to get admin creator interviews",
      cause: error,
    });
  }
};

export const markInterviewEmailSentAdmin = async (creatorId: string) => {
  try {
    const [row] = await db
      .update(creators)
      .set({ interviewEmailSent: new Date() })
      .where(eq(creators.id, creatorId))
      .returning();
    return ok(row);
  } catch (error) {
    return err({ reason: "Failed to mark interview email sent", cause: error });
  }
};
