import type { InstagramPost } from "../../lib/instagram-graph";

export function postsInLastDays(
  posts: InstagramPost[],
  days: number,
  asOf: Date = new Date(),
): InstagramPost[] {
  const cutoff = asOf.getTime() - days * 24 * 60 * 60 * 1000;
  return posts.filter((p) => new Date(p.timestamp).getTime() >= cutoff);
}

export function avgEngagement(posts: InstagramPost[]): number {
  if (!posts.length) return 0;
  return (
    posts.reduce((sum, p) => sum + p.insights.engagement, 0) / posts.length
  );
}

export function avgReach(posts: InstagramPost[]): number {
  if (!posts.length) return 0;
  return Math.round(
    posts.reduce((sum, p) => sum + p.insights.reach, 0) / posts.length,
  );
}

export function topByEngagement(posts: InstagramPost[], n = 3): InstagramPost[] {
  return [...posts]
    .sort((a, b) => b.insights.engagement - a.insights.engagement)
    .slice(0, n);
}

/** Minimal markdown → email HTML (bold, headings, paragraphs). */
export function insightsToEmailHtml(markdown: string): string {
  const escaped = markdown
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  const withInline = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, '<h3 style="margin:16px 0 8px;font-size:15px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="margin:20px 0 8px;font-size:17px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:20px 0 8px;font-size:17px;">$1</h2>');

  return withInline
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h")) return trimmed.replaceAll("\n", "<br>");
      return `<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#191613;">${trimmed.replaceAll("\n", "<br>")}</p>`;
    })
    .join("");
}
