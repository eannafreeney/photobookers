import { sendAdminEmail } from "../../../lib/sendEmail";
import { err, ok, type Result } from "../../../lib/result";
import { buildInstagramCancelUrl } from "../../../lib/adminActionToken";
import {
  buildTrendingInstagramPreviewEmail,
  type InstagramPreviewEmailPost,
} from "../../../features/dashboard/admin/planner/emails";
import type {
  TrendingInstagramPostKind,
  TrendingInstagramState,
} from "../../../features/dashboard/admin/planner/newsletter/types";
import { buildTrendingInstagramDueAt } from "../trendingInstagram/schedule";

const TRENDING_KIND_TITLES: Record<TrendingInstagramPostKind, string> = {
  books: "Trending books",
  artists: "Trending artists",
  publishers: "Trending publishers",
};

export async function sendTrendingInstagramPreviewEmail(params: {
  campaignId: string;
  editionWeekStart: string;
  sendWednesday: Date;
  state: TrendingInstagramState;
  dryRun?: boolean;
}): Promise<Result<{ sent: boolean }, { reason: string }>> {
  const posts: InstagramPreviewEmailPost[] = [];

  for (const kind of ["books", "artists", "publishers"] as TrendingInstagramPostKind[]) {
    const post = params.state.posts[kind];
    if (!post?.imageUrls?.length || !post.caption || post.cancelledAt) continue;
    if (post.previewEmailSentAt) continue;

    posts.push({
      title: TRENDING_KIND_TITLES[kind],
      imageUrls: post.imageUrls.slice(0, 3),
      caption: post.caption,
      scheduledAt: buildTrendingInstagramDueAt(params.sendWednesday, kind),
      cancelUrl: buildInstagramCancelUrl({
        type: "trending",
        campaignId: params.campaignId,
        kind,
      }),
    });
  }

  if (posts.length === 0) return ok({ sent: false });

  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const html = buildTrendingInstagramPreviewEmail({
    editionWeekStart: params.editionWeekStart,
    posts,
    plannerUrl: `${siteUrl}/dashboard/admin/planner`,
  });
  const subject = `Trending Instagram preview — ${params.editionWeekStart}`;

  if (params.dryRun) return ok({ sent: true });

  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) return err(emailError);

  return ok({ sent: true });
}

export function markTrendingPreviewEmailSent(
  state: TrendingInstagramState,
  kinds: TrendingInstagramPostKind[],
): TrendingInstagramState {
  const now = new Date().toISOString();
  const posts = { ...state.posts };
  for (const kind of kinds) {
    const post = posts[kind];
    if (!post) continue;
    posts[kind] = { ...post, previewEmailSentAt: now };
  }
  return { ...state, posts };
}
