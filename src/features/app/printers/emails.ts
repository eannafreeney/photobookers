function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type QuoteEmailInput = {
  printerName: string;
  personName: string;
  personEmail: string;
  projectName: string;
  details: string;
  shipToCountry: string;
  note?: string | null;
};

export function quoteRequestEmailHtml(input: QuoteEmailInput) {
  const row = (label: string, value: string) =>
    `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value)}</p>`;

  return [
    `<p>${escapeHtml(input.personName)} asked for a print quote on Photobookers.</p>`,
    row("Reply to", `${input.personName} <${input.personEmail}>`),
    row("Project name", input.projectName),
    row("Details", input.details),
    row("Ships to", input.shipToCountry),
    input.note ? row("Note", input.note) : "",
    `<p>Reply directly to ${escapeHtml(input.personEmail)}. Photobookers is not part of the invoice.</p>`,
  ].join("");
}

export function personDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
}
