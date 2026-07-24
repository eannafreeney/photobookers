/** @jsxImportSource react */

import { render } from "mjml-react";
import { prepareNewsletterHtmlForEsp } from "../espHtml";
import { WeeklyNewsletterMjml } from "../templateMjml";
import type { WeeklyNewsletterRenderParams } from "../types";

export function renderWeeklyBOTDNewsletterHtmlMjml(
  params: WeeklyNewsletterRenderParams,
): string {
  const { html, errors } = render(<WeeklyNewsletterMjml {...params} />, {
    validationLevel: "soft",
    minify: false,
  });
  if (errors.length > 0) {
    console.error("MJML compile errors", errors);
    throw new Error("Failed to compile weekly newsletter MJML template");
  }
  return prepareNewsletterHtmlForEsp(html);
}
