import { and, asc, count, eq, gte, isNotNull, isNull, lte } from "drizzle-orm";
import { CREATOR_CARD_COLUMNS } from "../../../constants/queries";
import { db } from "../../../db/client";
import { books, creators } from "../../../db/schema";
import { err, ok, type Result } from "../../../lib/result";
import { toUtcStartOfDay } from "../../../lib/utils";
import { getCreatorSpotlightImageUrls } from "../../../features/app/services";
import { getCreatorBookCoverUrls } from "../../../domain/planner/instagramSlides/getCreatorBookCoverUrls";
import {
  NEW_CREATOR_CAROUSEL_BOOK_LIMIT,
  prepareNewCreatorFeedImageUrls,
} from "../../../domain/planner/instagramSlides/renderSpotlightLeadSlide";
import { sendAdminEmail } from "../../../lib/sendEmail";
import { buildInstagramCancelUrl } from "../../../lib/adminActionToken";
import { buildVerifiedCreatorInstagramPreviewEmail } from "../../../features/dashboard/admin/planner/emails";
import { uploadImageFromBuffer } from "../../../services/storage";
import { bufferCreateScheduledImagePost } from "../../../features/dashboard/admin/planner/social-media/buffer";
import {
  buildDefaultCreatorInstagramFirstComment,
  buildNewlyVerifiedCreatorInstagramCaption,
} from "../../../features/dashboard/admin/planner/social-media/instagramCaption";
import {
  buildVerifiedCreatorInstagramDueAt,
  scheduleInstagramDueAt,
} from "../../../features/dashboard/admin/planner/social-media/instagramUtils";

type VerifiedCreatorInstagramError = { reason: string; cause?: unknown };

export type VerifiedCreatorInstagramSkipReason =
  "no_published_books" | "no_image";

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
  force?: boolean;
  creatorId?: string;
  date?: Date;
};

export const VERIFIED_CREATOR_INSTAGRAM_RUN_WEEKDAYS_UTC = [2, 4, 6] as const;

/** Tuesday, Thursday, and Saturday (UTC). */
export function isVerifiedCreatorInstagramRunDay(
  referenceDate: Date = new Date(),
): boolean {
  return (VERIFIED_CREATOR_INSTAGRAM_RUN_WEEKDAYS_UTC as readonly number[]).includes(
    toUtcStartOfDay(referenceDate).getUTCDay(),
  );
}

export type RunVerifiedCreatorInstagramCronResult = Result<
  VerifiedCreatorInstagramRunResult,
  VerifiedCreatorInstagramError
>;

export const VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT = 2;

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function getVerifiedCreatorInstagramEligibleBefore(
  now = new Date(),
): Date {
  return new Date(now.getTime() - TWO_DAYS_MS);
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
  return (
    creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0
  );
}

async function resolveCreatorImageUrl(creator: {
  id: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
}): Promise<string | null> {
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
  const { dryRun = false, force = false, creatorId } = options;
  const now = options.date ?? new Date();
  const targetingCreator = Boolean(creatorId);

  if (
    !dryRun &&
    !force &&
    !targetingCreator &&
    !isVerifiedCreatorInstagramRunDay(now)
  ) {
    return ok({ queued: 0, skipped: 0, failed: 0, items: [] });
  }

  const eligibleBefore = getVerifiedCreatorInstagramEligibleBefore(now);

  try {
    let remainingSlots = VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT;
    if (!targetingCreator) {
      const [{ value: queuedToday }] = await db
        .select({ value: count() })
        .from(creators)
        .where(
          and(
            isNotNull(creators.verifiedInstagramQueuedAt),
            gte(creators.verifiedInstagramQueuedAt, toUtcStartOfDay(now)),
          ),
        );
      remainingSlots = Math.max(
        0,
        VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT - queuedToday,
      );
      if (remainingSlots === 0) {
        return ok({ queued: 0, skipped: 0, failed: 0, items: [] });
      }
    }

    const rows = await db.query.creators.findMany({
      where: and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        ...(targetingCreator ? [] : [lte(creators.verifiedAt, eligibleBefore)]),
        isNull(creators.verifiedInstagramQueuedAt),
        isNull(creators.verifiedInstagramCancelledAt),
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
      if (!targetingCreator && queued >= remainingSlots) break;

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

      const bookCoverUrls = await getCreatorBookCoverUrls(
        row.type,
        row.id,
        NEW_CREATOR_CAROUSEL_BOOK_LIMIT,
      );

      const caption = buildNewlyVerifiedCreatorInstagramCaption(row);
      const scheduledAt = buildVerifiedCreatorInstagramDueAt(new Date());
      const dueAt = scheduleInstagramDueAt(scheduledAt);
      const useFirstComment =
        process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
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

      let feedImageUrls: string[];
      try {
        feedImageUrls = await prepareNewCreatorFeedImageUrls(
          imageUrl,
          bookCoverUrls,
          {
            displayName: row.displayName,
            upload: async (buffer, folder) => {
              const uploaded = await uploadImageFromBuffer(buffer, folder);
              return uploaded.url;
            },
            uploadFolder: `social/new-creator/${row.slug}/feed`,
          },
        );
      } catch (cause) {
        failed += 1;
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "failed", reason: "Failed to prepare feed images" },
        });
        continue;
      }

      const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
        text: caption,
        imageUrls: feedImageUrls,
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
          verifiedInstagramPreviewEmailSentAt: new Date(),
          verifiedInstagramError: null,
          updatedAt: new Date(),
        })
        .where(eq(creators.id, row.id));

      const previewHtml = buildVerifiedCreatorInstagramPreviewEmail({
        displayName: row.displayName,
        posts: [
          {
            title: "New on photobookers",
            imageUrls: feedImageUrls,
            caption,
            scheduledAt,
            cancelUrl: buildInstagramCancelUrl({
              type: "verified-creator",
              creatorId: row.id,
            }),
          },
        ],
      });
      const [previewEmailError] = await sendAdminEmail(
        `New creator Instagram preview — ${row.displayName}`,
        previewHtml,
      );
      if (previewEmailError) {
        console.error(
          "verifiedCreatorInstagram preview email",
          row.slug,
          previewEmailError,
        );
      }

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
    return err({
      reason: "Failed to queue verified creator Instagram posts",
      cause,
    });
  }
}
