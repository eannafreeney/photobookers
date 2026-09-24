import { err, ok } from "../../../lib/result";

const MAX_PRINTERS = 3;

export function planQuotePrinters(printerIds: string[]) {
  const unique = [...new Set(printerIds.filter(Boolean))];
  if (unique.length < 1 || unique.length > MAX_PRINTERS) {
    return err({ reason: "Choose 1 to 3 printers" });
  }
  return ok(unique);
}

export function unpublishedPrinterIds(
  requestedIds: string[],
  publishedIds: string[],
) {
  const published = new Set(publishedIds);
  return requestedIds.filter((id) => !published.has(id));
}
