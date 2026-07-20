const siteUrl = () => process.env.SITE_URL ?? "https://photobookers.com";

const PHOTOBOOKERS_IG = "@photobookers";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Turn the modal's ISO date input (e.g. `2026-08-06`) into a friendly line like
 * `Thursday, 6 August 2026`, or `null` when absent/unparseable. Parsed at noon
 * so the weekday never slips across a timezone boundary.
 */
export const formatRevealDate = (
  iso: string | null | undefined,
): string | null => {
  const value = iso?.trim();
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

/** Share label for copy — "Issue 3" once numbered, else the quoted title. */
const issueShareLabel = (issueNumber: number | null, issueTitle: string) =>
  issueNumber ? `Issue ${issueNumber}` : `"${issueTitle}"`;

/** Ready-made Instagram caption an artist can paste to reshare their feature. */
export const buildMagazineArtistShareCaption = (params: {
  bookTitle: string;
  issueNumber: number | null;
  issueTitle: string;
  issueUrl: string;
}): string =>
  [
    `My book "${params.bookTitle}" is featured in ${issueShareLabel(
      params.issueNumber,
      params.issueTitle,
    )} of ${PHOTOBOOKERS_IG}.`,
    "",
    "See the issue:",
    params.issueUrl,
    "",
    "#photobook #photobookjousting",
  ].join("\n");

/**
 * "Share kit" block appended to the artist email: the reveal day (when given),
 * the cover to save, a paste-ready caption, and the issue link. Mirrors the
 * planner's BOTD/spotlight share-kit blocks.
 */
const buildMagazineArtistShareKitHtml = (params: {
  bookTitle: string;
  issueNumber: number | null;
  issueTitle: string;
  issueUrl: string;
  coverUrl: string | null;
  revealDate: string | null;
}): string => {
  const caption = buildMagazineArtistShareCaption(params);
  const revealLine = params.revealDate
    ? `<p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#444;">Your book goes live on our Instagram on <strong>${escapeHtml(
        params.revealDate,
      )}</strong>. If you can reshare it to your story that day, that's when it will reach the most people.</p>`
    : "";
  const coverBlock = params.coverUrl
    ? `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">Here is your cover to save and share:</p>
    <img src="${escapeHtml(params.coverUrl)}" alt="${escapeHtml(
      params.bookTitle,
    )}" width="220" style="display:block;margin:0 0 16px;border-radius:8px;max-width:100%;height:auto;" />`
    : "";
  return `
    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111;">Share kit</p>
    ${revealLine}
    ${coverBlock}
    <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">Ready-made caption you can paste into Instagram:</p>
    <pre style="margin:0 0 16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:13px;line-height:1.5;white-space:pre-wrap;color:#111;font-family:inherit;">${escapeHtml(
      caption,
    )}</pre>
    <p style="margin:0;font-size:14px;line-height:1.5;color:#444;">The issue:<br/><a href="${escapeHtml(
      params.issueUrl,
    )}">${escapeHtml(params.issueUrl)}</a></p>
  `;
};

/**
 * Email sent to an artist whose book has been selected for a magazine issue,
 * inviting them to answer the editor's question for that book and giving them a
 * ready-to-share kit for launch day. Mirrors the raw `<p>` style of the other
 * creator emails (the send function wraps branding).
 */
export const generateMagazineArtistPromptEmail = (params: {
  artistName: string;
  bookTitle: string;
  issueTitle: string;
  issueKicker: string | null;
  issueNumber: number | null;
  artistPrompt: string;
  bookUrl: string;
  issueUrl: string;
  coverUrl: string | null;
  revealDate: string | null;
}) => {
  const feature = params.issueKicker
    ? `${params.issueKicker} — ${params.issueTitle}`
    : params.issueTitle;
  const shareKit = buildMagazineArtistShareKitHtml({
    bookTitle: params.bookTitle,
    issueNumber: params.issueNumber,
    issueTitle: params.issueTitle,
    issueUrl: params.issueUrl,
    coverUrl: params.coverUrl,
    revealDate: params.revealDate,
  });
  return `
    <p>Hi ${params.artistName},</p>
    <p>My name is Eanna de Freine — I am the founder of Photobookers.</p>
    <p>
      Great news: your book <strong>${params.bookTitle}</strong> has been selected
      to feature in our upcoming magazine issue, <strong>${feature}</strong>.
    </p>
    <p>
      As part of the feature I would love to include a few words from you. Here is
      the question I have for you about this book:
    </p>
    <blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
      ${params.artistPrompt}
    </blockquote>
    <p>
      Just reply to this email with your answer — a sentence or two is perfect, and
      it will be published alongside the book in the issue.
    </p>
    <p>You can see the book on your profile here:<br/>
      <a href="${params.bookUrl}">View book</a>
    </p>
    ${shareKit}
    <p>Thank you,<br/>Eanna<br/>Photobookers</p>
  `;
};

/** Subject line for the artist-prompt email. */
export const magazineArtistPromptEmailSubject = (issueTitle: string) =>
  `Your book has been selected for ${issueTitle}`;

export const magazineSiteUrl = siteUrl;
