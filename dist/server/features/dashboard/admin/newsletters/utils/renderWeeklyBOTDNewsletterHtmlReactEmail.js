import { jsx } from "react/jsx-runtime";
import { render } from "@react-email/render";
import { prepareNewsletterHtmlForEsp } from "../espHtml.js";
import { WeeklyNewsletter } from "../templateReactEmail.js";
async function renderWeeklyBOTDNewsletterHtmlReactEmail(params) {
  const element = /* @__PURE__ */ jsx(WeeklyNewsletter, { ...params });
  let html;
  try {
    html = await render(element, { pretty: true });
  } catch (error) {
    console.error(
      "renderWeeklyBOTDNewsletterHtmlReactEmail: pretty render failed",
      error
    );
    html = await render(element, { pretty: false });
  }
  return prepareNewsletterHtmlForEsp(html);
}
export {
  renderWeeklyBOTDNewsletterHtmlReactEmail
};
