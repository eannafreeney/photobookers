import type { WeeklyNewsletterRenderParams } from "./types";

export type WeeklyNewsletterEngine = "react-email" | "mjml";

/**
 * Flip this to switch the weekly newsletter HTML renderer.
 * Preview + Brevo send both go through `renderWeeklyBOTDNewsletterHtml`.
 */
// const WEEKLY_NEWSLETTER_ENGINE: WeeklyNewsletterEngine = "react-email";
const WEEKLY_NEWSLETTER_ENGINE: WeeklyNewsletterEngine = "mjml";

export async function renderWeeklyBOTDNewsletterHtml(
  params: WeeklyNewsletterRenderParams,
): Promise<string> {
  if (WEEKLY_NEWSLETTER_ENGINE === "mjml") {
    const { renderWeeklyBOTDNewsletterHtmlMjml } = await import(
      "./utils/renderWeeklyBOTDNewsletterHtmlMjml"
    );
    return renderWeeklyBOTDNewsletterHtmlMjml(params);
  }

  const { renderWeeklyBOTDNewsletterHtmlReactEmail } = await import(
    "./utils/renderWeeklyBOTDNewsletterHtmlReactEmail"
  );
  return renderWeeklyBOTDNewsletterHtmlReactEmail(params);
}
