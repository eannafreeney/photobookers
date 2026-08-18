import {
  fetchInstagramData,
  generateInstagramInsights,
} from "../../lib/instagram-graph";
import { sendAdminEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import {
  buildInstagramWeeklyDigestEmail,
  instagramWeeklyDigestSubject,
} from "./emails";
import { postsInLastDays } from "./stats";

type ServiceError = { reason: string; cause?: unknown };

export type InstagramWeeklyDigestCronResult = {
  action: "sent" | "dry_run";
  weekLabel: string;
  postsInWindow: number;
  followers: number;
};

export type InstagramWeeklyDigestCronOptions = {
  dryRun?: boolean;
  date?: Date;
};

function weekLabelFor(asOf: Date): string {
  const end = new Date(asOf);
  const start = new Date(asOf.getTime() - 6 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return `${fmt(start)} → ${fmt(end)}`;
}

export async function runInstagramWeeklyDigestCron(
  options: InstagramWeeklyDigestCronOptions = {},
): Promise<Result<InstagramWeeklyDigestCronResult, ServiceError>> {
  const asOf = options.date ?? new Date();
  const weekLabel = weekLabelFor(asOf);

  const [fetchError, account] = await fetchInstagramData();
  if (fetchError) {
    return err({ reason: fetchError.message, cause: fetchError });
  }

  const weekPosts = postsInLastDays(account.recentPosts, 7, asOf);
  // Prefer week window for AI; fall back to recent feed if quiet week
  const forInsights = {
    ...account,
    recentPosts: weekPosts.length > 0 ? weekPosts : account.recentPosts,
  };
  const insightsMarkdown = await generateInstagramInsights(forInsights);

  const subject = instagramWeeklyDigestSubject(weekLabel);
  const html = buildInstagramWeeklyDigestEmail({
    weekLabel,
    account,
    weekPosts,
    insightsMarkdown,
  });

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      weekLabel,
      postsInWindow: weekPosts.length,
      followers: account.followers_count,
    });
  }

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }

  return ok({
    action: "sent",
    weekLabel,
    postsInWindow: weekPosts.length,
    followers: account.followers_count,
  });
}
