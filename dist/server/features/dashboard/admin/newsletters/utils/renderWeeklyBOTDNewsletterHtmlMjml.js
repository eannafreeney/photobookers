import { jsx } from "react/jsx-runtime";
import { render } from "mjml-react";
import { prepareNewsletterHtmlForEsp } from "../espHtml.js";
import { WeeklyNewsletterMjml } from "../templateMjml.js";
function renderWeeklyBOTDNewsletterHtmlMjml(params) {
  const { html, errors } = render(/* @__PURE__ */ jsx(WeeklyNewsletterMjml, { ...params }), {
    validationLevel: "soft",
    minify: false
  });
  if (errors.length > 0) {
    console.error("MJML compile errors", errors);
    throw new Error("Failed to compile weekly newsletter MJML template");
  }
  return prepareNewsletterHtmlForEsp(html);
}
export {
  renderWeeklyBOTDNewsletterHtmlMjml
};
