import { err, ok } from "../../../lib/result.js";
import { toDateString } from "../../../lib/utils.js";
import { isNewsletterSendDay } from "../newsletterUtils.js";
import {
  ensureCurrentWeeklyNewsletterDraft,
  ensureWeeklyNewsletterDraftForRange,
  getWeekEndDate,
  normalizeWeekStartDate,
  regenerateCampaignContent,
  updateNewsletterCampaignDraft
} from "../../../features/dashboard/admin/planner/newsletterServices.js";
import {
  isBrevoNewsletterConfigured,
  sendNewsletterBrevoToList
} from "../../../features/dashboard/admin/planner/newsletterBrevoServices.js";
const WEEKLY_NEWSLETTER_REQUIRED_BOOKS = 7;
async function ensureDraftForCron(weekStart) {
  if (weekStart) {
    const normalizedStart = normalizeWeekStartDate(weekStart);
    return ensureWeeklyNewsletterDraftForRange(
      normalizedStart,
      getWeekEndDate(normalizedStart)
    );
  }
  return ensureCurrentWeeklyNewsletterDraft();
}
async function runWeeklyNewsletterCron(options = {}) {
  if (!options.dryRun && !options.weekStart && !options.force && !isNewsletterSendDay()) {
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
      reason: "already_sent"
    });
  }
  const [regenError, generated] = await regenerateCampaignContent(campaign.id);
  if (regenError) return err(regenError);
  const bookCount = generated.items.length;
  if (bookCount < WEEKLY_NEWSLETTER_REQUIRED_BOOKS) {
    return err({
      reason: `Expected ${WEEKLY_NEWSLETTER_REQUIRED_BOOKS} books of the day for ${weekStart}, found ${bookCount}`
    });
  }
  if (options.dryRun) {
    return ok({
      action: "dry_run",
      campaignId: campaign.id,
      weekStart,
      bookCount
    });
  }
  if (!isBrevoNewsletterConfigured()) {
    return err({
      reason: "Brevo newsletter send is not configured (BREVO_API_KEY, BREVO_NEWSLETTER_LIST_ID, BREVO_SENDER_EMAIL)"
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
    brevoCampaignId: sendResult.brevoCampaignId
  });
}
export {
  WEEKLY_NEWSLETTER_REQUIRED_BOOKS,
  runWeeklyNewsletterCron
};
