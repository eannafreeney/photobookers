import { eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { artistOfTheWeek } from "../../../db/schema.js";
import { sendAdminEmail } from "../../../lib/sendEmail.js";
import { err, ok } from "../../../lib/result.js";
import { toWeekStart, toWeekString } from "../../../lib/utils.js";
import { buildPlannerWeekFeedPreviewUrls } from "../instagramSlides/buildPlannerWeekFeedPreview.js";
import { buildPlannerWeekContentPreviewEmail } from "../../../features/dashboard/admin/planner/emails.js";
import { getWeekInstagramForPrepare } from "../../../features/dashboard/admin/planner/social-media/instagramServices.js";
import {
  buildWeekSpotlightContent,
  persistWeekSpotlightContent,
  weekNeedsSpotlightBlurbs
} from "../../../features/dashboard/admin/planner/spotlightBlurb.js";
import { getContentPreviewWeekStartForDate } from "../../../features/dashboard/admin/planner/utils.js";
import { ensureWeekPlannerContent } from "./weekPrepServices.js";
async function runContentPreviewEmail(asOf = /* @__PURE__ */ new Date(), options = {}) {
  const weekStart = options.weekStart ?? getContentPreviewWeekStartForDate(asOf);
  if (!weekStart) {
    return ok({
      previewEmailSent: false,
      weekStart: null,
      prepWarnings: [],
      outcome: { status: "skipped", reason: "not_reminder_day" }
    });
  }
  const normalizedWeekStart = toWeekStart(weekStart);
  const existingArtist = await db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, normalizedWeekStart),
    columns: { contentPreviewEmailSentAt: true }
  });
  const emailAlreadySent = Boolean(existingArtist?.contentPreviewEmailSentAt);
  let prepWarnings = [];
  if (!options.dryRun) {
    const [prepError, prepResult] = await ensureWeekPlannerContent(normalizedWeekStart);
    if (prepError) return err(prepError);
    prepWarnings = prepResult.warnings;
  }
  const [loadError, weekData] = await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason, cause: loadError });
  const hasContent = weekData.botdEntries.length > 0 || Boolean(weekData.artistOfTheWeek) || Boolean(weekData.publisherOfTheWeek);
  if (!hasContent) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: { status: "skipped", reason: "nothing_scheduled" }
    });
  }
  if (emailAlreadySent && !options.force && !weekNeedsSpotlightBlurbs(weekData)) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings: [],
      outcome: { status: "skipped", reason: "already_sent" }
    });
  }
  const [contentError, items] = await buildWeekSpotlightContent(weekData);
  if (contentError) return err({ reason: contentError.reason });
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const weekKey = toWeekString(normalizedWeekStart);
  let feedPreviewUrls;
  if (!options.dryRun) {
    feedPreviewUrls = await buildPlannerWeekFeedPreviewUrls(items, weekKey);
  }
  const subject = `Planner week ready \u2014 ${weekKey}`;
  const html = buildPlannerWeekContentPreviewEmail({
    weekStart: normalizedWeekStart,
    items,
    feedPreviewUrls,
    prepWarnings,
    plannerUrl: `${siteUrl}/dashboard/admin/planner?year=${normalizedWeekStart.getUTCFullYear()}`,
    featuredHeroUrl: `${siteUrl}/dashboard/admin/planner/featured-hero/${weekKey}/prepare`,
    instagramPrepUrl: `${siteUrl}/dashboard/admin/planner/instagram/${weekKey}/prepare`
  });
  if (options.dryRun) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: prepWarnings.length ? { status: "partial", warnings: prepWarnings } : { status: "sent" }
    });
  }
  const [persistError] = await persistWeekSpotlightContent(weekData, items);
  if (persistError) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: { status: "failed", reason: persistError.reason }
    });
  }
  const shouldSendEmail = !emailAlreadySent || Boolean(options.force);
  if (!shouldSendEmail) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: prepWarnings.length ? { status: "partial", warnings: prepWarnings } : { status: "sent" }
    });
  }
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: { status: "failed", reason: emailError.reason }
    });
  }
  const now = /* @__PURE__ */ new Date();
  await db.update(artistOfTheWeek).set({ contentPreviewEmailSentAt: now, updatedAt: now }).where(eq(artistOfTheWeek.weekStart, normalizedWeekStart));
  return ok({
    previewEmailSent: true,
    weekStart: normalizedWeekStart,
    prepWarnings,
    outcome: prepWarnings.length ? { status: "partial", warnings: prepWarnings } : { status: "sent" }
  });
}
export {
  runContentPreviewEmail
};
