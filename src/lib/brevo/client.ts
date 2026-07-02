import { err, ok, type Result } from "../result";

const BREVO_API_BASE = "https://api.brevo.com/v3";

export type BrevoSender = {
  name: string;
  email: string;
};

export type BrevoConfig = {
  apiKey: string;
  listId: number;
  sender: BrevoSender;
};

export function getBrevoConfig(): Result<BrevoConfig, { reason: string }> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL?.trim() ??
    process.env.ADMIN_EMAIL?.trim() ??
    "";
  const senderName = process.env.BREVO_SENDER_NAME?.trim() ?? "Photobookers";

  if (!apiKey) {
    return err({ reason: "BREVO_API_KEY is not configured" });
  }
  if (!Number.isFinite(listId) || listId <= 0) {
    return err({ reason: "BREVO_NEWSLETTER_LIST_ID is not configured" });
  }
  if (!senderEmail) {
    return err({
      reason: "BREVO_SENDER_EMAIL or ADMIN_EMAIL must be configured",
    });
  }

  return ok({
    apiKey,
    listId,
    sender: { name: senderName, email: senderEmail },
  });
}

type BrevoApiErrorBody = {
  message?: string;
  code?: string;
};

async function parseBrevoError(
  res: Response,
): Promise<{ reason: string; status: number }> {
  let message = res.statusText || "Brevo API request failed";
  try {
    const body = (await res.json()) as BrevoApiErrorBody;
    if (body.message) message = body.message;
  } catch {
    // ignore JSON parse errors
  }
  return { reason: message, status: res.status };
}

async function brevoFetch<T>(
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<Result<T, { reason: string; status?: number }>> {
  try {
    const res = await fetch(`${BREVO_API_BASE}${path}`, {
      ...init,
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const apiError = await parseBrevoError(res);
      return err(apiError);
    }

    if (res.status === 204) {
      return ok(undefined as T);
    }

    const data = (await res.json()) as T;
    return ok(data);
  } catch (e) {
    console.error("brevoFetch", path, e);
    return err({ reason: "Failed to reach Brevo API" });
  }
}

export type CreateBrevoEmailCampaignInput = {
  apiKey: string;
  name: string;
  subject: string;
  htmlContent: string;
  sender: BrevoSender;
  listIds: number[];
};

export async function createBrevoEmailCampaign(
  input: CreateBrevoEmailCampaignInput,
): Promise<Result<number, { reason: string; status?: number }>> {
  try {
    const [error, data] = await brevoFetch<{ id: number }>(
      input.apiKey,
      "/emailCampaigns",
      {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          subject: input.subject,
          sender: input.sender,
          recipients: { listIds: input.listIds },
          htmlContent: input.htmlContent,
        }),
      },
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

/**
 * Brevo campaign test sends only work for contacts on a list. Upsert before sendTest.
 * @see https://developers.brevo.com/reference/createcontact
 */
export async function ensureBrevoContact(
  apiKey: string,
  email: string,
  listIds: number[],
): Promise<Result<void, { reason: string; status?: number }>> {
  try {
    const [error] = await brevoFetch<{ id?: number }>(apiKey, "/contacts", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        listIds,
        updateEnabled: true,
      }),
    });
    if (error) return err(error);
    return ok(undefined);
  } catch (e) {
    console.error("ensureBrevoContact", email, listIds, e);
    return err({ reason: "Failed to ensure Brevo contact" });
  }
}

export async function sendBrevoCampaignTest(
  apiKey: string,
  campaignId: number,
  emailTo: string[],
): Promise<Result<void, { reason: string; status?: number }>> {
  try {
    const [error] = await brevoFetch<void>(
      apiKey,
      `/emailCampaigns/${campaignId}/sendTest`,
      {
        method: "POST",
        body: JSON.stringify({ emailTo }),
      },
    );
    if (error) return err(error);
    return ok(undefined);
  } catch (e) {
    console.error("sendBrevoCampaignTest", campaignId, emailTo, e);
    return err({ reason: "Failed to send Brevo campaign test" });
  }
}

export async function sendBrevoCampaignNow(
  apiKey: string,
  campaignId: number,
): Promise<Result<void, { reason: string; status?: number }>> {
  try {
    const [error] = await brevoFetch<void>(
      apiKey,
      `/emailCampaigns/${campaignId}/sendNow`,
      {
        method: "POST",
      },
    );
    if (error) return err(error);
    return ok(undefined);
  } catch (e) {
    console.error("sendBrevoCampaignNow", campaignId, e);
    return err({ reason: "Failed to send Brevo campaign" });
  }
}

/** MailerLite-style placeholder → Brevo campaign merge tag. */
export function prepareNewsletterHtmlForBrevo(html: string): string {
  return html.replace(/\{\$unsubscribe\}/g, "{{ unsubscribe }}");
}

export type BrevoListStats = {
  id: number;
  name: string;
  totalSubscribers: number;
  uniqueSubscribers: number;
};

export type BrevoContactSummary = {
  email: string;
  createdAt: string;
};

export function getBrevoListDashboardUrl(listId: number): string {
  return `https://app.brevo.com/contact/list/listing/id/${listId}`;
}

export async function getBrevoListStats(
  apiKey: string,
  listId: number,
): Promise<Result<BrevoListStats, { reason: string; status?: number }>> {
  try {
    const [error, data] = await brevoFetch<{
      id: number;
      name: string;
      totalSubscribers?: number;
      uniqueSubscribers?: number;
    }>(apiKey, `/contacts/lists/${listId}`);

    if (error) return err(error);
    if (!data?.id) {
      return err({ reason: "Brevo did not return list details" });
    }

    return ok({
      id: data.id,
      name: data.name,
      totalSubscribers: data.totalSubscribers ?? 0,
      uniqueSubscribers: data.uniqueSubscribers ?? data.totalSubscribers ?? 0,
    });
  } catch (e) {
    console.error("getBrevoListStats", listId, e);
    return err({ reason: "Failed to load Brevo list stats" });
  }
}

type FetchBrevoListContactsOptions = {
  createdSince?: Date;
};

export async function fetchBrevoListContacts(
  apiKey: string,
  listId: number,
  options: FetchBrevoListContactsOptions = {},
): Promise<Result<BrevoContactSummary[], { reason: string; status?: number }>> {
  const PAGE_SIZE = 1000;
  const contacts: BrevoContactSummary[] = [];
  let offset = 0;

  try {
    while (true) {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        sort: "asc",
      });
      params.append("listIds", String(listId));
      if (options.createdSince) {
        params.set("createdSince", options.createdSince.toISOString());
      }

      const [error, data] = await brevoFetch<{
        contacts?: Array<{ email?: string; createdAt?: string }>;
      }>(apiKey, `/contacts?${params.toString()}`);

      if (error) return err(error);

      const page = (data?.contacts ?? [])
        .filter(
          (contact): contact is { email: string; createdAt: string } =>
            Boolean(contact.email?.trim() && contact.createdAt),
        )
        .map((contact) => ({
          email: contact.email.trim().toLowerCase(),
          createdAt: contact.createdAt,
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
