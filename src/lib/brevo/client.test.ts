import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createBrevoEmailCampaign,
  ensureBrevoContact,
  getBrevoConfig,
  prepareNewsletterHtmlForBrevo,
  sendBrevoCampaignTest,
} from "./client";

describe("getBrevoConfig", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("returns config when env vars are set", () => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.BREVO_NEWSLETTER_LIST_ID = "12";
    process.env.BREVO_SENDER_EMAIL = "hello@photobookers.com";

    const [error, config] = getBrevoConfig();
    expect(error).toBeNull();
    expect(config).toEqual({
      apiKey: "test-key",
      listId: 12,
      sender: { name: "Photobookers", email: "hello@photobookers.com" },
    });
  });

  it("errors when API key is missing", () => {
    delete process.env.BREVO_API_KEY;
    process.env.BREVO_NEWSLETTER_LIST_ID = "12";
    process.env.BREVO_SENDER_EMAIL = "hello@photobookers.com";

    const [error] = getBrevoConfig();
    expect(error?.reason).toBe("BREVO_API_KEY is not configured");
  });
});

describe("prepareNewsletterHtmlForBrevo", () => {
  it("rewrites MailerLite unsubscribe placeholder for Brevo", () => {
    expect(
      prepareNewsletterHtmlForBrevo('<a href="{$unsubscribe}">Unsubscribe</a>'),
    ).toBe('<a href="{{ unsubscribe }}">Unsubscribe</a>');
  });
});

describe("createBrevoEmailCampaign", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a campaign and returns the id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 456 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const [error, id] = await createBrevoEmailCampaign({
      apiKey: "test-key",
      name: "Test",
      subject: "Hello",
      htmlContent: "<p>Hi</p>",
      sender: { name: "Photobookers", email: "hello@photobookers.com" },
      listIds: [12],
    });

    expect(error).toBeNull();
    expect(id).toBe(456);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/emailCampaigns",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

describe("ensureBrevoContact", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("upserts a contact onto the newsletter list", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 1 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const [error] = await ensureBrevoContact("test-key", "You@Example.com", [12]);

    expect(error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/contacts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "you@example.com",
          listIds: [12],
          updateEnabled: true,
        }),
      }),
    );
  });
});

describe("sendBrevoCampaignTest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts to sendTest endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => undefined,
    });
    vi.stubGlobal("fetch", fetchMock);

    const [error] = await sendBrevoCampaignTest("test-key", 456, [
      "you@example.com",
    ]);

    expect(error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/emailCampaigns/456/sendTest",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
