import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { follows, users } from "../../db/schema";
import { err, ok } from "../../lib/result";

export type CollectorCard = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  shelfSlug: string | null;
  profileImageUrl: string | null;
};

const PUBLIC_COLLECTOR_COLUMNS = {
  id: true,
  firstName: true,
  lastName: true,
  shelfSlug: true,
  profileImageUrl: true,
} as const;

// Only public collectors (opt-in via shelfPublic + a slug) are ever exposed.
const publicCollectorFilter = and(
  eq(users.shelfPublic, true),
  sql`${users.shelfSlug} IS NOT NULL`,
);

export async function searchCollectors(searchQuery: string, limit = 5) {
  const term = searchQuery.trim();
  if (!term) return ok<CollectorCard[]>([]);
  try {
    const pattern = `%${term}%`;
    const found = await db.query.users.findMany({
      columns: PUBLIC_COLLECTOR_COLUMNS,
      where: and(
        publicCollectorFilter,
        or(
          ilike(users.firstName, pattern),
          ilike(users.lastName, pattern),
          ilike(users.shelfSlug, pattern),
        ),
      ),
      orderBy: [desc(users.createdAt)],
      limit,
    });
    return ok<CollectorCard[]>(found);
  } catch (error) {
    console.error("Failed to search collectors", error);
    return err({ reason: "Failed to search collectors", error });
  }
}

// ponytail: naive limit-based listing, no pagination yet — add offset paging
// when the public collector count grows past a single page.
export async function getPublicCollectors(searchQuery?: string, limit = 48) {
  try {
    const term = searchQuery?.trim();
    const pattern = term ? `%${term}%` : null;
    const found = await db.query.users.findMany({
      columns: PUBLIC_COLLECTOR_COLUMNS,
      where: pattern
        ? and(
            publicCollectorFilter,
            or(
              ilike(users.firstName, pattern),
              ilike(users.lastName, pattern),
              ilike(users.shelfSlug, pattern),
            ),
          )
        : publicCollectorFilter,
      orderBy: [desc(users.createdAt)],
      limit,
    });
    return ok<CollectorCard[]>(found);
  } catch (error) {
    console.error("Failed to get public collectors", error);
    return err({ reason: "Failed to get public collectors", error });
  }
}

export async function getFollowedCollectors(followerUserId: string) {
  try {
    const followRows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "user"),
      ),
      columns: { targetUserId: true },
    });
    const followedUserIds = followRows
      .map((r) => r.targetUserId)
      .filter((id): id is string => id != null);

    if (followedUserIds.length === 0) return ok<CollectorCard[]>([]);

    const found = await db.query.users.findMany({
      columns: PUBLIC_COLLECTOR_COLUMNS,
      where: and(publicCollectorFilter, inArray(users.id, followedUserIds)),
      orderBy: [desc(users.createdAt)],
    });
    return ok<CollectorCard[]>(found);
  } catch (error) {
    console.error("Failed to get followed collectors", error);
    return err({ reason: "Failed to get followed collectors", error });
  }
}
