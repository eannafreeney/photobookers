import { and, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../../../../db/client.js";
import {
  adminNotifications,
  books,
  collectionItems,
  creatorClaims,
  creators,
  follows,
  likes,
  users,
  wishlists
} from "../../../../db/schema.js";
import { getPagination } from "../../../../lib/pagination.js";
import { supabaseAdmin } from "../../../../lib/supabase.js";
import { sendEmail } from "../../../../lib/sendEmail.js";
import { err, ok } from "../../../../lib/result.js";
import {
  generateLoginInstructionsEmail,
  loginInstructionsEmailSubject
} from "./emails.js";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS
} from "../../../../constants/queries.js";
const orderByIds = (ids, items) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((x) => !!x);
};
const getAllUsersAdmin = async (searchQuery, currentPage = 1, defaultLimit = 30) => {
  try {
    let userIds = [];
    if (searchQuery) {
      const rows = await db.select({ id: users.id }).from(users).where(ilike(users.email, `%${searchQuery}%`));
      userIds = rows.map((r) => r.id);
    }
    const searchCondition = searchQuery && searchQuery.trim() !== "" ? ilike(users.email, `%${searchQuery}%`) : void 0;
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(users).where(searchCondition);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const usersData = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      },
      where: searchCondition,
      limit,
      offset,
      with: {
        creators: {
          columns: { id: true, slug: true, displayName: true, status: true }
        }
      }
    });
    return ok({ users: usersData ?? [], totalPages, page });
  } catch (error) {
    console.error("Failed to get all users", error);
    return err({ reason: "Failed to get all users", cause: error });
  }
};
const getUserById = async (id) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return user ?? null;
  } catch (error) {
    console.error("Failed to get user by id", error);
    return null;
  }
};
const createUserWithAuthId = async (authUserId, formData, options) => {
  try {
    const user = await db.insert(users).values({
      id: authUserId,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mustResetPassword: options?.mustResetPassword ?? false
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        createdAt: sql`COALESCE(${users.createdAt}, now())`
      }
    }).returning();
    return ok(user);
  } catch (error) {
    console.error("Failed to create user with auth id", error);
    return err({ reason: "Failed to create user with auth id", cause: error });
  }
};
const deleteUserByIdAdmin = async (userId) => {
  try {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError && authError.code !== "user_not_found") {
      console.error("Failed to delete auth user", authError);
      return err({
        reason: "Failed to delete Supabase Auth user",
        cause: authError
      });
    }
    const result = await db.transaction(async (tx) => {
      await tx.update(creators).set({ ownerUserId: null }).where(eq(creators.ownerUserId, userId));
      await tx.delete(creatorClaims).where(eq(creatorClaims.userId, userId));
      await tx.delete(follows).where(eq(follows.followerUserId, userId));
      await tx.update(adminNotifications).set({ actorUserId: null }).where(eq(adminNotifications.actorUserId, userId));
      const result2 = await tx.delete(users).where(eq(users.id, userId)).returning();
      return result2;
    });
    return ok(result);
  } catch (error) {
    console.error("Failed to delete user by id", error);
    return err({ reason: "Failed to delete user by id", cause: error });
  }
};
const createAuthUser = async (temporaryPassword, formData) => {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        firstName: formData.firstName,
        lastName: formData.lastName
      }
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
function passwordUpdateRedirectUrl() {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  return `${baseUrl.replace(/\/$/, "")}/auth/update-password`;
}
function buildRecoverySetPasswordLink(redirectTo, properties) {
  const hashedToken = properties?.hashed_token;
  if (hashedToken) {
    const params = new URLSearchParams({
      token_hash: hashedToken,
      type: "recovery"
    });
    return `${redirectTo}?${params.toString()}`;
  }
  return properties?.action_link;
}
const sendUserLoginInstructionsEmail = async (email, options) => {
  try {
    const redirectTo = passwordUpdateRedirectUrl();
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo
      }
    });
    const setPasswordLink = buildRecoverySetPasswordLink(
      redirectTo,
      data?.properties ?? void 0
    );
    if (error || !setPasswordLink) {
      return err({
        reason: "Failed to generate login link",
        cause: error
      });
    }
    const [emailError] = await sendEmail(
      email,
      loginInstructionsEmailSubject(options.purpose),
      generateLoginInstructionsEmail({
        ...options,
        setPasswordLink
      })
    );
    if (emailError)
      return err({
        reason: "Failed to send login instructions email",
        cause: emailError
      });
    return ok(void 0);
  } catch (error) {
    console.error("Failed to send login instructions email", error);
    return err({
      reason: "Failed to send login instructions email",
      cause: error
    });
  }
};
const resetUserPasswordAdmin = async (userId) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true, firstName: true }
    });
    if (!user) return err({ reason: "User not found" });
    const temporaryPassword = crypto.randomUUID();
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: temporaryPassword }
    );
    if (authError) {
      return err({
        reason: "Failed to reset auth password",
        cause: authError
      });
    }
    await db.update(users).set({ mustResetPassword: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
    const emailResult = await sendUserLoginInstructionsEmail(user.email, {
      firstName: user.firstName,
      purpose: "password_reset"
    });
    if (emailResult[0]) return emailResult;
    return ok({ email: user.email });
  } catch (error) {
    console.error("Failed to reset user password", error);
    return err({ reason: "Failed to reset user password", cause: error });
  }
};
const getUserByIdBasic = async (id) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    if (!user) return err({ reason: "User not found" });
    return ok(user);
  } catch (error) {
    console.error("Failed to get user by id", error);
    return err({ reason: "Failed to get user by id", cause: error });
  }
};
const getUserByIdAdmin = async (id, options) => {
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
            coverUrl: true
          },
          with: {
            booksAsArtist: true,
            booksAsPublisher: true
          }
        }
      }
    });
    if (!user) return ok(null);
    if (!withActivity) {
      return ok({
        ...user,
        likedBooks: [],
        wishlistedBooks: [],
        collectedBooks: [],
        followedCreators: []
      });
    }
    const [likedBooks, wishlistedBooks, collectedBooks, followedCreators] = await Promise.all([
      getBooksLikedForUserAdmin(id, activityLimit),
      getBooksWishlistedForUserAdmin(id, activityLimit),
      getBooksCollectedForUserAdmin(id, activityLimit),
      getCreatorsFollowedForUserAdmin(id, activityLimit)
    ]);
    return ok({
      ...user,
      likedBooks,
      wishlistedBooks,
      collectedBooks,
      followedCreators
    });
  } catch (error) {
    return err({ reason: "Failed to get user by id", cause: error });
  }
};
const getBooksLikedForUserAdmin = async (userId, limit) => {
  const likeRows = await db.query.likes.findMany({
    where: eq(likes.userId, userId),
    columns: { bookId: true },
    orderBy: [desc(likes.createdAt)],
    limit
  });
  const bookIds = likeRows.map((r) => r.bookId);
  if (bookIds.length === 0) return [];
  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS }
    }
  });
  return orderByIds(bookIds, foundBooks);
};
const getBooksWishlistedForUserAdmin = async (userId, limit) => {
  const wishlistRows = await db.query.wishlists.findMany({
    where: eq(wishlists.userId, userId),
    columns: { bookId: true },
    orderBy: [desc(wishlists.createdAt)],
    limit
  });
  const bookIds = wishlistRows.map((r) => r.bookId);
  if (bookIds.length === 0) return [];
  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS }
    }
  });
  return orderByIds(bookIds, foundBooks);
};
const getBooksCollectedForUserAdmin = async (userId, limit) => {
  const collectionRows = await db.query.collectionItems.findMany({
    where: eq(collectionItems.userId, userId),
    columns: { bookId: true },
    orderBy: [desc(collectionItems.createdAt)],
    limit
  });
  const bookIds = collectionRows.map((r) => r.bookId);
  if (bookIds.length === 0) return [];
  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: {
      artist: { columns: CREATOR_CARD_COLUMNS },
      publisher: { columns: CREATOR_CARD_COLUMNS }
    }
  });
  return orderByIds(bookIds, foundBooks);
};
const getCreatorsFollowedForUserAdmin = async (userId, limit) => {
  const followRows = await db.query.follows.findMany({
    where: and(
      eq(follows.followerUserId, userId),
      eq(follows.targetType, "creator")
    ),
    columns: { targetCreatorId: true },
    orderBy: [desc(follows.createdAt)],
    limit
  });
  const creatorIds = followRows.map((r) => r.targetCreatorId).filter((id) => id !== null);
  if (creatorIds.length === 0) return [];
  const foundCreators = await db.query.creators.findMany({
    columns: CREATOR_CARD_COLUMNS,
    where: inArray(creators.id, creatorIds)
  });
  return orderByIds(creatorIds, foundCreators);
};
export {
  createAuthUser,
  createUserWithAuthId,
  deleteUserByIdAdmin,
  getAllUsersAdmin,
  getBooksCollectedForUserAdmin,
  getBooksLikedForUserAdmin,
  getBooksWishlistedForUserAdmin,
  getCreatorsFollowedForUserAdmin,
  getUserById,
  getUserByIdAdmin,
  getUserByIdBasic,
  resetUserPasswordAdmin,
  sendUserLoginInstructionsEmail
};
