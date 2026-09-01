import { and, asc, eq, gte, isNotNull, lt } from "drizzle-orm";
import { db } from "../../db/client";
import { books, creators } from "../../db/schema";
import { formatCreatorLocation } from "../../lib/utils";

export const NEW_MEMBERS_LIMIT = 6;

export type NewlyVerifiedCreator = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
  tagline: string | null;
  location: string | null;
};

/** Verified creators whose `verifiedAt` falls in [rangeStart, rangeEnd] (inclusive days). */
export async function getNewlyVerifiedCreatorsInRange(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<NewlyVerifiedCreator[]> {
  const rangeEndExclusive = new Date(rangeEnd);
  rangeEndExclusive.setUTCDate(rangeEndExclusive.getUTCDate() + 1);

  const rows = await db.query.creators.findMany({
    where: and(
      eq(creators.status, "verified"),
      isNotNull(creators.verifiedAt),
      gte(creators.verifiedAt, rangeStart),
      lt(creators.verifiedAt, rangeEndExclusive),
    ),
    columns: {
      displayName: true,
      slug: true,
      type: true,
      coverUrl: true,
      tagline: true,
      city: true,
      country: true,
    },
    with: {
      booksAsArtist: {
        columns: { id: true },
        where: eq(books.publicationStatus, "published"),
      },
      booksAsPublisher: {
        columns: { id: true },
        where: eq(books.publicationStatus, "published"),
      },
    },
    orderBy: [asc(creators.verifiedAt)],
  });

  return rows
    .filter(
      (creator) =>
        creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0,
    )
    .slice(0, NEW_MEMBERS_LIMIT)
    .map(({ booksAsArtist, booksAsPublisher, ...creator }) => ({
      displayName: creator.displayName,
      slug: creator.slug,
      type: creator.type,
      coverUrl: creator.coverUrl ?? null,
      tagline: creator.tagline?.trim() || null,
      location: formatCreatorLocation(creator.city, creator.country),
    }));
}
