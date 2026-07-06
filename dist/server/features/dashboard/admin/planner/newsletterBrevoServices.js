import {
  createBrevoEmailCampaign,
  ensureBrevoContact,
  getBrevoConfig,
  prepareNewsletterHtmlForBrevo,
  sendBrevoCampaignNow,
  sendBrevoCampaignTest
} from "../../../../lib/brevo/client.js";
import { err, ok } from "../../../../lib/result.js";
import { toDateString } from "../../../../lib/utils.js";
import {
  buildCampaignPreviewHtml,
  getNewsletterCampaignById,
  updateNewsletterCampaignDraft
} from "./newsletterServices.js";
function defaultTestRecipientEmail() {
  return process.env.BREVO_TEST_EMAIL?.trim() ?? process.env.ADMIN_EMAIL?.trim() ?? null;
}
async function createAndSendBrevoCampaign(campaign, mode, testEmail) {
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
    listIds: [config.listId]
  });
  if (createError) return err(createError);
  if (mode === "test") {
    const recipient = testEmail?.trim().toLowerCase() ?? defaultTestRecipientEmail();
    if (!recipient) {
      return err({
        reason: "No test recipient email. Set BREVO_TEST_EMAIL or ADMIN_EMAIL, or enter an email."
      });
    }
    const [contactError] = await ensureBrevoContact(
      config.apiKey,
      recipient,
      [config.listId]
    );
    if (contactError) {
      return err({
        reason: `Could not add ${recipient} to your Brevo list: ${contactError.reason}`,
        status: contactError.status
      });
    }
    const [testError] = await sendBrevoCampaignTest(config.apiKey, brevoCampaignId, [
      recipient
    ]);
    if (testError) {
      const reason = testError.reason.includes("blacklisted") ? `${testError.reason} Remove the address from Brevo blocklist (Contacts) and try again.` : testError.reason;
      return err({ reason, status: testError.status });
    }
    return ok({
      brevoCampaignId,
      recipient,
      mode: "test"
    });
  }
  const [sendError] = await sendBrevoCampaignNow(config.apiKey, brevoCampaignId);
  if (sendError) return err(sendError);
  const [updateError, updatedCampaign] = await updateNewsletterCampaignDraft(
    campaign.id,
    {
      status: "sent",
      sentAt: /* @__PURE__ */ new Date()
    }
  );
  if (updateError) return err(updateError);
  return ok({
    brevoCampaignId,
    mode: "send",
    campaign: updatedCampaign
  });
}
function isBrevoNewsletterConfigured() {
  const [error] = getBrevoConfig();
  return error === null;
}
async function sendNewsletterBrevoTest(campaignId, testEmail) {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent") {
    return err({ reason: "Cannot send a test for a campaign already marked sent" });
  }
  return createAndSendBrevoCampaign(campaign, "test", testEmail);
}
async function sendNewsletterBrevoToList(campaignId) {
  const campaign = await getNewsletterCampaignById(campaignId);
  if (!campaign) return err({ reason: "Newsletter campaign not found" });
  if (campaign.status === "sent") {
    return err({ reason: "This campaign has already been sent" });
  }
  return createAndSendBrevoCampaign(campaign, "send");
}
export {
  isBrevoNewsletterConfigured,
  sendNewsletterBrevoTest,
  sendNewsletterBrevoToList
};
