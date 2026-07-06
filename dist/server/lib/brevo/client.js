import { err, ok } from "../result.js";
const BREVO_API_BASE = "https://api.brevo.com/v3";
function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() ?? process.env.ADMIN_EMAIL?.trim() ?? "";
  const senderName = process.env.BREVO_SENDER_NAME?.trim() ?? "Photobookers";
  if (!apiKey) {
    return err({ reason: "BREVO_API_KEY is not configured" });
  }
  if (!Number.isFinite(listId) || listId <= 0) {
    return err({ reason: "BREVO_NEWSLETTER_LIST_ID is not configured" });
  }
  if (!senderEmail) {
    return err({
      reason: "BREVO_SENDER_EMAIL or ADMIN_EMAIL must be configured"
    });
  }
  return ok({
    apiKey,
    listId,
    sender: { name: senderName, email: senderEmail }
  });
}
async function parseBrevoError(res) {
  let message = res.statusText || "Brevo API request failed";
  try {
    const body = await res.json();
    if (body.message) message = body.message;
  } catch {
  }
  return { reason: message, status: res.status };
}
async function brevoFetch(apiKey, path, init) {
  try {
    const res = await fetch(`${BREVO_API_BASE}${path}`, {
      ...init,
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
    if (!res.ok) {
      const apiError = await parseBrevoError(res);
      return err(apiError);
    }
    if (res.status === 204) {
      return ok(void 0);
    }
    const data = await res.json();
    return ok(data);
  } catch (e) {
    console.error("brevoFetch", path, e);
    return err({ reason: "Failed to reach Brevo API" });
  }
}
async function createBrevoEmailCampaign(input) {
  try {
    const [error, data] = await brevoFetch(
      input.apiKey,
      "/emailCampaigns",
      {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          subject: input.subject,
          sender: input.sender,
          recipients: { listIds: input.listIds },
          htmlContent: input.htmlContent
        })
      }
    );
    if (error) return err(error);
    if (!data?.id) {
      return err({ reason: "Brevo did not return a campaign id" });
    }
    return ok(data.id);
  } catch (e) {
    console.error("createBrevoEmailCampaign", input, e);
    return err({ reason: "Failed to create Brevo campaign" });
  }
}
async function ensureBrevoContact(apiKey, email, listIds) {
  try {
    const [error] = await brevoFetch(apiKey, "/contacts", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        listIds,
        updateEnabled: true
      })
    });
    if (error) return err(error);
    return ok(void 0);
  } catch (e) {
    console.error("ensureBrevoContact", email, listIds, e);
    return err({ reason: "Failed to ensure Brevo contact" });
  }
}
async function sendBrevoCampaignTest(apiKey, campaignId, emailTo) {
  try {
    const [error] = await brevoFetch(
      apiKey,
      `/emailCampaigns/${campaignId}/sendTest`,
      {
        method: "POST",
        body: JSON.stringify({ emailTo })
      }
    );
    if (error) return err(error);
    return ok(void 0);
  } catch (e) {
    console.error("sendBrevoCampaignTest", campaignId, emailTo, e);
    return err({ reason: "Failed to send Brevo campaign test" });
  }
}
async function sendBrevoCampaignNow(apiKey, campaignId) {
  try {
    const [error] = await brevoFetch(
      apiKey,
      `/emailCampaigns/${campaignId}/sendNow`,
      {
        method: "POST"
      }
    );
    if (error) return err(error);
    return ok(void 0);
  } catch (e) {
    console.error("sendBrevoCampaignNow", campaignId, e);
    return err({ reason: "Failed to send Brevo campaign" });
  }
}
function prepareNewsletterHtmlForBrevo(html) {
  return html.replace(/\{\$unsubscribe\}/g, "{{ unsubscribe }}");
}
function getBrevoListDashboardUrl(listId) {
  return `https://app.brevo.com/contact/list/listing/id/${listId}`;
}
async function getBrevoListStats(apiKey, listId) {
  try {
    const [error, data] = await brevoFetch(apiKey, `/contacts/lists/${listId}`);
    if (error) return err(error);
    if (!data?.id) {
      return err({ reason: "Brevo did not return list details" });
    }
    return ok({
      id: data.id,
      name: data.name,
      totalSubscribers: data.totalSubscribers ?? 0,
      uniqueSubscribers: data.uniqueSubscribers ?? data.totalSubscribers ?? 0
    });
  } catch (e) {
    console.error("getBrevoListStats", listId, e);
    return err({ reason: "Failed to load Brevo list stats" });
  }
}
async function fetchBrevoListContacts(apiKey, listId, options = {}) {
  const PAGE_SIZE = 1e3;
  const contacts = [];
  let offset = 0;
  try {
    while (true) {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        sort: "asc"
      });
      params.append("listIds", String(listId));
      if (options.createdSince) {
        params.set("createdSince", options.createdSince.toISOString());
      }
      const [error, data] = await brevoFetch(apiKey, `/contacts?${params.toString()}`);
      if (error) return err(error);
      const page = (data?.contacts ?? []).filter(
        (contact) => Boolean(contact.email?.trim() && contact.createdAt)
      ).map((contact) => ({
        email: contact.email.trim().toLowerCase(),
        createdAt: contact.createdAt
      }));
      contacts.push(...page);
      if (page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
    return ok(contacts);
  } catch (e) {
    console.error("fetchBrevoListContacts", listId, options, e);
    return err({ reason: "Failed to load Brevo contacts" });
  }
}
export {
  createBrevoEmailCampaign,
  ensureBrevoContact,
  fetchBrevoListContacts,
  getBrevoConfig,
  getBrevoListDashboardUrl,
  getBrevoListStats,
  prepareNewsletterHtmlForBrevo,
  sendBrevoCampaignNow,
  sendBrevoCampaignTest
};
