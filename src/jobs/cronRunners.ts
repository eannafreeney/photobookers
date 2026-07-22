import { runCeoMetricsEmailCron } from "../domain/ceo-metrics/cron";
import { runDailyProductDigestCron } from "../domain/daily-product-digest/cron";
import { runInterviewReminderCron } from "../domain/interviews/reminderCron";
import {
  runBotdAdvanceNotificationEmails,
  runBotdFeatureDayEmails,
} from "../domain/planner/cron/botdEmailServices";
import { runContentPreviewEmail } from "../domain/planner/cron/contentPreviewEmailServices";
import { runInstagramPrepReminderEmail } from "../domain/planner/cron/instagramReminderEmailServices";
import { runTrendingInstagramCron, formatTrendingInstagramCronSummary } from "../domain/planner/cron/trendingInstagramServices";
import {
  runPrepareNextNewsletterCron,
  runWeeklyNewsletterCron,
  runWeeklyNewsletterTestCron,
} from "../domain/newsletters/cron/newsletterCronServices";
import { runSpotlightCreatorEmails } from "../domain/planner/cron/spotlightEmailServices";
import { runCreatorProfileShareCron } from "../domain/creator-profile-share/cron";
import { runVerifiedCreatorInstagramCron } from "../domain/planner/cron/verifiedCreatorInstagramServices";
import { runVerificationFeedbackCron } from "../domain/verification-feedback/cron";
import {
  runCreatorAnalyticsDigestCron,
  runCreatorMilestoneEmailsCron,
} from "../features/creator-analytics-digest/services";
import {
  queueDuePreparedInstagramPosts,
  queuePreparedBotdInstagramPostsForDate,
} from "../features/dashboard/admin/planner/social-media/instagramServices";
import {
  buildCreatorPostNotificationEmails,
  buildFollowerNotificationEmails,
  markCreatorPostNotificationsSent,
  markFollowerNotificationsSent,
} from "../features/jobs/services";
import { runStubOutreachCron } from "../features/stub-outreach/services";
import { err, ok, type Result } from "../lib/result";
import { supabaseAdmin } from "../lib/supabase";
import {
  parseDateString,
  toDateString,
  toUtcStartOfDay,
  toWeekString,
} from "../lib/utils";

export type CronRunnerOptions = {
  dryRun?: boolean;
  force?: boolean;
  date?: Date;
  weekStart?: Date;
  month?: string;
  to?: string;
  creatorId?: string;
  userId?: string;
  allPrepared?: boolean;
};

export type CronJobName =
  | "daily-botd-instagram"
  | "botd-advance-notification-emails"
  | "botd-feature-day-emails"
  | "ceo-metrics-email"
  | "daily-product-digest"
  | "spotlight-creator-emails"
  | "notify-followers-new-books"
  | "notify-followers-new-posts"
  | "weekly-botd-newsletter"
  | "weekly-botd-newsletter-test"
  | "weekly-botd-newsletter-prepare"
  | "weekly-trending-instagram"
  | "instagram-prep-reminder-email"
  | "planner-content-preview-email"
  | "creator-analytics-digest"
  | "creator-milestone-emails"
  | "stub-outreach-emails"
  | "interview-reminder-emails"
  | "verified-creator-instagram"
  | "verification-feedback-emails"
  | "creator-profile-share-emails";

export const CRON_JOB_NAMES = [
  "daily-botd-instagram",
  "botd-advance-notification-emails",
  "botd-feature-day-emails",
  "ceo-metrics-email",
  "daily-product-digest",
  "spotlight-creator-emails",
  "notify-followers-new-books",
  "notify-followers-new-posts",
  "weekly-botd-newsletter",
  "weekly-botd-newsletter-test",
  "weekly-botd-newsletter-prepare",
  "weekly-trending-instagram",
  "instagram-prep-reminder-email",
  "planner-content-preview-email",
  "creator-analytics-digest",
  "creator-milestone-emails",
  "stub-outreach-emails",
  "interview-reminder-emails",
  "verified-creator-instagram",
  "verification-feedback-emails",
  "creator-profile-share-emails",
] as const satisfies readonly CronJobName[];

export function isCronJobName(value: string): value is CronJobName {
  return (CRON_JOB_NAMES as readonly string[]).includes(value);
}

export async function runDailyBotdInstagramCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  let resultPromise;
  if (options.allPrepared) {
    resultPromise = queueDuePreparedInstagramPosts();
  } else if (options.date) {
    resultPromise = queuePreparedBotdInstagramPostsForDate(options.date);
  } else {
    resultPromise = queuePreparedBotdInstagramPostsForDate(
      toUtcStartOfDay(new Date()),
    );
  }

  const [error, result] = await resultPromise;
  if (error) return err(error);
  return ok({
    queued: result.queued,
    skipped: result.skipped,
  });
}

export async function runBotdAdvanceNotificationEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const asOf = options.date ?? new Date();
  const [error, result] = await runBotdAdvanceNotificationEmails(asOf);
  if (error) return err(error);
  return ok({
    advanceEmailsSent: result.advanceEmailsSent,
    featureDate: result.featureDate ? toDateString(result.featureDate) : null,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date),
    })),
  });
}

export async function runBotdFeatureDayEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const asOf = options.date ?? new Date();
  const [error, result] = await runBotdFeatureDayEmails(asOf);
  if (error) return err(error);
  return ok({
    featureDayEmailsSent: result.featureDayEmailsSent,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date),
    })),
  });
}

export async function runCeoMetricsEmailCronJob(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runCeoMetricsEmailCron({
    dryRun: options.dryRun,
    force: options.force,
    date: options.date,
    to: options.to,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runDailyProductDigestCronJob(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runDailyProductDigestCron({
    dryRun: options.dryRun,
    date: options.date,
    to: options.to,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runSpotlightCreatorEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const date = options.date ?? new Date();
  const [error, result] = await runSpotlightCreatorEmails(date);
  if (error) return err(error);
  return ok({
    interviewRemindersSent: result.interviewRemindersSent,
    featureDayEmailsSent: result.featureDayEmailsSent,
    relatedNotifySent: result.relatedNotifySent,
    items: result.items.map((item) => ({
      ...item,
      weekStart: toWeekString(item.weekStart),
    })),
  });
}

export async function runNotifyFollowersNewBooksCron(): Promise<
  Result<Record<string, unknown>, { reason: string }>
> {
  const { emails, bookIds } = await buildFollowerNotificationEmails();
  if (emails.length === 0) {
    return ok({ sent: 0, books: 0 });
  }

  const { error } = await supabaseAdmin.functions.invoke("send-email-batch", {
    body: { emails },
    headers: { "x-function-secret": process.env.FUNCTION_SECRET ?? "" },
  });
  if (error) {
    console.error(
      "Cron notify-followers-new-books: send-email-batch failed",
      error,
    );
    return err({ reason: "Failed to send emails" });
  }

  await markFollowerNotificationsSent(bookIds);
  return ok({ sent: emails.length, books: bookIds.length });
}

export async function runNotifyFollowersNewPostsCron(): Promise<
  Result<Record<string, unknown>, { reason: string }>
> {
  const { emails, postIds } = await buildCreatorPostNotificationEmails();
  if (postIds.length === 0) {
    return ok({ sent: 0, posts: 0 });
  }

  if (emails.length > 0) {
    const { error } = await supabaseAdmin.functions.invoke("send-email-batch", {
      body: { emails },
      headers: { "x-function-secret": process.env.FUNCTION_SECRET ?? "" },
    });
    if (error) {
      console.error(
        "Cron notify-followers-new-posts: send-email-batch failed",
        error,
      );
      return err({ reason: "Failed to send emails" });
    }
  }

  await markCreatorPostNotificationsSent(postIds);
  return ok({ sent: emails.length, posts: postIds.length });
}

export async function runWeeklyTrendingInstagramCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runTrendingInstagramCron({
    dryRun: options.dryRun,
    force: options.force,
    date: options.date,
  });
  if (error) return err(error);
  return ok(formatTrendingInstagramCronSummary(result));
}

export async function runWeeklyBotdNewsletterCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runWeeklyNewsletterCron({
    dryRun: options.dryRun,
    weekStart: options.weekStart,
    force: options.force,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runWeeklyBotdNewsletterTestCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runWeeklyNewsletterTestCron({
    dryRun: options.dryRun,
    weekStart: options.weekStart,
    force: options.force,
    to: options.to,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runWeeklyBotdNewsletterPrepareCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runPrepareNextNewsletterCron({
    dryRun: options.dryRun,
    force: options.force,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runInstagramPrepReminderEmailCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const asOf = options.date ?? new Date();
  const [error, result] = await runInstagramPrepReminderEmail(asOf);
  if (error) return err(error);
  return ok({
    reminderEmailSent: result.reminderEmailSent,
    weekStart: result.weekStart ? toWeekString(result.weekStart) : null,
    gaps: result.gaps.map((gap) =>
      gap.kind === "botd"
        ? { kind: gap.kind, date: gap.date.toISOString().slice(0, 10) }
        : { kind: gap.kind },
    ),
    outcome: result.outcome,
  });
}

export async function runPlannerContentPreviewEmailCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const asOf = options.date ?? new Date();
  const [error, result] = await runContentPreviewEmail(asOf, {
    dryRun: options.dryRun,
    force: options.force,
    weekStart: options.weekStart,
  });
  if (error) return err(error);
  return ok({
    previewEmailSent: result.previewEmailSent,
    weekStart: result.weekStart ? toWeekString(result.weekStart) : null,
    prepWarnings: result.prepWarnings,
    outcome: result.outcome,
  });
}

export async function runCreatorAnalyticsDigestCronJob(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runCreatorAnalyticsDigestCron({
    dryRun: options.dryRun,
    force: options.force,
    to: options.to,
    creatorId: options.creatorId,
    month: options.month,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runCreatorMilestoneEmailsCronJob(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runCreatorMilestoneEmailsCron({
    dryRun: options.dryRun,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runStubOutreachEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runStubOutreachCron({
    dryRun: options.dryRun,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runInterviewReminderEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runInterviewReminderCron({
    dryRun: options.dryRun,
    force: options.force,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runVerifiedCreatorInstagramCronJob(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runVerifiedCreatorInstagramCron({
    dryRun: options.dryRun,
    force: options.force,
    creatorId: options.creatorId,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runVerificationFeedbackEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runVerificationFeedbackCron({
    dryRun: options.dryRun,
    force: options.force,
    to: options.to,
    userId: options.userId,
    creatorId: options.creatorId,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

export async function runCreatorProfileShareEmailsCron(
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  const [error, result] = await runCreatorProfileShareCron({
    dryRun: options.dryRun,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date,
  });
  if (error) return err(error);
  return ok({ ...result });
}

const RUNNERS: Record<
  CronJobName,
  (
    options: CronRunnerOptions,
  ) => Promise<Result<Record<string, unknown>, { reason: string }>>
> = {
  "daily-botd-instagram": runDailyBotdInstagramCron,
  "botd-advance-notification-emails": runBotdAdvanceNotificationEmailsCron,
  "botd-feature-day-emails": runBotdFeatureDayEmailsCron,
  "ceo-metrics-email": runCeoMetricsEmailCronJob,
  "daily-product-digest": runDailyProductDigestCronJob,
  "spotlight-creator-emails": runSpotlightCreatorEmailsCron,
  "notify-followers-new-books": () => runNotifyFollowersNewBooksCron(),
  "notify-followers-new-posts": () => runNotifyFollowersNewPostsCron(),
  "weekly-botd-newsletter": runWeeklyBotdNewsletterCron,
  "weekly-botd-newsletter-test": runWeeklyBotdNewsletterTestCron,
  "weekly-botd-newsletter-prepare": runWeeklyBotdNewsletterPrepareCron,
  "weekly-trending-instagram": runWeeklyTrendingInstagramCron,
  "instagram-prep-reminder-email": runInstagramPrepReminderEmailCron,
  "planner-content-preview-email": runPlannerContentPreviewEmailCron,
  "creator-analytics-digest": runCreatorAnalyticsDigestCronJob,
  "creator-milestone-emails": runCreatorMilestoneEmailsCronJob,
  "stub-outreach-emails": runStubOutreachEmailsCron,
  "interview-reminder-emails": runInterviewReminderEmailsCron,
  "verified-creator-instagram": runVerifiedCreatorInstagramCronJob,
  "verification-feedback-emails": runVerificationFeedbackEmailsCron,
  "creator-profile-share-emails": runCreatorProfileShareEmailsCron,
};

export async function runCronJob(
  name: CronJobName,
  options: CronRunnerOptions = {},
): Promise<Result<Record<string, unknown>, { reason: string }>> {
  return RUNNERS[name](options);
}

export function parseCronRunnerOptionsFromEnv(): CronRunnerOptions {
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const force = process.env.FORCE === "1" || process.env.FORCE === "true";
  const allPrepared =
    process.env.ALL_PREPARED === "1" || process.env.ALL_PREPARED === "true";

  const date = parseOptionalEnvDate("DATE");
  const weekStart = parseOptionalEnvDate("WEEK_START");

  const month = process.env.MONTH?.trim() || undefined;
  const to = process.env.TO?.trim() || undefined;
  const creatorId = process.env.CREATOR_ID?.trim() || undefined;
  const userId = process.env.USER_ID?.trim() || undefined;

  return {
    dryRun,
    force,
    date,
    weekStart,
    month,
    to,
    creatorId,
    userId,
    allPrepared,
  };
}

function parseOptionalEnvDate(name: string): Date | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  const date = parseDateString(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${name} (use YYYY-MM-DD)`);
  }
  return date;
}
