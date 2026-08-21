import { and, desc, eq, ilike, inArray, notExists, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creators, follows, users } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
function collectorDisplayName(c) {
  return [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || "Collector";
}
const PUBLIC_COLLECTOR_COLUMNS = {
  id: true,
  firstName: true,
  lastName: true,
  shelfSlug: true,
  profileImageUrl: true
};
const publicCollectorFilter = and(
  eq(users.shelfPublic, true),
  sql`${users.shelfSlug} IS NOT NULL`,
  notExists(
    db.select({ id: creators.id }).from(creators).where(eq(creators.ownerUserId, users.id))
  )
);
async function searchCollectors(searchQuery, limit = 5) {
  const term = searchQuery.trim();
  if (!term) return ok([]);
  try {
    const pattern = `%${term}%`;
    const found = await db.query.users.findMany({
      columns: PUBLIC_COLLECTOR_COLUMNS,
      where: and(
        publicCollectorFilter,
        or(
          ilike(users.firstName, pattern),
          ilike(users.lastName, pattern),
          ilike(users.shelfSlug, pattern)
        )
      ),
      orderBy: [desc(users.createdAt)],
      limit
    });
    return ok(found);
  } catch (error) {
    console.error("Failed to search collectors", error);
    return err({ reason: "Failed to search collectors", error });
  }
}
async function getPublicCollectors(searchQuery, limit = 48) {
  try {
    const term = searchQuery?.trim();
    const pattern = term ? `%${term}%` : null;
    const found = await db.query.users.findMany({
      columns: PUBLIC_COLLECTOR_COLUMNS,
      where: pattern ? and(
        publicCollectorFilter,
        or(
          ilike(users.firstName, pattern),
          ilike(users.lastName, pattern),
          ilike(users.shelfSlug, pattern)
        )
      ) : publicCollectorFilter,
      orderBy: [desc(users.createdAt)],
      limit
    });
    return ok(found);
  } catch (error) {
    console.error("Failed to get public collectors", error);
    return err({ reason: "Failed to get public collectors", error });
  }
}
async function getFollowedCollectors(followerUserId) {
  try {
    const followRows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "user")
      ),
      columns: { targetUserId: true }
    });
    const followedUserIds = followRows.map((r) => r.targetUserId).filter((id) => id != null);
    if (followedUserIds.length === 0) return ok([]);
    const found = await db.query.users.findMany({
      columns: PUBLIC_COLLECTOR_COLUMNS,
      where: and(publicCollectorFilter, inArray(users.id, followedUserIds)),
      orderBy: [desc(users.createdAt)]
    });
    return ok(found);
  } catch (error) {
    console.error("Failed to get followed collectors", error);
    return err({ reason: "Failed to get followed collectors", error });
  }
}
export {
  collectorDisplayName,
  getFollowedCollectors,
  getPublicCollectors,
  searchCollectors
};
