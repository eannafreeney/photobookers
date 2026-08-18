import type { InstagramAccountInsights, InstagramPost } from "../../lib/instagram-graph";
import {
  avgEngagement,
  avgReach,
  insightsToEmailHtml,
  topByEngagement,
} from "./stats";

const SITE_URL = process.env.SITE_URL ?? "https://photobookers.com";
const ANALYTICS_URL = `${SITE_URL}/dashboard/admin/analytics?tab=instagram`;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function captionPreview(post: InstagramPost): string {
  const raw = post.caption?.trim() || "(no caption)";
  return raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;
}

export function instagramWeeklyDigestSubject(weekLabel: string): string {
  return `Instagram weekly digest — ${weekLabel}`;
}

export function buildInstagramWeeklyDigestEmail(params: {
  weekLabel: string;
  account: InstagramAccountInsights;
  weekPosts: InstagramPost[];
  insightsMarkdown: string;
}): string {
  const { weekLabel, account, weekPosts, insightsMarkdown } = params;
  const top = topByEngagement(weekPosts, 3);
  const topRows = top
    .map(
      (p) => `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #e8e4df;font-size:13px;">
        <a href="${escapeHtml(p.permalink)}" style="color:#191613;text-decoration:underline;">${escapeHtml(captionPreview(p))}</a>
        <div style="color:#5c574f;margin-top:4px;">
          ${p.timestamp.slice(0, 10)} · ${p.like_count} likes · ${p.insights.reach.toLocaleString()} reach · ${p.insights.engagement}% eng
        </div>
      </td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f3ef;font-family:Georgia,serif;color:#191613;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e4df;border-radius:8px;padding:24px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a5a44;">Instagram</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:500;">Weekly digest</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#5c574f;">${escapeHtml(weekLabel)} · ${weekPosts.length} posts in window</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#5c574f;">Followers</td>
        <td style="padding:8px 0;font-size:16px;font-weight:600;">${account.followers_count.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#5c574f;">Avg engagement</td>
        <td style="padding:8px 0;font-size:16px;font-weight:600;">${avgEngagement(weekPosts).toFixed(1)}%</td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#5c574f;">Avg reach</td>
        <td style="padding:8px 0;font-size:16px;font-weight:600;">${avgReach(weekPosts).toLocaleString()}</td>
      </tr>
    </table>

    ${
      top.length
        ? `<p style="margin:0 0 8px;font-size:13px;font-weight:600;">Top posts this week</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">${topRows}</table>`
        : `<p style="margin:0 0 24px;font-size:14px;color:#5c574f;">No posts in the last 7 days — ideas below are based on your recent feed.</p>`
    }

    <p style="margin:0 0 8px;font-size:13px;font-weight:600;">Analysis &amp; post ideas</p>
    <div style="margin-bottom:24px;">
      ${insightsToEmailHtml(insightsMarkdown)}
    </div>

    <p style="margin:0;">
      <a href="${ANALYTICS_URL}" style="display:inline-block;padding:10px 16px;background:#191613;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;">Open Instagram analytics</a>
    </p>
  </div>
</body>
</html>`;
}
