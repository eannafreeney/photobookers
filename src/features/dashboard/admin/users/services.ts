import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../../../db/client";
import {
  adminNotifications,
  books,
  collectionItems,
  creatorClaims,
  creators,
  follows,
  likes,
  users,
  wishlists,
} from "../../../../db/schema";
import { newUserFormAdminSchema, editUserFormAdminSchema } from "./schema";
import z from "zod";
import { getPagination } from "../../../../lib/pagination";
import { supabaseAdmin } from "../../../../lib/supabase";
import { sendEmail } from "../../../../lib/sendEmail";
import { err, ok } from "../../../../lib/result";
import {
  generateLoginInstructionsEmail,
  loginInstructionsEmailSubject,
} from "./emails";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  CreatorCardResult,
} from "../../../../constants/queries";
import { BookCardResult } from "../../../../constants/queries";
import { findUserByEmailAdmin } from "../creators/services";

const orderByIds = <T extends { id: string }>(ids: string[], items: T[]) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((x): x is T => !!x);
};

type NewUserForm = z.infer<typeof newUserFormAdminSchema>;
type EditUserForm = z.infer<typeof editUserFormAdminSchema>;

export const getAllUsersAdmin = async (
  searchQuery?: string,
  currentPage: number = 1,
  defaultLimit = 30,
) => {
  try {
    const normalizedSearch = searchQuery?.trim();
    const searchCondition = normalizedSearch
      ? or(
          ilike(users.email, `%${normalizedSearch}%`),
          ilike(users.firstName, `%${normalizedSearch}%`),
          ilike(users.lastName, `%${normalizedSearch}%`),
        )
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
    return ok({ users: usersData ?? [], totalPages, page });
  } catch (error) {
    console.error("Failed to get all users", error);
    return err({ reason: "Failed to get all users", cause: error });
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

export const updateUserAdmin = async (userId: string, formData: EditUserForm) => {
  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!existing) return err({ reason: "User not found" });

    const normalizedEmail = formData.email.trim().toLowerCase();
    if (normalizedEmail !== existing.email.trim().toLowerCase()) {
      const taken = await findUserByEmailAdmin(normalizedEmail);
      if (taken && taken.id !== userId) {
        return err({ reason: "Email is already in use" });
      }
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: normalizedEmail,
        user_metadata: {
          firstName: formData.firstName ?? null,
          lastName: formData.lastName ?? null,
        },
      },
    );
    if (authError) {
      return err({
        reason: authError.message || "Failed to update auth user",
        cause: authError,
      });
    }

    const [updated] = await db
      .update(users)
      .set({
        email: normalizedEmail,
        firstName: formData.firstName ?? null,
        lastName: formData.lastName ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) return err({ reason: "Failed to update user" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to update user", error);
    return err({ reason: "Failed to update user", cause: error });
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
      .onConflictDoUpdate({
        target: users.id,
        set: {
          createdAt: sql`COALESCE(${users.createdAt}, now())`,
        },
      })
      .returning();
    return ok(user);
  } catch (error) {
    console.error("Failed to create user with auth id", error);
    return err({ reason: "Failed to create user with auth id", cause: error });
  }
};

export const deleteUserByIdAdmin = async (userId: string) => {
  try {
    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError && authError.code !== "user_not_found") {
      console.error("Failed to delete auth user", authError);
      return err({
        reason: "Failed to delete Supabase Auth user",
        cause: authError,
      });
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(creators)
        .set({ ownerUserId: null })
        .where(eq(creators.ownerUserId, userId));
      await tx.delete(creatorClaims).where(eq(creatorClaims.userId, userId));
      await tx.delete(follows).where(eq(follows.followerUserId, userId));
      await tx
        .update(adminNotifications)
        .set({ actorUserId: null })
        .where(eq(adminNotifications.actorUserId, userId));
      const result = await tx
        .delete(users)
        .where(eq(users.id, userId))
        .returning();
      return result;
    });
    return ok(result);
  } catch (error) {
    console.error("Failed to delete user by id", error);
    return err({ reason: "Failed to delete user by id", cause: error });
  }
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

function passwordUpdateRedirectUrl(): string {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  return `${baseUrl.replace(/\/$/, "")}/auth/update-password`;
}

/** SSR-friendly recovery link — action_link redirects via Supabase without token_hash in query. */
function buildRecoverySetPasswordLink(
  redirectTo: string,
  properties: { hashed_token?: string; action_link?: string } | undefined,
): string | undefined {
  const hashedToken = properties?.hashed_token;
  if (hashedToken) {
    const params = new URLSearchParams({
      token_hash: hashedToken,
      type: "recovery",
    });
    return `${redirectTo}?${params.toString()}`;
  }
  return properties?.action_link;
}

export const sendUserLoginInstructionsEmail = async (
  email: string,
  options: {
    firstName?: string | null;
    creatorDisplayName?: string | null;
    purpose: "account_created" | "password_reset";
  },
) => {
  try {
    const redirectTo = passwordUpdateRedirectUrl();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });

    const setPasswordLink = buildRecoverySetPasswordLink(
      redirectTo,
      data?.properties ?? undefined,
    );
    if (error || !setPasswordLink) {
      return err({
        reason: "Failed to generate login link",
        cause: error,
      });
    }

    const [emailError] = await sendEmail(
      email,
      loginInstructionsEmailSubject(options.purpose),
      generateLoginInstructionsEmail({
        ...options,
        setPasswordLink,
      }),
    );

    if (emailError)
      return err({
        reason: "Failed to send login instructions email",
        cause: emailError,
      });

    return ok(undefined);
  } catch (error) {
    console.error("Failed to send login instructions email", error);
    return err({
      reason: "Failed to send login instructions email",
      cause: error,
    });
  }
};

export const resetUserPasswordAdmin = async (userId: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true, firstName: true },
    });
    if (!user) return err({ reason: "User not found" });

    const temporaryPassword = crypto.randomUUID();

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: temporaryPassword },
    );
    if (authError) {
      return err({
        reason: "Failed to reset auth password",
        cause: authError,
      });
    }

    await db
      .update(users)
      .set({ mustResetPassword: true, updatedAt: new Date() })
      .where(eq(users.id, userId));

    const emailResult = await sendUserLoginInstructionsEmail(user.email, {
      firstName: user.firstName,
      purpose: "password_reset",
    });
    if (emailResult[0]) return emailResult;

    return ok({ email: user.email });
  } catch (error) {
    console.error("Failed to reset user password", error);
    return err({ reason: "Failed to reset user password", cause: error });
  }
};

export const getUserByIdBasic = async (id: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!user) return err({ reason: "User not found" });
    return ok(user);
  } catch (error) {
    console.error("Failed to get user by id", error);
    return err({ reason: "Failed to get user by id", cause: error });
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
