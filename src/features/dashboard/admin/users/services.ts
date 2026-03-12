import { count, desc, eq, ilike } from "drizzle-orm";
import { db } from "../../../../db/client";
import { creatorClaims, creators, follows, users } from "../../../../db/schema";
import { newUserFormAdminSchema } from "./schema";
import z from "zod";
import { getPagination } from "../../../../lib/pagination";

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

export const getCreatorByOwnerUserId = async (userId: string) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.ownerUserId, userId),
      columns: {
        id: true,
        slug: true,
        type: true,
        displayName: true,
      },
    });
    return creator ?? null;
  } catch (error) {
    console.error("Failed to get creator by owner user id", error);
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
  return await db
    .insert(users)
    .values({
      id: authUserId,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mustResetPassword: options?.mustResetPassword ?? false,
    })
    .onConflictDoNothing({ target: users.id });
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
