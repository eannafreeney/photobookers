import { and, asc, eq, gte, isNull, lt } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { bookFairs } from "../../../db/schema.js";
import { err, ok } from "../../../lib/result.js";
import { toUtcStartOfDay } from "../../../lib/utils.js";
import { bufferCreateScheduledImagePost } from "../../../features/dashboard/admin/planner/social-media/buffer.js";
import {
  buildFairInstagramCaption,
  buildFairInstagramFirstComment,
  buildFairPageUrl
} from "../../../features/dashboard/admin/planner/social-media/instagramCaption.js";
import { scheduleInstagramDueAt } from "../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
const FAIR_INSTAGRAM_DAYS_BEFORE = 3;
function getFairInstagramTargetStartDay(from = /* @__PURE__ */ new Date(), daysBefore = FAIR_INSTAGRAM_DAYS_BEFORE) {
  const day = toUtcStartOfDay(from);
  day.setUTCDate(day.getUTCDate() + daysBefore);
  return day;
}
function buildFairInstagramDueAt(from = /* @__PURE__ */ new Date()) {
  const time = process.env.FAIR_INSTAGRAM_POST_TIME ?? "15:00";
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  const hour = match ? Number(match[1]) : 15;
  const minute = match ? Number(match[2]) : 0;
  const day = toUtcStartOfDay(from);
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hour,
      minute
    )
  );
}
async function runFairInstagramCron(options = {}) {
  const { dryRun = false, fairId } = options;
  const now = options.date ?? /* @__PURE__ */ new Date();
  const targetStart = getFairInstagramTargetStartDay(now);
  const targetEnd = new Date(targetStart);
  targetEnd.setUTCDate(targetEnd.getUTCDate() + 1);
  const targetStartDate = targetStart.toISOString().slice(0, 10);
  try {
    const rows = await db.query.bookFairs.findMany({
      where: and(
        eq(bookFairs.status, "published"),
        isNull(bookFairs.instagramQueuedAt),
        ...fairId ? [eq(bookFairs.id, fairId)] : [
          gte(bookFairs.startDate, targetStart),
          lt(bookFairs.startDate, targetEnd)
        ]
      ),
      columns: {
        id: true,
        slug: true,
        name: true,
        description: true,
        city: true,
        country: true,
        coverUrl: true,
        startDate: true,
        endDate: true
      },
      orderBy: [asc(bookFairs.startDate), asc(bookFairs.name)]
    });
    const items = [];
    let queued = 0;
    let skipped = 0;
    let failed = 0;
    for (const fair of rows) {
      if (!fair.coverUrl?.trim()) {
        skipped += 1;
        items.push({
          fairId: fair.id,
          slug: fair.slug,
          outcome: { status: "skipped", reason: "no_cover" }
        });
        continue;
      }
      const caption = buildFairInstagramCaption(fair);
      const scheduledAt = buildFairInstagramDueAt(now);
      const dueAt = scheduleInstagramDueAt(scheduledAt);
      const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
      const firstComment = useFirstComment ? buildFairInstagramFirstComment(fair) : void 0;
      if (dryRun) {
        items.push({
          fairId: fair.id,
          slug: fair.slug,
          outcome: { status: "dry_run" }
        });
        continue;
      }
      const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
        text: caption,
        imageUrls: [fair.coverUrl],
        dueAt,
        firstComment
      });
      if (bufferError) {
        failed += 1;
        await db.update(bookFairs).set({
          instagramError: bufferError.reason,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(bookFairs.id, fair.id));
        items.push({
          fairId: fair.id,
          slug: fair.slug,
          outcome: { status: "failed", reason: bufferError.reason }
        });
        continue;
      }
      await db.update(bookFairs).set({
        instagramQueuedAt: /* @__PURE__ */ new Date(),
        instagramBufferPostId: bufferData.postId,
        instagramError: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(bookFairs.id, fair.id));
      queued += 1;
      items.push({
        fairId: fair.id,
        slug: fair.slug,
        outcome: { status: "queued", postId: bufferData.postId }
      });
      console.log(
        "fairInstagram queued",
        fair.slug,
        buildFairPageUrl(fair.slug),
        dueAt.toISOString()
      );
    }
    return ok({ queued, skipped, failed, targetStartDate, items });
  } catch (cause) {
    console.error("runFairInstagramCron", cause);
    return err({
      reason: "Failed to queue fair Instagram posts",
      cause
    });
  }
}
export {
  FAIR_INSTAGRAM_DAYS_BEFORE,
  buildFairInstagramDueAt,
  getFairInstagramTargetStartDay,
  runFairInstagramCron
};
