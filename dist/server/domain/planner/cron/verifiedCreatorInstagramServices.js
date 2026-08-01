import { and, asc, count, eq, gte, isNotNull, isNull, lte } from "drizzle-orm";
import { CREATOR_CARD_COLUMNS } from "../../../constants/queries.js";
import { db } from "../../../db/client.js";
import { books, creators } from "../../../db/schema.js";
import { err, ok } from "../../../lib/result.js";
import { toUtcStartOfDay } from "../../../lib/utils.js";
import { getCreatorSpotlightImageUrls } from "../../../features/app/services.js";
import { getCreatorBookCoverUrls } from "../../../domain/planner/instagramSlides/getCreatorBookCoverUrls.js";
import {
  NEW_CREATOR_CAROUSEL_BOOK_LIMIT,
  prepareNewCreatorFeedImageUrls
} from "../../../domain/planner/instagramSlides/renderSpotlightLeadSlide.js";
import { sendAdminEmail, sendEmail } from "../../../lib/sendEmail.js";
import { buildInstagramCancelUrl } from "../../../lib/adminActionToken.js";
import {
  buildVerifiedCreatorInstagramCreatorEmail,
  buildVerifiedCreatorInstagramPreviewEmail,
  verifiedCreatorInstagramCreatorEmailSubject
} from "../../../features/dashboard/admin/planner/emails.js";
import { uploadImageFromBuffer } from "../../../services/storage.js";
import { bufferCreateScheduledImagePost } from "../../../features/dashboard/admin/planner/social-media/buffer.js";
import {
  buildDefaultCreatorInstagramFirstComment,
  buildNewlyVerifiedCreatorInstagramCaption
} from "../../../features/dashboard/admin/planner/social-media/instagramCaption.js";
import {
  buildVerifiedCreatorInstagramDueAt,
  scheduleInstagramDueAt
} from "../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
const VERIFIED_CREATOR_INSTAGRAM_RUN_WEEKDAYS_UTC = [1, 3];
function isVerifiedCreatorInstagramRunDay(referenceDate = /* @__PURE__ */ new Date()) {
  return VERIFIED_CREATOR_INSTAGRAM_RUN_WEEKDAYS_UTC.includes(
    toUtcStartOfDay(referenceDate).getUTCDay()
  );
}
const VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT = 1;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1e3;
function getVerifiedCreatorInstagramEligibleBefore(now = /* @__PURE__ */ new Date()) {
  return new Date(now.getTime() - TWO_DAYS_MS);
}
const CREATOR_INSTAGRAM_COLUMNS = {
  ...CREATOR_CARD_COLUMNS,
  bio: true,
  tagline: true,
  email: true,
  verifiedAt: true,
  verifiedInstagramQueuedAt: true
};
function hasPublishedBooks(creator) {
  return creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0;
}
async function resolveCreatorImageUrl(creator) {
  if (creator.coverUrl) return creator.coverUrl;
  const [imageError, urls] = await getCreatorSpotlightImageUrls(
    creator.type,
    creator.id,
    1
  );
  if (imageError || urls.length === 0) return null;
  return urls[0] ?? null;
}
async function runVerifiedCreatorInstagramCron(options = {}) {
  const { dryRun = false, force = false, creatorId } = options;
  const now = options.date ?? /* @__PURE__ */ new Date();
  const targetingCreator = Boolean(creatorId);
  if (!dryRun && !force && !targetingCreator && !isVerifiedCreatorInstagramRunDay(now)) {
    return ok({ queued: 0, skipped: 0, failed: 0, items: [] });
  }
  const eligibleBefore = getVerifiedCreatorInstagramEligibleBefore(now);
  try {
    let remainingSlots = VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT;
    if (!targetingCreator) {
      const [{ value: queuedToday }] = await db.select({ value: count() }).from(creators).where(
        and(
          isNotNull(creators.verifiedInstagramQueuedAt),
          gte(creators.verifiedInstagramQueuedAt, toUtcStartOfDay(now))
        )
      );
      remainingSlots = Math.max(
        0,
        VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT - queuedToday
      );
      if (remainingSlots === 0) {
        return ok({ queued: 0, skipped: 0, failed: 0, items: [] });
      }
    }
    const rows = await db.query.creators.findMany({
      where: and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        ...targetingCreator ? [] : [lte(creators.verifiedAt, eligibleBefore)],
        isNull(creators.verifiedInstagramQueuedAt),
        isNull(creators.verifiedInstagramCancelledAt),
        ...creatorId ? [eq(creators.id, creatorId)] : []
      ),
      columns: CREATOR_INSTAGRAM_COLUMNS,
      with: {
        owner: { columns: { email: true } },
        booksAsArtist: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published")
        },
        booksAsPublisher: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published")
        }
      },
      orderBy: [asc(creators.verifiedAt)]
    });
    const items = [];
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
          outcome: { status: "skipped", reason: "no_published_books" }
        });
        continue;
      }
      const imageUrl = await resolveCreatorImageUrl(row);
      if (!imageUrl) {
        skipped += 1;
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "skipped", reason: "no_image" }
        });
        continue;
      }
      const bookCoverUrls = await getCreatorBookCoverUrls(
        row.type,
        row.id,
        NEW_CREATOR_CAROUSEL_BOOK_LIMIT
      );
      const caption = buildNewlyVerifiedCreatorInstagramCaption(row);
      const scheduledAt = buildVerifiedCreatorInstagramDueAt(/* @__PURE__ */ new Date());
      const dueAt = scheduleInstagramDueAt(scheduledAt);
      const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
      const firstComment = useFirstComment ? buildDefaultCreatorInstagramFirstComment(row) : void 0;
      if (dryRun) {
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "dry_run" }
        });
        continue;
      }
      let feedImageUrls;
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
            uploadFolder: `social/new-creator/${row.slug}/feed`
          }
        );
      } catch (cause) {
        failed += 1;
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "failed", reason: "Failed to prepare feed images" }
        });
        continue;
      }
      const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
        text: caption,
        imageUrls: feedImageUrls,
        dueAt,
        firstComment
      });
      if (bufferError) {
        failed += 1;
        await db.update(creators).set({
          verifiedInstagramError: bufferError.reason,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(creators.id, row.id));
        items.push({
          creatorId: row.id,
          slug: row.slug,
          outcome: { status: "failed", reason: bufferError.reason }
        });
        continue;
      }
      await db.update(creators).set({
        verifiedInstagramQueuedAt: /* @__PURE__ */ new Date(),
        verifiedInstagramBufferPostId: bufferData.postId,
        verifiedInstagramPreviewEmailSentAt: /* @__PURE__ */ new Date(),
        verifiedInstagramError: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(creators.id, row.id));
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
              creatorId: row.id
            })
          }
        ]
      });
      const [previewEmailError] = await sendAdminEmail(
        `New creator Instagram preview \u2014 ${row.displayName}`,
        previewHtml
      );
      if (previewEmailError) {
        console.error(
          "verifiedCreatorInstagram preview email",
          row.slug,
          previewEmailError
        );
      }
      const creatorEmail = row.email?.trim() || row.owner?.email?.trim();
      if (creatorEmail) {
        const [creatorEmailError] = await sendEmail(
          creatorEmail,
          verifiedCreatorInstagramCreatorEmailSubject(),
          buildVerifiedCreatorInstagramCreatorEmail({
            displayName: row.displayName,
            scheduledAt,
            imageUrls: feedImageUrls,
            caption
          })
        );
        if (creatorEmailError) {
          console.error(
            "verifiedCreatorInstagram creator email",
            row.slug,
            creatorEmailError
          );
        }
      }
      queued += 1;
      items.push({
        creatorId: row.id,
        slug: row.slug,
        outcome: { status: "queued", postId: bufferData.postId }
      });
    }
    return ok({ queued, skipped, failed, items });
  } catch (cause) {
    console.error("runVerifiedCreatorInstagramCron", cause);
    return err({
      reason: "Failed to queue verified creator Instagram posts",
      cause
    });
  }
}
export {
  VERIFIED_CREATOR_INSTAGRAM_DAILY_LIMIT,
  VERIFIED_CREATOR_INSTAGRAM_RUN_WEEKDAYS_UTC,
  getVerifiedCreatorInstagramEligibleBefore,
  isVerifiedCreatorInstagramRunDay,
  runVerifiedCreatorInstagramCron
};
