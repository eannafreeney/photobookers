function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function printerIntroEmailSubject() {
  return "Your printer page on Photobookers";
}

export function printerIntroEmailHtml(input: {
  name: string;
  profileUrl: string;
  /** When the printers directory is still private, say so next to the link. */
  profileIsPublic: boolean;
}) {
  const name = escapeHtml(input.name);
  const profileUrl = escapeHtml(input.profileUrl);
  const profileLine = input.profileIsPublic
    ? `<p>Your page is here: <a href="${profileUrl}">${profileUrl}</a></p>`
    : `<p>Your page will be here: <a href="${profileUrl}">${profileUrl}</a>. It is not public yet.</p>`;

  return [
    `<p>Hi ${name},</p>`,
    `<p>Photobookers is a site for discovering photobooks, and the artists and publishers behind them.</p>`,
    `<p>We are adding a small directory of printers recommended directly by our community. Creators will be able to submit quote requests through the site.</p>`,
    profileLine,
    `<p>If your banner image, email address or description should change, reply and we will update it.</p>`,
    `<p>If you have photos that show off your photobook work, send them along (max 5) and we will add them to your page.</p>`,
    `<p>If you printed a book that is already on Photobookers, tell us which one. We will link it on your page as social proof.</p>`,
    `<p>If you prefer to be taken off this list, reply and we will remove you.</p>`,

    `<p>Best regards,<br/>Eanna</p>`,
  ].join("");
}
