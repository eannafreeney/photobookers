import { and, asc, eq, gte, isNotNull, isNull } from "drizzle-orm";
import { CREATOR_CARD_COLUMNS } from "../../../constants/queries";
import { db } from "../../../db/client";
import { books, creators } from "../../../db/schema";
import { err, ok, type Result } from "../../../lib/result";
import { getCreatorSpotlightImageUrls } from "../../../features/app/services";
import { bufferCreateScheduledImagePost } from "../../../features/dashboard/admin/planner/buffer";
import {
  buildDefaultCreatorInstagramFirstComment,
  buildNewlyVerifiedCreatorInstagramCaption,
} from "../../../features/dashboard/admin/planner/instagramCaption";
import {
  buildVerifiedCreatorInstagramDueAt,
  scheduleInstagramDueAt,
} from "../../../features/dashboard/admin/planner/instagramUtils";

type VerifiedCreatorInstagramError = { reason: string; cause?: unknown };

export type VerifiedCreatorInstagramSkipReason = "no_published_books" | "no_image";

export type VerifiedCreatorInstagramItemOutcome =
  | { status: "queued"; postId: string }
  | { status: "skipped"; reason: VerifiedCreatorInstagramSkipReason }
  | { status: "failed"; reason: string }
  | { status: "dry_run" };

export type VerifiedCreatorInstagramRunResult = {
  queued: number;
  skipped: number;
  failed: number;
  items: Array<{
    creatorId: string;
    slug: string;
    outcome: VerifiedCreatorInstagramItemOutcome;
  }>;
};

export type RunVerifiedCreatorInstagramCronOptions = {
  dryRun?: boolean;
  creatorId?: string;
};

export type RunVerifiedCreatorInstagramCronResult = Result<
  VerifiedCreatorInstagramRunResult,
  VerifiedCreatorInstagramError
>;

export function getVerifiedCreatorInstagramCutoff(now = new Date()): Date {
  return new Date(now.getTime() - 24 * 60 * 60 * 1000);
}

const CREATOR_INSTAGRAM_COLUMNS = {
  ...CREATOR_CARD_COLUMNS,
  bio: true,
  tagline: true,
  verifiedAt: true,
  verifiedInstagramQueuedAt: true,
} as const;

function hasPublishedBooks(creator: {
  booksAsArtist: { id: string }[];
  booksAsPublisher: { id: string }[];
}): boolean {
  return creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0;
}

async function resolveCreatorImageUrl(
  creator: {
    id: string;
    type: "artist" | "publisher";
    coverUrl: string | null;
  },
): Promise<string | null> {
  if (creator.coverUrl) return creator.coverUrl;

  const [imageError, urls] = await getCreatorSpotlightImageUrls(
    creator.type,
    creator.id,
    1,
  );
  if (imageError || urls.length === 0) return null;
  return urls[0] ?? null;
}

export async function runVerifiedCreatorInstagramCron(
  options: RunVerifiedCreatorInstagramCronOptions = {},
): Promise<RunVerifiedCreatorInstagramCronResult> {
  const { dryRun = false, creatorId } = options;
  const verifiedCutoff = getVerifiedCreatorInstagramCutoff();

  try {
    const rows = await db.query.creators.findMany({
      where: and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        ...(creatorId ? [] : [gte(creators.verifiedAt, verifiedCutoff)]),
        isNull(creators.verifiedInstagramQueuedAt),
        ...(creatorId ? [eq(creators.id, creatorId)] : []),
      ),
      columns: CREATOR_INSTAGRAM_COLUMNS,
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

    const items: VerifiedCreatorInstagramRunResult["items"] = [];
    let queued = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      if (!hasPublishedBooks(row)) {
        skipped += 1;
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "skipped", reason: "no_published_books" },
        });
        continue;
      }

      const imageUrl = await resolveCreatorImageUrl(row);
      if (!imageUrl) {
        skipped += 1;
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "skipped", reason: "no_image" },
        });
        continue;
      }

      const caption = buildNewlyVerifiedCreatorInstagramCaption(row);
      const dueAt = scheduleInstagramDueAt(
        buildVerifiedCreatorInstagramDueAt(row.verifiedAt!),
      );
      const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
      const firstComment = useFirstComment
        ? buildDefaultCreatorInstagramFirstComment(row)
        : undefined;

      if (dryRun) {
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "dry_run" },
        });
        continue;
      }

      const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
        text: caption,
        imageUrl,
        dueAt,
        firstComment,
      });

      if (bufferError) {
        failed += 1;
        await db
          .update(creators)
          .set({
            verifiedInstagramError: bufferError.reason,
            updatedAt: new Date(),
          })
          .where(eq(creators.id, row.id));
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "failed", reason: bufferError.reason },
        });
        continue;
      }

      await db
        .update(creators)
        .set({
          verifiedInstagramQueuedAt: new Date(),
          verifiedInstagramBufferPostId: bufferData.postId,
          verifiedInstagramError: null,
          updatedAt: new Date(),
        })
        .where(eq(creators.id, row.id));

      queued += 1;
      items.push({
        creatorId: row.id,
        slug: row.slug,
        outcome: { status: "queued", postId: bufferData.postId },
      });
    }

    return ok({ queued, skipped, failed, items });
  } catch (cause) {
    console.error("runVerifiedCreatorInstagramCron", cause);
    return err({ reason: "Failed to queue verified creator Instagram posts", cause });
  }
}
