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
  copies: number;
  pageCount: number;
  trimSize: string;
  binding: string;
  deadline: string;
  shipToCountry: string;
  referenceBooks?: string | null;
  message?: string | null;
};

export function quoteRequestEmailHtml(input: QuoteEmailInput) {
  const row = (label: string, value: string) =>
    `<p><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value)}</p>`;

  return [
    `<p>${escapeHtml(input.personName)} asked for a print quote on Photobookers.</p>`,
    row("Reply to", `${input.personName} <${input.personEmail}>`),
    row("Copies", String(input.copies)),
    row("Pages", String(input.pageCount)),
    row("Trim size", input.trimSize),
    row("Binding", input.binding),
    row("Deadline", input.deadline),
    row("Ship to", input.shipToCountry),
    input.referenceBooks
      ? row("Books it should feel like", input.referenceBooks)
      : "",
    input.message ? row("Note", input.message) : "",
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
