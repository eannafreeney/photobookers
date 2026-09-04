import { formatInstagramHandle } from "./social-media/instagramCaption";

const PHOTOBOOKERS_IG = "@photobookers";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Ready-made Instagram caption creators can copy when their spotlight goes live. */
export function buildCreatorShareKitInstagramCaption(params: {
  displayName: string;
  type: "artist" | "publisher";
  spotlightUrl: string;
  newsletterUrl: string;
  instagram?: string | null;
}): string {
  const role =
    params.type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const lines = [
    `I'm ${role} on ${PHOTOBOOKERS_IG} this week.`,
    "",
    "See the full feature:",
    params.spotlightUrl,
    "",
    "Get next week's Book of the Day picks by email:",
    params.newsletterUrl,
  ];
  const handle = formatInstagramHandle(params.instagram);
  if (handle) lines.push("", handle);
  lines.push("", "#photobook #photobookjousting");
  return lines.join("\n");
}

/** HTML block appended to feature-day emails with copy-paste share copy. */
export function buildCreatorShareKitEmailHtml(params: {
  type: "artist" | "publisher";
  spotlightUrl: string;
  digestUrl: string;
  newsletterUrl: string;
  instagram?: string | null;
}): string {
  const role =
    params.type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const caption = buildCreatorShareKitInstagramCaption({
    displayName: "",
    type: params.type,
    spotlightUrl: params.spotlightUrl,
    newsletterUrl: params.newsletterUrl,
    instagram: params.instagram,
  });

  return `
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
  <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111;">Share kit</p>
  <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#444;">Your <strong>${role}</strong> feature is live. If you post this, people who like your work can subscribe for next week's Book of the Day picks:</p>
  <pre style="margin:0 0 16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:13px;line-height:1.5;white-space:pre-wrap;color:#111;">${escapeHtml(caption)}</pre>
  <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">Your spotlight page:<br/><a href="${escapeHtml(params.spotlightUrl)}">${escapeHtml(params.spotlightUrl)}</a></p>
  <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">This week's roundup:<br/><a href="${escapeHtml(params.digestUrl)}">${escapeHtml(params.digestUrl)}</a></p>
  <p style="margin:0;font-size:14px;line-height:1.5;color:#444;">Weekly Book of the Day email:<br/><a href="${escapeHtml(params.newsletterUrl)}">${escapeHtml(params.newsletterUrl)}</a></p>
  `;
}

/** Ready-made Instagram caption for BOTD artist or publisher on feature day. */
export function buildBotdShareKitInstagramCaption(params: {
  recipientType: "artist" | "publisher";
  bookTitle: string;
  artistName: string;
  spotlightUrl: string;
  newsletterUrl: string;
  instagram?: string | null;
}): string {
  const intro =
    params.recipientType === "artist"
      ? `My book "${params.bookTitle}" is Book of the Day on ${PHOTOBOOKERS_IG} today.`
      : `"${params.bookTitle}" by ${params.artistName} is Book of the Day on ${PHOTOBOOKERS_IG} today.`;
  const lines = [
    intro,
    "",
    "See the feature:",
    params.spotlightUrl,
    "",
    "Get next week's picks by email:",
    params.newsletterUrl,
  ];
  const handle = formatInstagramHandle(params.instagram);
  if (handle) lines.push("", handle);
  lines.push("", "#photobook #photobookjousting");
  return lines.join("\n");
}

/** HTML share kit block for BOTD feature-day emails. */
export function buildBotdShareKitEmailHtml(params: {
  recipientType: "artist" | "publisher";
  bookTitle: string;
  artistName: string;
  spotlightUrl: string;
  digestUrl: string;
  newsletterUrl: string;
  instagram?: string | null;
}): string {
  const caption = buildBotdShareKitInstagramCaption({
    recipientType: params.recipientType,
    bookTitle: params.bookTitle,
    artistName: params.artistName,
    spotlightUrl: params.spotlightUrl,
    newsletterUrl: params.newsletterUrl,
    instagram: params.instagram,
  });

  return `
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
  <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111;">Share kit</p>
  <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#444;">Your <strong>Book of the Day</strong> feature is live. If you post this, collectors can subscribe for next week's picks:</p>
  <pre style="margin:0 0 16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:13px;line-height:1.5;white-space:pre-wrap;color:#111;">${escapeHtml(caption)}</pre>
  <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">Book of the Day page:<br/><a href="${escapeHtml(params.spotlightUrl)}">${escapeHtml(params.spotlightUrl)}</a></p>
  <p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:#444;">This week's roundup:<br/><a href="${escapeHtml(params.digestUrl)}">${escapeHtml(params.digestUrl)}</a></p>
  <p style="margin:0;font-size:14px;line-height:1.5;color:#444;">Weekly Book of the Day email:<br/><a href="${escapeHtml(params.newsletterUrl)}">${escapeHtml(params.newsletterUrl)}</a></p>
  `;
}
