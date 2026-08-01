import type { WatchedProduct } from "./watchlist";

export type PublisherNewReleases = {
  publisherId: string;
  publisherName: string;
  products: WatchedProduct[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function publisherReleaseWatchEmailSubject(
  newCount: number,
  publisherCount: number,
): string {
  return `Publisher new releases — ${newCount} new across ${publisherCount} publisher${publisherCount === 1 ? "" : "s"}`;
}

export function buildPublisherReleaseWatchEmail(
  groups: PublisherNewReleases[],
): string {
  const sections = groups
    .map((group) => {
      const items = group.products
        .map(
          (p) =>
            `<li style="margin-bottom:6px;"><a href="${escapeHtml(p.url)}" style="color:#8a5a44;text-decoration:none;">${escapeHtml(p.title)}</a></li>`,
        )
        .join("");
      return `<div style="margin-bottom:24px;">
  <h2 style="margin:0 0 8px;font-size:16px;color:#191613;">${escapeHtml(group.publisherName)}</h2>
  <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.5;">${items}</ul>
</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#faf8f5;color:#191613;">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:24px;border:1px solid #e8e4df;">
    <h1 style="margin:0 0 8px;font-size:20px;">New publisher releases</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#5c574f;">Products not seen in last week's scrape.</p>
    ${sections}
  </div>
</body>
</html>`;
}
