import { runCeoMetricsEmailCron } from "../domain/ceo-metrics/cron.js";
import { runDailyProductDigestCron } from "../domain/daily-product-digest/cron.js";
import { runInstagramWeeklyDigestCron } from "../domain/instagram-analytics/cron.js";
import { runPublisherReleaseWatchCron } from "../domain/publisher-release-watch/cron.js";
import { runInterviewReminderCron } from "../domain/interviews/reminderCron.js";
import {
  runBotdAdvanceNotificationEmails,
  runBotdFeatureDayEmails,
  runBotdStoryImageEmails
} from "../domain/planner/cron/botdEmailServices.js";
import { runSpotlightStoryImageEmails } from "../domain/planner/cron/spotlightStoryImageServices.js";
import { runStoryUploadCleanup } from "../domain/planner/cron/storyUploadCleanupServices.js";
import { runContentPreviewEmail } from "../domain/planner/cron/contentPreviewEmailServices.js";
import { runInstagramPrepReminderEmail } from "../domain/planner/cron/instagramReminderEmailServices.js";
import { runTrendingInstagramCron, formatTrendingInstagramCronSummary } from "../domain/planner/cron/trendingInstagramServices.js";
import {
  runPrepareNextNewsletterCron,
  runWeeklyNewsletterCron,
  runWeeklyNewsletterTestCron
} from "../domain/newsletters/cron/newsletterCronServices.js";
import { runSpotlightCreatorEmails } from "../domain/planner/cron/spotlightEmailServices.js";
import { runCreatorProfileShareCron } from "../domain/creator-profile-share/cron.js";
import { runVerifiedCreatorInstagramCron } from "../domain/planner/cron/verifiedCreatorInstagramServices.js";
import { runFairInstagramCron } from "../domain/planner/cron/fairInstagramServices.js";
import { runRandomizeNextWeekBotdCron } from "../domain/planner/cron/randomizeNextWeekBotdServices.js";
import { runVerificationFeedbackCron } from "../domain/verification-feedback/cron.js";
import {
  runCreatorAnalyticsDigestCron,
  runCreatorMilestoneEmailsCron
} from "../features/creator-analytics-digest/services.js";
import {
  queueDuePreparedInstagramPosts,
  queuePreparedBotdInstagramPostsForDate
} from "../features/dashboard/admin/planner/social-media/instagramServices.js";
import {
  buildCreatorPostNotificationEmails,
  buildFollowerNotificationEmails,
  markCreatorPostNotificationsSent,
  markFollowerNotificationsSent
} from "../features/jobs/services.js";
import { runStubOutreachCron } from "../features/stub-outreach/services.js";
import { err, ok } from "../lib/result.js";
import { supabaseAdmin } from "../lib/supabase.js";
import {
  parseDateString,
  toDateString,
  toUtcStartOfDay,
  toWeekString
} from "../lib/utils.js";
const CRON_JOB_NAMES = [
  "daily-botd-instagram",
  "botd-advance-notification-emails",
  "botd-feature-day-emails",
  "botd-story-image-emails",
  "spotlight-story-image-emails",
  "story-upload-cleanup",
  "ceo-metrics-email",
  "daily-product-digest",
  "publisher-release-watch",
  "spotlight-creator-emails",
  "notify-followers-new-books",
  "notify-followers-new-posts",
  "weekly-botd-newsletter",
  "weekly-botd-newsletter-test",
  "weekly-botd-newsletter-prepare",
  "weekly-trending-instagram",
  "instagram-prep-reminder-email",
  "instagram-weekly-digest",
  "planner-content-preview-email",
  "creator-analytics-digest",
  "creator-milestone-emails",
  "stub-outreach-emails",
  "interview-reminder-emails",
  "verified-creator-instagram",
  "fair-instagram",
  "randomize-next-week-botd",
  "verification-feedback-emails",
  "creator-profile-share-emails"
];
function isCronJobName(value) {
  return CRON_JOB_NAMES.includes(value);
}
async function runDailyBotdInstagramCron(options = {}) {
  let resultPromise;
  if (options.allPrepared) {
    resultPromise = queueDuePreparedInstagramPosts();
  } else if (options.date) {
    resultPromise = queuePreparedBotdInstagramPostsForDate(options.date);
  } else {
    resultPromise = queuePreparedBotdInstagramPostsForDate(
      toUtcStartOfDay(/* @__PURE__ */ new Date())
    );
  }
  const [error, result] = await resultPromise;
  if (error) return err(error);
  return ok({
    queued: result.queued,
    skipped: result.skipped
  });
}
async function runBotdAdvanceNotificationEmailsCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runBotdAdvanceNotificationEmails(asOf);
  if (error) return err(error);
  return ok({
    advanceEmailsSent: result.advanceEmailsSent,
    featureDate: result.featureDate ? toDateString(result.featureDate) : null,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date)
    }))
  });
}
async function runBotdFeatureDayEmailsCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runBotdFeatureDayEmails(asOf);
  if (error) return err(error);
  return ok({
    featureDayEmailsSent: result.featureDayEmailsSent,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date)
    }))
  });
}
async function runBotdStoryImageEmailsCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runBotdStoryImageEmails(asOf);
  if (error) return err(error);
  return ok({
    storyImageEmailsSent: result.storyImageEmailsSent,
    featureDate: result.featureDate ? toDateString(result.featureDate) : null,
    items: result.items.map((item) => ({
      ...item,
      date: toDateString(item.date)
    }))
  });
}
async function runSpotlightStoryImageEmailsCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runSpotlightStoryImageEmails(asOf);
  if (error) return err(error);
  return ok({
    storyImageEmailsSent: result.storyImageEmailsSent,
    weekStart: result.weekStart ? toWeekString(result.weekStart) : null,
    items: result.items
  });
}
async function runStoryUploadCleanupCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runStoryUploadCleanup(asOf);
  if (error) return err(error);
  return ok({
    deleted: result.deleted,
    errors: result.errors
  });
}
async function runCeoMetricsEmailCronJob(options = {}) {
  const [error, result] = await runCeoMetricsEmailCron({
    dryRun: options.dryRun,
    force: options.force,
    date: options.date,
    to: options.to
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runInstagramWeeklyDigestCronJob(options = {}) {
  const [error, result] = await runInstagramWeeklyDigestCron({
    dryRun: options.dryRun,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runDailyProductDigestCronJob(options = {}) {
  const [error, result] = await runDailyProductDigestCron({
    dryRun: options.dryRun,
    date: options.date,
    to: options.to
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runPublisherReleaseWatchCronJob(options = {}) {
  const [error, result] = await runPublisherReleaseWatchCron({
    dryRun: options.dryRun
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runSpotlightCreatorEmailsCron(options = {}) {
  const date = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runSpotlightCreatorEmails(date);
  if (error) return err(error);
  return ok({
    interviewRemindersSent: result.interviewRemindersSent,
    featureDayEmailsSent: result.featureDayEmailsSent,
    relatedNotifySent: result.relatedNotifySent,
    items: result.items.map((item) => ({
      ...item,
      weekStart: toWeekString(item.weekStart)
    }))
  });
}
async function runNotifyFollowersNewBooksCron() {
  const { emails, bookIds } = await buildFollowerNotificationEmails();
  if (emails.length === 0) {
    return ok({ sent: 0, books: 0 });
  }
  const { error } = await supabaseAdmin.functions.invoke("send-email-batch", {
    body: { emails },
    headers: { "x-function-secret": process.env.FUNCTION_SECRET ?? "" }
  });
  if (error) {
    console.error(
      "Cron notify-followers-new-books: send-email-batch failed",
      error
    );
    return err({ reason: "Failed to send emails" });
  }
  await markFollowerNotificationsSent(bookIds);
  return ok({ sent: emails.length, books: bookIds.length });
}
async function runNotifyFollowersNewPostsCron() {
  const { emails, postIds } = await buildCreatorPostNotificationEmails();
  if (postIds.length === 0) {
    return ok({ sent: 0, posts: 0 });
  }
  if (emails.length > 0) {
    const { error } = await supabaseAdmin.functions.invoke("send-email-batch", {
      body: { emails },
      headers: { "x-function-secret": process.env.FUNCTION_SECRET ?? "" }
    });
    if (error) {
      console.error(
        "Cron notify-followers-new-posts: send-email-batch failed",
        error
      );
      return err({ reason: "Failed to send emails" });
    }
  }
  await markCreatorPostNotificationsSent(postIds);
  return ok({ sent: emails.length, posts: postIds.length });
}
async function runWeeklyTrendingInstagramCron(options = {}) {
  const [error, result] = await runTrendingInstagramCron({
    dryRun: options.dryRun,
    force: options.force,
    date: options.date
  });
  if (error) return err(error);
  return ok(formatTrendingInstagramCronSummary(result));
}
async function runWeeklyBotdNewsletterCron(options = {}) {
  const [error, result] = await runWeeklyNewsletterCron({
    dryRun: options.dryRun,
    weekStart: options.weekStart,
    force: options.force
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runWeeklyBotdNewsletterTestCron(options = {}) {
  const [error, result] = await runWeeklyNewsletterTestCron({
    dryRun: options.dryRun,
    weekStart: options.weekStart,
    force: options.force,
    to: options.to
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runWeeklyBotdNewsletterPrepareCron(options = {}) {
  const [error, result] = await runPrepareNextNewsletterCron({
    dryRun: options.dryRun,
    force: options.force
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runInstagramPrepReminderEmailCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runInstagramPrepReminderEmail(asOf);
  if (error) return err(error);
  return ok({
    reminderEmailSent: result.reminderEmailSent,
    weekStart: result.weekStart ? toWeekString(result.weekStart) : null,
    gaps: result.gaps.map(
      (gap) => gap.kind === "botd" ? { kind: gap.kind, date: gap.date.toISOString().slice(0, 10) } : { kind: gap.kind }
    ),
    outcome: result.outcome
  });
}
async function runPlannerContentPreviewEmailCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const [error, result] = await runContentPreviewEmail(asOf, {
    dryRun: options.dryRun,
    force: options.force,
    weekStart: options.weekStart
  });
  if (error) return err(error);
  return ok({
    previewEmailSent: result.previewEmailSent,
    weekStart: result.weekStart ? toWeekString(result.weekStart) : null,
    prepWarnings: result.prepWarnings,
    outcome: result.outcome
  });
}
async function runCreatorAnalyticsDigestCronJob(options = {}) {
  const [error, result] = await runCreatorAnalyticsDigestCron({
    dryRun: options.dryRun,
    force: options.force,
    to: options.to,
    creatorId: options.creatorId,
    month: options.month,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runCreatorMilestoneEmailsCronJob(options = {}) {
  const [error, result] = await runCreatorMilestoneEmailsCron({
    dryRun: options.dryRun,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runStubOutreachEmailsCron(options = {}) {
  const [error, result] = await runStubOutreachCron({
    dryRun: options.dryRun,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runInterviewReminderEmailsCron(options = {}) {
  const [error, result] = await runInterviewReminderCron({
    dryRun: options.dryRun,
    force: options.force,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runVerifiedCreatorInstagramCronJob(options = {}) {
  const [error, result] = await runVerifiedCreatorInstagramCron({
    dryRun: options.dryRun,
    force: options.force,
    creatorId: options.creatorId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runFairInstagramCronJob(options = {}) {
  const [error, result] = await runFairInstagramCron({
    dryRun: options.dryRun,
    fairId: options.fairId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runRandomizeNextWeekBotdCronJob(options = {}) {
  const [error, result] = await runRandomizeNextWeekBotdCron({
    dryRun: options.dryRun,
    force: options.force,
    date: options.date
  });
  if (error) return err(error);
  if (result.outcome.status === "failed") {
    return err({ reason: result.outcome.reason });
  }
  return ok({
    weekKey: result.weekKey,
    weekStart: toDateString(result.weekStart),
    existingCount: result.existingCount,
    action: result.outcome.status,
    ...result.outcome
  });
}
async function runVerificationFeedbackEmailsCron(options = {}) {
  const [error, result] = await runVerificationFeedbackCron({
    dryRun: options.dryRun,
    force: options.force,
    to: options.to,
    userId: options.userId,
    creatorId: options.creatorId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
async function runCreatorProfileShareEmailsCron(options = {}) {
  const [error, result] = await runCreatorProfileShareCron({
    dryRun: options.dryRun,
    to: options.to,
    creatorId: options.creatorId,
    date: options.date
  });
  if (error) return err(error);
  return ok({ ...result });
}
const RUNNERS = {
  "daily-botd-instagram": runDailyBotdInstagramCron,
  "botd-advance-notification-emails": runBotdAdvanceNotificationEmailsCron,
  "botd-feature-day-emails": runBotdFeatureDayEmailsCron,
  "botd-story-image-emails": runBotdStoryImageEmailsCron,
  "spotlight-story-image-emails": runSpotlightStoryImageEmailsCron,
  "story-upload-cleanup": runStoryUploadCleanupCron,
  "ceo-metrics-email": runCeoMetricsEmailCronJob,
  "daily-product-digest": runDailyProductDigestCronJob,
  "publisher-release-watch": runPublisherReleaseWatchCronJob,
  "spotlight-creator-emails": runSpotlightCreatorEmailsCron,
  "notify-followers-new-books": () => runNotifyFollowersNewBooksCron(),
  "notify-followers-new-posts": () => runNotifyFollowersNewPostsCron(),
  "weekly-botd-newsletter": runWeeklyBotdNewsletterCron,
  "weekly-botd-newsletter-test": runWeeklyBotdNewsletterTestCron,
  "weekly-botd-newsletter-prepare": runWeeklyBotdNewsletterPrepareCron,
  "weekly-trending-instagram": runWeeklyTrendingInstagramCron,
  "instagram-prep-reminder-email": runInstagramPrepReminderEmailCron,
  "instagram-weekly-digest": runInstagramWeeklyDigestCronJob,
  "planner-content-preview-email": runPlannerContentPreviewEmailCron,
  "creator-analytics-digest": runCreatorAnalyticsDigestCronJob,
  "creator-milestone-emails": runCreatorMilestoneEmailsCronJob,
  "stub-outreach-emails": runStubOutreachEmailsCron,
  "interview-reminder-emails": runInterviewReminderEmailsCron,
  "verified-creator-instagram": runVerifiedCreatorInstagramCronJob,
  "fair-instagram": runFairInstagramCronJob,
  "randomize-next-week-botd": runRandomizeNextWeekBotdCronJob,
  "verification-feedback-emails": runVerificationFeedbackEmailsCron,
  "creator-profile-share-emails": runCreatorProfileShareEmailsCron
};
async function runCronJob(name, options = {}) {
  return RUNNERS[name](options);
}
function parseCronRunnerOptionsFromEnv() {
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
  const force = process.env.FORCE === "1" || process.env.FORCE === "true";
  const allPrepared = process.env.ALL_PREPARED === "1" || process.env.ALL_PREPARED === "true";
  const date = parseOptionalEnvDate("DATE");
  const weekStart = parseOptionalEnvDate("WEEK_START");
  const month = process.env.MONTH?.trim() || void 0;
  const to = process.env.TO?.trim() || void 0;
  const creatorId = process.env.CREATOR_ID?.trim() || void 0;
  const fairId = process.env.FAIR_ID?.trim() || void 0;
  const userId = process.env.USER_ID?.trim() || void 0;
  return {
    dryRun,
    force,
    date,
    weekStart,
    month,
    to,
    creatorId,
    fairId,
    userId,
    allPrepared
  };
}
function parseOptionalEnvDate(name) {
  const value = process.env[name]?.trim();
  if (!value) return void 0;
  const date = parseDateString(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${name} (use YYYY-MM-DD)`);
  }
  return date;
}
export {
  CRON_JOB_NAMES,
  isCronJobName,
  parseCronRunnerOptionsFromEnv,
  runBotdAdvanceNotificationEmailsCron,
  runBotdFeatureDayEmailsCron,
  runBotdStoryImageEmailsCron,
  runCeoMetricsEmailCronJob,
  runCreatorAnalyticsDigestCronJob,
  runCreatorMilestoneEmailsCronJob,
  runCreatorProfileShareEmailsCron,
  runCronJob,
  runDailyBotdInstagramCron,
  runDailyProductDigestCronJob,
  runFairInstagramCronJob,
  runInstagramPrepReminderEmailCron,
  runInstagramWeeklyDigestCronJob,
  runInterviewReminderEmailsCron,
  runNotifyFollowersNewBooksCron,
  runNotifyFollowersNewPostsCron,
  runPlannerContentPreviewEmailCron,
  runPublisherReleaseWatchCronJob,
  runRandomizeNextWeekBotdCronJob,
  runSpotlightCreatorEmailsCron,
  runSpotlightStoryImageEmailsCron,
  runStoryUploadCleanupCron,
  runStubOutreachEmailsCron,
  runVerificationFeedbackEmailsCron,
  runVerifiedCreatorInstagramCronJob,
  runWeeklyBotdNewsletterCron,
  runWeeklyBotdNewsletterPrepareCron,
  runWeeklyBotdNewsletterTestCron,
  runWeeklyTrendingInstagramCron
};
