import { eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { artistOfTheWeek } from "../../../db/schema";
import { sendAdminEmail } from "../../../lib/sendEmail";
import { err, ok, type Result } from "../../../lib/result";
import { toWeekStart, toWeekString } from "../../../lib/utils";
import { buildPlannerWeekContentPreviewEmail } from "../../../features/dashboard/admin/planner/emails";
import { getWeekInstagramForPrepare } from "../../../features/dashboard/admin/planner/instagramServices";
import {
  buildWeekSpotlightContent,
  persistWeekSpotlightContent,
  weekNeedsSpotlightBlurbs,
} from "../../../features/dashboard/admin/planner/spotlightBlurb";
import { getContentPreviewWeekStartForDate } from "../../../features/dashboard/admin/planner/utils";
import { ensureWeekPlannerContent } from "./weekPrepServices";

type ServiceError = { reason: string; cause?: unknown };

export type ContentPreviewSkipReason =
  | "not_reminder_day"
  | "already_sent"
  | "nothing_scheduled";

export type ContentPreviewOutcome =
  | { status: "skipped"; reason: ContentPreviewSkipReason }
  | { status: "sent" }
  | { status: "partial"; warnings: string[] }
  | { status: "failed"; reason: string };

export type ContentPreviewRunResult = {
  previewEmailSent: boolean;
  weekStart: Date | null;
  prepWarnings: string[];
  outcome: ContentPreviewOutcome;
};

export type RunContentPreviewEmailResult = Result<
  ContentPreviewRunResult,
  ServiceError
>;

export type ContentPreviewEmailOptions = {
  dryRun?: boolean;
  force?: boolean;
  weekStart?: Date;
};

export async function runContentPreviewEmail(
  asOf: Date = new Date(),
  options: ContentPreviewEmailOptions = {},
): Promise<RunContentPreviewEmailResult> {
  const weekStart =
    options.weekStart ?? getContentPreviewWeekStartForDate(asOf);

  if (!weekStart) {
    return ok({
      previewEmailSent: false,
      weekStart: null,
      prepWarnings: [],
      outcome: { status: "skipped", reason: "not_reminder_day" },
    });
  }

  const normalizedWeekStart = toWeekStart(weekStart);

  const existingArtist = await db.query.artistOfTheWeek.findFirst({
    where: eq(artistOfTheWeek.weekStart, normalizedWeekStart),
    columns: { contentPreviewEmailSentAt: true },
  });
  const emailAlreadySent = Boolean(existingArtist?.contentPreviewEmailSentAt);

  let prepWarnings: string[] = [];
  if (!options.dryRun) {
    const [prepError, prepResult] =
      await ensureWeekPlannerContent(normalizedWeekStart);
    if (prepError) return err(prepError);
    prepWarnings = prepResult.warnings;
  }

  const [loadError, weekData] =
    await getWeekInstagramForPrepare(normalizedWeekStart);
  if (loadError) return err({ reason: loadError.reason, cause: loadError });

  const hasContent =
    weekData.botdEntries.length > 0 ||
    Boolean(weekData.artistOfTheWeek) ||
    Boolean(weekData.publisherOfTheWeek);

  if (!hasContent) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: { status: "skipped", reason: "nothing_scheduled" },
    });
  }

  if (
    emailAlreadySent &&
    !options.force &&
    !weekNeedsSpotlightBlurbs(weekData)
  ) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings: [],
      outcome: { status: "skipped", reason: "already_sent" },
    });
  }

  const [contentError, items] = await buildWeekSpotlightContent(weekData);
  if (contentError) return err({ reason: contentError.reason });

  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const weekKey = toWeekString(normalizedWeekStart);
  const subject = `Planner week ready — ${weekKey}`;
  const html = buildPlannerWeekContentPreviewEmail({
    weekStart: normalizedWeekStart,
    items,
    prepWarnings,
    plannerUrl: `${siteUrl}/dashboard/admin/planner?year=${normalizedWeekStart.getUTCFullYear()}`,
    featuredHeroUrl: `${siteUrl}/dashboard/admin/planner/featured-hero/${weekKey}/prepare`,
    instagramPrepUrl: `${siteUrl}/dashboard/admin/planner/instagram/${weekKey}/prepare`,
  });

  if (options.dryRun) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: prepWarnings.length
        ? { status: "partial", warnings: prepWarnings }
        : { status: "sent" },
    });
  }

  const [persistError] = await persistWeekSpotlightContent(weekData, items);
  if (persistError) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: { status: "failed", reason: persistError.reason },
    });
  }

  const shouldSendEmail = !emailAlreadySent || Boolean(options.force);
  if (!shouldSendEmail) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: prepWarnings.length
        ? { status: "partial", warnings: prepWarnings }
        : { status: "sent" },
    });
  }

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return ok({
      previewEmailSent: false,
      weekStart: normalizedWeekStart,
      prepWarnings,
      outcome: { status: "failed", reason: emailError.reason },
    });
  }

  const now = new Date();
  await db
    .update(artistOfTheWeek)
    .set({ contentPreviewEmailSentAt: now, updatedAt: now })
    .where(eq(artistOfTheWeek.weekStart, normalizedWeekStart));

  return ok({
    previewEmailSent: true,
    weekStart: normalizedWeekStart,
    prepWarnings,
    outcome: prepWarnings.length
      ? { status: "partial", warnings: prepWarnings }
      : { status: "sent" },
  });
}
