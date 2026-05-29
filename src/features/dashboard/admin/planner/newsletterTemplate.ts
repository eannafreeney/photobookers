import { parseDateString, toDateString } from "../../../../lib/utils";

export type WeeklyNewsletterBookItem = {
  date: string;
  bookId: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  artistName: string | null;
  artistSlug: string | null;
  publisherName: string | null;
  publisherSlug: string | null;
};

export type WeeklyNewsletterCreatorSpotlight = {
  displayName: string;
  slug: string;
  coverUrl: string | null;
  tagline: string | null;
  location: string | null;
} | null;

const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";

/** Inline palette aligned with src/styles/styles.css (autumn / Penguin UI tokens). */
const brand = {
  surface: "#ffffff",
  surfaceAlt: "#fafafa",
  onSurface: "#525252",
  onSurfaceStrong: "#171717",
  onSurfaceWeak: "#a3a3a3",
  outline: "#d4d4d4",
  primary: "#000000",
  onPrimary: "#f5f5f5",
  warning: "#f59e0b",
  fontSans:
    "'Instrument Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontLogo: "'Caveat', ui-sans-serif, system-ui, cursive",
  radius: "4px",
  radiusLg: "8px",
} as const;

/** Cover column width in card layout (book + creator spotlights). */
const cardImageWidthPx = 160;
const cardMediaColWidthPx = 180;
/** Body column max width beside image on wide viewports (hybrid inline-block layout). */
const cardBodyColMaxWidthPx = 420;
/** Fixed square frame so artist/publisher spotlights match regardless of source aspect ratio. */
const creatorSpotlightSizePx = cardImageWidthPx;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/** e.g. "2026-05-31" → "May 31, 2026" (UTC calendar date). */
const formatNewsletterDate = (dateStr: string): string => {
  const date = parseDateString(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const primaryButtonStyle = `
  display:inline-block;
  padding:10px 20px;
  background:${brand.primary};
  color:${brand.onPrimary};
  font-size:14px;
  font-weight:600;
  letter-spacing:0.02em;
  text-decoration:none;
  border-radius:${brand.radius};
  border:1px solid ${brand.primary};
`.replace(/\s+/g, " ");

const emailPrimaryButton = (href: string, label: string) =>
  `<a class="email-btn-primary" href="${escapeHtml(href)}" style="${primaryButtonStyle}">${escapeHtml(label)}</a>`;

const sectionHeadingStyle = `
  margin:0 0 12px;
  padding-bottom:8px;
  border-bottom:1px solid ${brand.outline};
  font-size:11px;
  font-weight:600;
  letter-spacing:0.08em;
  text-transform:uppercase;
  color:${brand.onSurfaceWeak};
`.replace(/\s+/g, " ");

/**
 * Responsive email styles. Duplicated in <head> and at the top of <body> because
 * ESPs like MailerLite often strip <head> when pasting custom HTML.
 */
const responsiveEmailStyles = `
  .card-img {
    display: block;
    width: ${cardImageWidthPx}px;
    max-width: 100%;
    height: auto;
    border-radius: ${brand.radiusLg};
    border: 1px solid ${brand.outline};
  }
  .card-img-creator {
    width: ${creatorSpotlightSizePx}px;
    height: ${creatorSpotlightSizePx}px;
    object-fit: cover;
    object-position: center;
  }
  @media only screen and (min-width: 601px) {
    .card-body-cell { padding: 0 0 0 16px !important; }
  }
  @media only screen and (max-width: 600px) {
    .email-shell { width: 100% !important; }
    .email-body-pad { padding: 20px 16px !important; }
    .hero-subject { font-size: 22px !important; line-height: 1.3 !important; }
    .card-media,
    .card-body {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    .card-media { text-align: center !important; }
    .card-body-cell { padding: 12px 0 0 !important; }
    .card-img-creator-wrap,
    .card-img-creator-wrap td {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .card-img {
      width: 100% !important;
      max-width: ${cardImageWidthPx}px !important;
      height: auto !important;
      margin: 0 auto !important;
    }
    .card-img-creator {
      aspect-ratio: 1 / 1;
      object-fit: cover;
      object-position: center;
    }
    .email-btn-primary,
    .cta-button {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      text-align: center !important;
    }
  }
`.replace(/\s+/g, " ");

const cardCoverImg = (src: string, alt: string) => {
  const imgStyle = `display:block;width:${cardImageWidthPx}px;max-width:100%;height:auto;border-radius:${brand.radiusLg};border:1px solid ${brand.outline};`;
  return `<img class="card-img" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${cardImageWidthPx}" style="${imgStyle}" />`;
};

const creatorSpotlightImg = (src: string, alt: string) => {
  const imgStyle = `display:block;width:${creatorSpotlightSizePx}px;height:${creatorSpotlightSizePx}px;object-fit:cover;object-position:center;border-radius:${brand.radiusLg};border:1px solid ${brand.outline};`;
  return `
    <table role="presentation" class="card-img-creator-wrap" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td width="${creatorSpotlightSizePx}" height="${creatorSpotlightSizePx}" style="width:${creatorSpotlightSizePx}px;height:${creatorSpotlightSizePx}px;line-height:0;font-size:0;">
          <img class="card-img card-img-creator" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${creatorSpotlightSizePx}" height="${creatorSpotlightSizePx}" style="${imgStyle}" />
        </td>
      </tr>
    </table>
  `;
};

/**
 * Hybrid card layout: nested tables as inline-blocks inside one row so columns
 * wrap on narrow viewports without relying on media queries (MailerLite-safe).
 * MSO conditionals keep Outlook desktop side-by-side.
 */
const buildCardColumns = (mediaHtml: string, bodyHtml: string) => `
  <table role="presentation" class="card-row" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="left" valign="top" style="font-size:0;line-height:0;">
        <!--[if mso]><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td width="${cardMediaColWidthPx}" valign="top"><![endif]-->
        <table role="presentation" class="card-media" cellspacing="0" cellpadding="0" align="left" style="display:inline-block;vertical-align:top;width:100%;max-width:${cardMediaColWidthPx}px;">
          <tr>
            <td style="padding:0;font-size:14px;line-height:1.4;">${mediaHtml}</td>
          </tr>
        </table>
        <!--[if mso]></td><td valign="top"><![endif]-->
        <table role="presentation" class="card-body" cellspacing="0" cellpadding="0" align="left" style="display:inline-block;vertical-align:top;width:100%;max-width:${cardBodyColMaxWidthPx}px;">
          <tr>
            <td class="card-body-cell" style="padding:12px 0 0;font-size:14px;line-height:1.4;">${bodyHtml}</td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
`;

const buildBookCard = (item: WeeklyNewsletterBookItem) => {
  const bookUrl = `${appBaseUrl}/books/${item.bookSlug}`;
  const coverBlock = item.coverUrl
    ? cardCoverImg(item.coverUrl, item.title)
    : "";
  const artistLabel = item.artistName
    ? `<p style="margin:4px 0 0;font-size:13px;color:${brand.onSurface};">${escapeHtml(item.artistName)}</p>`
    : "";
  const publisherLabel = item.publisherName
    ? `<p style="margin:2px 0 0;font-size:13px;color:${brand.onSurfaceWeak};">${escapeHtml(item.publisherName)}</p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 4px;font-size:12px;color:${brand.onSurfaceWeak};">${escapeHtml(formatNewsletterDate(item.date))}</p>
    <p style="margin:0;font-size:17px;font-weight:600;line-height:1.35;color:${brand.onSurfaceStrong};">${escapeHtml(item.title)}</p>
    ${artistLabel}
    ${publisherLabel}
    <p style="margin:12px 0 0;">
      ${emailPrimaryButton(bookUrl, "View book")}
    </p>
  `;

  return `
    <tr>
      <td style="padding:0 0 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${brand.outline};border-radius:${brand.radiusLg};background:${brand.surface};">
          <tr>
            <td style="padding:12px;">
              ${buildCardColumns(coverBlock, bodyHtml)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

const buildCreatorSpotlightCard = (
  label: string,
  creator: NonNullable<WeeklyNewsletterCreatorSpotlight>,
) => {
  const creatorUrl = `${appBaseUrl}/creators/${creator.slug}`;
  const coverBlock = creator.coverUrl
    ? creatorSpotlightImg(creator.coverUrl, creator.displayName)
    : "";

  const taglineBlock = creator.tagline
    ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${brand.onSurface};">${escapeHtml(creator.tagline)}</p>`
    : "";
  const locationBlock = creator.location
    ? `<p style="margin:${creator.tagline ? "4" : "8"}px 0 0;font-size:13px;line-height:1.5;color:${brand.onSurfaceWeak};">${escapeHtml(creator.location)}</p>`
    : "";

  const bodyHtml = `
    <p style="margin:0;font-size:20px;font-weight:600;line-height:1.3;color:${brand.onSurfaceStrong};">${escapeHtml(creator.displayName)}</p>
    ${taglineBlock}
    ${locationBlock}
    <p style="margin:12px 0 0;">
      ${emailPrimaryButton(creatorUrl, "View profile")}
    </p>
  `;

  return `
    <tr>
      <td style="padding:0 0 16px;">
        <p style="${sectionHeadingStyle}">${escapeHtml(label)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${brand.outline};border-radius:${brand.radiusLg};background:${brand.surfaceAlt};">
          <tr>
            <td style="padding:12px;">
              ${buildCardColumns(coverBlock, bodyHtml)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

const buildCreatorSpotlightSection = (
  label: string,
  creator: WeeklyNewsletterCreatorSpotlight,
) => (creator ? buildCreatorSpotlightCard(label, creator) : "");

export function renderWeeklyBOTDNewsletterHtml(params: {
  weekStart: Date;
  weekEnd: Date;
  subject: string;
  introText: string;
  outroText: string;
  ctaText: string;
  items: WeeklyNewsletterBookItem[];
  artistOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  publisherOfTheWeek: WeeklyNewsletterCreatorSpotlight;
}) {
  const spotlightRows = [
    buildCreatorSpotlightSection("Artist of the week", params.artistOfTheWeek),
    buildCreatorSpotlightSection(
      "Publisher of the week",
      params.publisherOfTheWeek,
    ),
  ].join("");
  const botdHeading = params.items.length
    ? `<tr><td style="padding:8px 0 12px;"><p style="${sectionHeadingStyle}">Books of the day</p></td></tr>`
    : "";
  const cards =
    params.items.length > 0
      ? params.items.map(buildBookCard).join("")
      : `<tr><td style="padding:12px 0;color:${brand.onSurface};font-size:14px;line-height:1.6;">No BOTD entries were scheduled for this week.</td></tr>`;

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style type="text/css">${responsiveEmailStyles}</style>
    </head>
    <body style="margin:0;padding:0;background:${brand.surfaceAlt};font-family:${brand.fontSans};color:${brand.onSurface};">
      <style type="text/css">${responsiveEmailStyles}</style>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:0 12px;">
            <table role="presentation" class="email-shell" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;">
              <tr>
                <td style="padding:16px 0;text-align:center;">
                  <a href="${escapeHtml(appBaseUrl)}" style="font-family:${brand.fontLogo};font-size:28px;font-weight:600;color:${brand.onSurfaceStrong};text-decoration:none;">Photobookers</a>
                </td>
              </tr>
              <tr>
                <td class="email-body-pad" style="background:${brand.surface};border:1px solid ${brand.outline};border-radius:${brand.radiusLg};padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">      
                    <tr>
                      <td class="hero-subject" style="padding-bottom:16px;font-size:26px;font-weight:700;line-height:1.25;color:${brand.onSurfaceStrong};">${escapeHtml(params.subject)}</td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:20px;font-size:15px;line-height:1.65;color:${brand.onSurface};">${escapeHtml(params.introText)}</td>
                    </tr>
                    ${botdHeading}
                    ${cards}
                    ${spotlightRows}
                    <tr>
                      <td style="padding-top:20px;font-size:15px;line-height:1.65;color:${brand.onSurface};">${escapeHtml(params.outroText)}</td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
           
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
