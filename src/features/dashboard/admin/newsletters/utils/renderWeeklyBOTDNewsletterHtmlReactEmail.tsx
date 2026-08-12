/** @jsxImportSource react */

import { render } from "@react-email/render";
import { rewriteNewsletterImagesForEmail } from "../emailImages";
import { prepareNewsletterHtmlForEsp } from "../espHtml";
import { WeeklyNewsletter } from "../templateReactEmail";
import type { WeeklyNewsletterRenderParams } from "../types";

export async function renderWeeklyBOTDNewsletterHtmlReactEmail(
  params: WeeklyNewsletterRenderParams,
): Promise<string> {
  const element = <WeeklyNewsletter {...params} />;
  // `pretty: true` runs the output through prettier, whose HTML parser can throw
  // on otherwise-valid email markup. Fall back to unformatted HTML so a
  // formatting quirk never takes down the preview or a send.
  let html: string;
  try {
    html = await render(element, { pretty: true });
  } catch (error) {
    console.error(
      "renderWeeklyBOTDNewsletterHtmlReactEmail: pretty render failed",
      error,
    );
    html = await render(element, { pretty: false });
  }
  return rewriteNewsletterImagesForEmail(prepareNewsletterHtmlForEsp(html));
}
