import { and, count, desc, eq, isNotNull, notExists } from "drizzle-orm";
import { db } from "../../db/client";
import { creators, users } from "../../db/schema";
import { getPagination } from "../../lib/pagination";
import { err, ok } from "../../lib/result";

export type FanListItem = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
};

export type VerifiedCreatorListItem = {
  id: string;
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
  verifiedAt: Date | null;
};

function fanUserFilter() {
  return and(
    eq(users.isAdmin, false),
    eq(users.mustResetPassword, false),
    isNotNull(users.acceptsTerms),
    notExists(
      db
        .select({ id: creators.id })
        .from(creators)
        .where(
          and(
            eq(creators.ownerUserId, users.id),
            eq(creators.status, "verified"),
          ),
        ),
    ),
  );
}

export async function getCurrentFanCount(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(users)
    .where(fanUserFilter());
  return row?.value ?? 0;
}

export async function getCurrentVerifiedCreatorCount(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(creators)
    .where(eq(creators.status, "verified"));
  return row?.value ?? 0;
}

export async function getAllFans(currentPage: number = 1, defaultLimit = 100) {
  try {
    const filter = fanUserFilter();
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(users)
      .where(filter);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    if (totalCount === 0) {
      return ok({ fans: [], totalPages: 1, page: 1 });
    }

    const fans = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(filter)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return ok({ fans, totalPages, page });
  } catch (error) {
    console.error("Failed to get fans", error);
    return err({ reason: "Failed to get fans", cause: error });
  }
}

export async function getAllVerifiedCreators(
  currentPage: number = 1,
  defaultLimit = 100,
) {
  try {
    const filter = eq(creators.status, "verified");
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creators)
      .where(filter);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    if (totalCount === 0) {
      return ok({ creators: [], totalPages: 1, page: 1 });
    }

    const creatorRows = await db
      .select({
        id: creators.id,
        displayName: creators.displayName,
        slug: creators.slug,
        type: creators.type,
        verifiedAt: creators.verifiedAt,
      })
      .from(creators)
      .where(filter)
      .orderBy(desc(creators.verifiedAt))
      .limit(limit)
      .offset(offset);

    return ok({ creators: creatorRows, totalPages, page });
  } catch (error) {
    console.error("Failed to get verified creators", error);
    return err({ reason: "Failed to get verified creators", cause: error });
  }
}
