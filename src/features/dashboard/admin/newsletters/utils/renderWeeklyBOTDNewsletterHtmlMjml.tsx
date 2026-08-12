/** @jsxImportSource react */

import { render } from "mjml-react";
import { rewriteNewsletterImagesForEmail } from "../emailImages";
import { prepareNewsletterHtmlForEsp } from "../espHtml";
import { WeeklyNewsletterMjml } from "../templateMjml";
import type { WeeklyNewsletterRenderParams } from "../types";

export async function renderWeeklyBOTDNewsletterHtmlMjml(
  params: WeeklyNewsletterRenderParams,
): Promise<string> {
  const { html, errors } = render(<WeeklyNewsletterMjml {...params} />, {
    validationLevel: "soft",
    minify: false,
  });
  if (errors.length > 0) {
    console.error("MJML compile errors", errors);
    throw new Error("Failed to compile weekly newsletter MJML template");
  }
  return rewriteNewsletterImagesForEmail(prepareNewsletterHtmlForEsp(html));
}
