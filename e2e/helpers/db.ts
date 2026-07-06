import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, inArray, or } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../../src/db/schema";

const { creatorClaims, creators, users } = schema;

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getE2eDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for e2e tests");

  if (!db) {
    const client = postgres(url, { max: 1 });
    db = drizzle(client, { schema });
  }

  return db;
}

export async function getCreatorById(creatorId: string) {
  return getE2eDb().query.creators.findFirst({
    where: eq(creators.id, creatorId),
  });
}

export async function getClaimForUserAndCreator(
  userId: string,
  creatorId: string,
) {
  return getE2eDb().query.creatorClaims.findFirst({
    where: and(
      eq(creatorClaims.userId, userId),
      eq(creatorClaims.creatorId, creatorId),
    ),
  });
}

export async function deleteTestData(opts: {
  userIds?: string[];
  creatorIds?: string[];
}) {
  const dbConn = getE2eDb();
  const userIds = opts.userIds ?? [];
  const creatorIds = opts.creatorIds ?? [];

  if (userIds.length > 0 && creatorIds.length > 0) {
    await dbConn
      .delete(creatorClaims)
      .where(
        or(
          inArray(creatorClaims.userId, userIds),
          inArray(creatorClaims.creatorId, creatorIds),
        ),
      );
  } else if (userIds.length > 0) {
    await dbConn
      .delete(creatorClaims)
      .where(inArray(creatorClaims.userId, userIds));
  } else if (creatorIds.length > 0) {
    await dbConn
      .delete(creatorClaims)
      .where(inArray(creatorClaims.creatorId, creatorIds));
  }

  if (creatorIds.length > 0) {
    await dbConn.delete(creators).where(inArray(creators.id, creatorIds));
  }

  if (userIds.length > 0) {
    await dbConn.delete(users).where(inArray(users.id, userIds));
  }
}
