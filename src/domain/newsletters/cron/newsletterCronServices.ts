import { err, ok, type Result } from "../../../lib/result";
import { toDateString } from "../../../lib/utils";
import type { NewsletterCampaignStatus } from "../../../db/schema";
import {
  getNextNewsletterRange,
  isNewsletterSendDay,
  isNewsletterTestDay,
} from "../newsletterUtils";
import {
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  getWeekEndDate,
  normalizeWeekStartDate,
  regenerateCampaignContent,
  updateNewsletterCampaignDraft,
} from "../../../features/dashboard/admin/newsletters/services";
import {
  isBrevoNewsletterConfigured,
  sendNewsletterBrevoTest,
  sendNewsletterBrevoToList,
} from "../../../features/dashboard/admin/newsletters/brevoServices";

export const WEEKLY_NEWSLETTER_REQUIRED_BOOKS = 7;

type CronError = { reason: string; status?: number };

export type WeeklyNewsletterCronResult =
  | {
      action: "skipped";
      reason: "not_wednesday";
    }
  | {
      action: "skipped";
      campaignId: string;
      weekStart: string;
      reason: "already_sent";
    }
  | {
      action: "dry_run";
      campaignId: string;
      weekStart: string;
      bookCount: number;
    }
  | {
      action: "sent";
      campaignId: string;
      weekStart: string;
      bookCount: number;
      brevoCampaignId: number;
    };

export type RunWeeklyNewsletterCronOptions = {
  dryRun?: boolean;
  weekStart?: Date;
  /** Bypass Wednesday-only guard (for backfill/testing). */
  force?: boolean;
};

async function ensureDraftForCron(weekStart?: Date) {
  if (weekStart) {
    const normalizedStart = normalizeWeekStartDate(weekStart);
    return ensureWeeklyNewsletterDraftForRange(
      normalizedStart,
      getWeekEndDate(normalizedStart),
    );
  }
  return ensureCurrentWeeklyNewsletterDraft();
}

export async function runWeeklyNewsletterCron(
  options: RunWeeklyNewsletterCronOptions = {},
): Promise<Result<WeeklyNewsletterCronResult, CronError>> {
  if (
    !options.dryRun &&
    !options.weekStart &&
    !options.force &&
    !isNewsletterSendDay()
  ) {
    return ok({ action: "skipped", reason: "not_wednesday" });
  }

  const [draftError, campaign] = await ensureDraftForCron(options.weekStart);
  if (draftError) return err(draftError);
  if (!campaign) return err({ reason: "Failed to prepare newsletter draft" });

  const weekStart = toDateString(campaign.weekStart);

  if (campaign.status === "sent") {
    return ok({
      action: "skipped",
      campaignId: campaign.id,
      weekStart,
      reason: "already_sent",
    });
  }

  const [regenError, generated] = await regenerateCampaignContent(campaign.id);
  if (regenError) return err(regenError);

  const bookCount = generated.botdEntries.length;
  if (bookCount < WEEKLY_NEWSLETTER_REQUIRED_BOOKS) {
    return err({
      reason: `Expected ${WEEKLY_NEWSLETTER_REQUIRED_BOOKS} books of the day for ${weekStart}, found ${bookCount}`,
    });
  }

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      campaignId: campaign.id,
      weekStart,
      bookCount,
    });
  }

  if (!isBrevoNewsletterConfigured()) {
    return err({
      reason:
        "Brevo newsletter send is not configured (BREVO_API_KEY, BREVO_NEWSLETTER_LIST_ID, BREVO_SENDER_EMAIL)",
    });
  }

  const [sendError, sendResult] = await sendNewsletterBrevoToList(campaign.id);
  if (sendError) {
    await updateNewsletterCampaignDraft(campaign.id, { status: "failed" });
    return err(sendError);
  }

  return ok({
    action: "sent",
    campaignId: campaign.id,
    weekStart,
    bookCount,
    brevoCampaignId: sendResult.brevoCampaignId,
  });
}

export type WeeklyNewsletterTestCronResult =
  | {
      action: "skipped";
      reason: "not_tuesday";
    }
  | {
      action: "skipped";
      campaignId: string;
      weekStart: string;
      reason: "already_sent";
    }
  | {
      action: "dry_run";
      campaignId: string;
      weekStart: string;
      bookCount: number;
      recipient: string | null;
    }
  | {
      action: "test_sent";
      campaignId: string;
      weekStart: string;
      bookCount: number;
      brevoCampaignId: number;
      recipient: string;
    };

export type RunWeeklyNewsletterTestCronOptions = RunWeeklyNewsletterCronOptions & {
  /** Override test recipient (defaults to BREVO_TEST_EMAIL or ADMIN_EMAIL). */
  to?: string;
};

export async function runWeeklyNewsletterTestCron(
  options: RunWeeklyNewsletterTestCronOptions = {},
): Promise<Result<WeeklyNewsletterTestCronResult, CronError>> {
  if (
    !options.dryRun &&
    !options.weekStart &&
    !options.force &&
    !isNewsletterTestDay()
  ) {
    return ok({ action: "skipped", reason: "not_tuesday" });
  }

  const [draftError, campaign] = await ensureDraftForCron(options.weekStart);
  if (draftError) return err(draftError);
  if (!campaign) return err({ reason: "Failed to prepare newsletter draft" });

  const weekStart = toDateString(campaign.weekStart);

  if (campaign.status === "sent") {
    return ok({
      action: "skipped",
      campaignId: campaign.id,
      weekStart,
      reason: "already_sent",
    });
  }

  const [regenError, generated] = await regenerateCampaignContent(campaign.id);
  if (regenError) return err(regenError);

  const bookCount = generated.botdEntries.length;
  if (bookCount === 0) {
    return err({
      reason: `No books of the day for ${weekStart} yet`,
    });
  }

  const recipient =
    options.to?.trim().toLowerCase() ??
    process.env.BREVO_TEST_EMAIL?.trim().toLowerCase() ??
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ??
    null;

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      campaignId: campaign.id,
      weekStart,
      bookCount,
      recipient,
    });
  }

  if (!isBrevoNewsletterConfigured()) {
    return err({
      reason:
        "Brevo newsletter send is not configured (BREVO_API_KEY, BREVO_NEWSLETTER_LIST_ID, BREVO_SENDER_EMAIL)",
    });
  }

  const [sendError, sendResult] = await sendNewsletterBrevoTest(
    campaign.id,
    options.to,
  );
  if (sendError) return err(sendError);

  return ok({
    action: "test_sent",
    campaignId: campaign.id,
    weekStart,
    bookCount,
    brevoCampaignId: sendResult.brevoCampaignId,
    recipient: sendResult.recipient,
  });
}

export type PrepareNextNewsletterCronResult =
  | { action: "skipped"; reason: "not_tuesday" }
  | { action: "dry_run"; weekStart: string }
  | {
      action: "prepared";
      campaignId: string;
      weekStart: string;
      status: NewsletterCampaignStatus;
    };

/**
 * Pre-create the draft for the next Thu–Wed edition. Runs Tuesday so next week's
 * newsletter exists a full week ahead of its Wednesday send. Idempotent: reuses
 * the existing draft if one is already there.
 */
export async function runPrepareNextNewsletterCron(
  options: RunWeeklyNewsletterCronOptions = {},
): Promise<Result<PrepareNextNewsletterCronResult, CronError>> {
  if (!options.dryRun && !options.force && !isNewsletterTestDay()) {
    return ok({ action: "skipped", reason: "not_tuesday" });
  }

  const { weekStart, weekEnd } = getNextNewsletterRange();

  if (options.dryRun) {
    return ok({ action: "dry_run", weekStart: toDateString(weekStart) });
  }

  const [error, campaign] = await ensureWeeklyNewsletterDraftForRange(
    weekStart,
    weekEnd,
    { skipContent: true },
  );
  if (error) return err(error);

  return ok({
    action: "prepared",
    campaignId: campaign.id,
    weekStart: toDateString(campaign.weekStart),
    status: campaign.status,
  });
}
