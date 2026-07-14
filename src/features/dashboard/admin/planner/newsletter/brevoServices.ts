import {
  createBrevoEmailCampaign,
  ensureBrevoContact,
  getBrevoConfig,
  prepareNewsletterHtmlForBrevo,
  sendBrevoCampaignNow,
  sendBrevoCampaignTest,
} from "../../../../../lib/brevo/client";
import { err, ok, type Result } from "../../../../../lib/result";
import { toDateString } from "../../../../../lib/utils";
import type { NewsletterCampaign } from "../../../../../db/schema";
import {
  buildCampaignPreviewHtml,
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft,
} from "./services";

type BrevoCampaignError = { reason: string; status?: number };

export type BrevoNewsletterTestResult = {
  brevoCampaignId: number;
  recipient: string;
  mode: "test";
};

export type BrevoNewsletterSendResult = {
  brevoCampaignId: number;
  mode: "send";
  campaign: NewsletterCampaign;
};

function defaultTestRecipientEmail(): string | null {
  // Use `||` (not `??`): GitHub Actions renders an unset secret as an empty
  // string, which `??` would not skip — so BREVO_TEST_EMAIL="" must still fall
  // through to ADMIN_EMAIL.
  return (
    process.env.BREVO_TEST_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    null
  );
}

async function createAndSendBrevoCampaign(
  campaign: NonNullable<Awaited<ReturnType<typeof getNewsletterCampaignById>>>,
  mode: "test",
  testEmail?: string,
): Promise<Result<BrevoNewsletterTestResult, BrevoCampaignError>>;
async function createAndSendBrevoCampaign(
  campaign: NonNullable<Awaited<ReturnType<typeof getNewsletterCampaignById>>>,
  mode: "send",
): Promise<Result<BrevoNewsletterSendResult, BrevoCampaignError>>;
async function createAndSendBrevoCampaign(
  campaign: NonNullable<Awaited<ReturnType<typeof getNewsletterCampaignById>>>,
  mode: "test" | "send",
  testEmail?: string,
) {
  const [configError, config] = getBrevoConfig();
  if (configError) return err(configError);

  const html = await buildCampaignPreviewHtml(campaign);
  const htmlContent = prepareNewsletterHtmlForBrevo(html);
  const weekLabel = toDateString(campaign.weekStart);

  const [createError, brevoCampaignId] = await createBrevoEmailCampaign({
    apiKey: config.apiKey,
    name: `Photobookers BOTD ${weekLabel}`,
    subject: campaign.subject,
    htmlContent,
    sender: config.sender,
    listIds: [config.listId],
  });
  if (createError) return err(createError);

  if (mode === "test") {
    const recipient =
      testEmail?.trim().toLowerCase() ?? defaultTestRecipientEmail();
    if (!recipient) {
      return err({
        reason:
          "No test recipient email. Set BREVO_TEST_EMAIL or ADMIN_EMAIL, or enter an email.",
      });
    }

    const [contactError] = await ensureBrevoContact(config.apiKey, recipient, [
      config.listId,
    ]);
    if (contactError) {
      return err({
        reason: `Could not add ${recipient} to your Brevo list: ${contactError.reason}`,
        status: contactError.status,
      });
    }

    const [testError] = await sendBrevoCampaignTest(
      config.apiKey,
      brevoCampaignId,
      [recipient],
    );
    if (testError) {
      const reason = testError.reason.includes("blacklisted")
        ? `${testError.reason} Remove the address from Brevo blocklist (Contacts) and try again.`
        : testError.reason;
      return err({ reason, status: testError.status });
    }

    return ok({
      brevoCampaignId,
      recipient,
      mode: "test" as const,
    });
  }

  const [sendError] = await sendBrevoCampaignNow(
    config.apiKey,
    brevoCampaignId,
  );
  if (sendError) return err(sendError);

  const [updateError, updatedCampaign] = await updateNewsletterCampaignDraft(
    campaign.id,
    {
      status: "sent",
      sentAt: new Date(),
    },
  );
  if (updateError) return err(updateError);

  return ok({
    brevoCampaignId,
    mode: "send" as const,
    campaign: updatedCampaign,
  });
}

export function isBrevoNewsletterConfigured(): boolean {
  const [error] = getBrevoConfig();
  return error === null;
}

export async function sendNewsletterBrevoTest(
  campaignId: string,
  testEmail?: string,
): Promise<Result<BrevoNewsletterTestResult, BrevoCampaignError>> {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent") {
    return err({
      reason: "Cannot send a test for a campaign already marked sent",
    });
  }

  return createAndSendBrevoCampaign(campaign, "test", testEmail);
}

export async function sendNewsletterBrevoToList(
  campaignId: string,
): Promise<Result<BrevoNewsletterSendResult, BrevoCampaignError>> {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent") {
    return err({ reason: "This campaign has already been sent" });
  }

  return createAndSendBrevoCampaign(campaign, "send");
}
