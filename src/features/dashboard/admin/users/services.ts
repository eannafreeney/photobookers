import { and, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  books,
  collectionItems,
  creatorClaims,
  creators,
  follows,
  likes,
  users,
  wishlists,
} from "../../../../db/schema";
import { newUserFormAdminSchema } from "./schema";
import z from "zod";
import { getPagination } from "../../../../lib/pagination";
import { supabaseAdmin } from "../../../../lib/supabase";
import { err, ok } from "../../../../lib/result";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  CreatorCardResult,
} from "../../../../constants/queries";
import { BookCardResult } from "../../../../constants/queries";
import { Result } from "drizzle-orm/sqlite-core";

const orderByIds = <T extends { id: string }>(ids: string[], items: T[]) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((x): x is T => !!x);
};

type NewUserForm = z.infer<typeof newUserFormAdminSchema>;

export const getAllUsersAdmin = async (
  searchQuery?: string,
  currentPage: number = 1,
  defaultLimit = 30,
) => {
  let userIds: string[] = [];
  if (searchQuery) {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(ilike(users.email, `%${searchQuery}%`));
    userIds = rows.map((r) => r.id);
  }

  const searchCondition =
    searchQuery && searchQuery.trim() !== ""
      ? ilike(users.email, `%${searchQuery}%`)
      : undefined;

  const [{ value: totalCount = 0 }] = await db
    .select({ value: count() })
    .from(users)
    .where(searchCondition);

  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    defaultLimit,
  );

  try {
    const usersData = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
      where: searchCondition,
      limit,
      offset,
      with: {
        creators: {
          columns: { id: true, slug: true, displayName: true, status: true },
        },
      },
    });
    return { users: usersData ?? [], totalPages, page };
  } catch (error) {
    console.error("Failed to get all users", error);
    return { users: [], totalPages: 0, page: 1 };
  }
};

export const getUserById = async (id: string) => {
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

export const createUserWithAuthId = async (
  authUserId: string,
  formData: NewUserForm,
  options?: {
    mustResetPassword?: boolean;
  },
) => {
  try {
    const user = await db
      .insert(users)
      .values({
        id: authUserId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mustResetPassword: options?.mustResetPassword ?? false,
      })
      .onConflictDoNothing({ target: users.id })
      .returning();
    return ok(user);
  } catch (error) {
    console.error("Failed to create user with auth id", error);
    return err({ reason: "Failed to create user with auth id", cause: error });
  }
};

export const deleteUserById = async (userId: string) => {
  return await db.transaction(async (tx) => {
    await tx
      .update(creators)
      .set({ ownerUserId: null })
      .where(eq(creators.ownerUserId, userId));
    await tx.delete(creatorClaims).where(eq(creatorClaims.userId, userId));
    await tx.delete(follows).where(eq(follows.followerUserId, userId));
    const result = await tx
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    return result;
  });
};

export const createAuthUser = async (
  temporaryPassword: string,
  formData: NewUserForm,
) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        firstName: formData.firstName,
        lastName: formData.lastName,
      },
    });
    if (error) {
      return err({ reason: "Failed to create auth user", cause: error });
    }
    return ok({ data, temporaryPassword });
  } catch (error) {
    console.error("Failed to create auth user", error);
    return err({ reason: "Failed to create auth user", cause: error });
  }
};

export const getUserByIdAdmin = async (
  id: string,
  options?: { withActivity?: boolean; activityLimit?: number },
) => {
  const withActivity = options?.withActivity ?? false;
  const activityLimit = options?.activityLimit ?? 10;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        creators: {
          columns: {
            id: true,
            slug: true,
            displayName: true,
            coverUrl: true,
          },
          with: {
            booksAsArtist: true,
            booksAsPublisher: true,
          },
        },
      },
    });

    if (!user) return ok(null);
    if (!withActivity) {
      return ok({
        ...user,
        likedBooks: [],
        wishlistedBooks: [],
        collectedBooks: [],
        followedCreators: [],
      });
    }

    const [likedBooks, wishlistedBooks, collectedBooks, followedCreators] =
      await Promise.all([
        getBooksLikedForUserAdmin(id, activityLimit),
        getBooksWishlistedForUserAdmin(id, activityLimit),
        getBooksCollectedForUserAdmin(id, activityLimit),
        getCreatorsFollowedForUserAdmin(id, activityLimit),
      ]);

    return ok({
      ...user,
      likedBooks,
      wishlistedBooks,
      collectedBooks,
      followedCreators,
    });
  } catch (error) {
    return err({ reason: "Failed to get user by id", cause: error });
  }
};

export const getBooksLikedForUserAdmin = async (
  userId: string,
  limit: number,
): Promise<BookCardResult[]> => {
  const likeRows = await db.query.likes.findMany({
    where: eq(likes.userId, userId),
    columns: { bookId: true },
    orderBy: [desc(likes.createdAt)],
    limit,
  });
  const bookIds = likeRows.map((r) => r.bookId);
  if (bookIds.length === 0) return [];

  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS },
    },
  });
  return orderByIds(bookIds, foundBooks);
};

export const getBooksWishlistedForUserAdmin = async (
  userId: string,
  limit: number,
): Promise<BookCardResult[]> => {
  const wishlistRows = await db.query.wishlists.findMany({
    where: eq(wishlists.userId, userId),
    columns: { bookId: true },
    orderBy: [desc(wishlists.createdAt)],
    limit,
  });
  const bookIds = wishlistRows.map((r) => r.bookId);
  if (bookIds.length === 0) return [];

  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS },
    },
  });

  return orderByIds(bookIds, foundBooks);
};

export const getBooksCollectedForUserAdmin = async (
  userId: string,
  limit: number,
): Promise<BookCardResult[]> => {
  const collectionRows = await db.query.collectionItems.findMany({
    where: eq(collectionItems.userId, userId),
    columns: { bookId: true },
    orderBy: [desc(collectionItems.createdAt)],
    limit,
  });
  const bookIds = collectionRows.map((r) => r.bookId);
  if (bookIds.length === 0) return [];

  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS },
    },
  });

  return orderByIds(bookIds, foundBooks);
};
export const getCreatorsFollowedForUserAdmin = async (
  userId: string,
  limit: number,
): Promise<CreatorCardResult[]> => {
  const followRows = await db.query.follows.findMany({
    where: and(
      eq(follows.followerUserId, userId),
      eq(follows.targetType, "creator"),
    ),
    columns: { targetCreatorId: true },
    orderBy: [desc(follows.createdAt)],
    limit,
  });

  const creatorIds = followRows
    .map((r) => r.targetCreatorId)
    .filter((id): id is string => id !== null);
  if (creatorIds.length === 0) return [];

  const foundCreators = await db.query.creators.findMany({
    columns: CREATOR_CARD_COLUMNS,
    where: inArray(creators.id, creatorIds),
  });

  return orderByIds(creatorIds, foundCreators);
};
