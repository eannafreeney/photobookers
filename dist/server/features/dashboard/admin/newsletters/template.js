const WEEKLY_NEWSLETTER_ENGINE = "mjml";
async function renderWeeklyBOTDNewsletterHtml(params) {
  if (WEEKLY_NEWSLETTER_ENGINE === "mjml") {
    const { renderWeeklyBOTDNewsletterHtmlMjml } = await import("./utils/renderWeeklyBOTDNewsletterHtmlMjml.js");
    return renderWeeklyBOTDNewsletterHtmlMjml(params);
  }
  const { renderWeeklyBOTDNewsletterHtmlReactEmail } = await import("./utils/renderWeeklyBOTDNewsletterHtmlReactEmail.js");
  return renderWeeklyBOTDNewsletterHtmlReactEmail(params);
}
export {
  renderWeeklyBOTDNewsletterHtml
};
