import { err, ok, type Result } from "../../../lib/result";
import { toDateString } from "../../../lib/utils";
import { isNewsletterSendDay } from "../newsletterUtils";
import {
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  getWeekEndDate,
  normalizeWeekStartDate,
  regenerateCampaignContent,
  updateNewsletterCampaignDraft,
} from "../../../features/dashboard/admin/planner/newsletter/services";
import {
  isBrevoNewsletterConfigured,
  sendNewsletterBrevoToList,
} from "../../../features/dashboard/admin/planner/newsletter/brevoServices";

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
