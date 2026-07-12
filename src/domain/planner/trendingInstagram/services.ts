import { desc, eq } from "drizzle-orm";
import { db } from "../../../db/client";
import { newsletterCampaigns } from "../../../db/schema";
import { err, ok, type Result } from "../../../lib/result";
import {
  normalizeStoredDate,
  toDateString,
} from "../../../lib/utils";
import {
  normalizeWeekStartDate,
} from "../../../features/dashboard/admin/planner/newsletter/services";
import type {
  TrendingInstagramPostKind,
  TrendingInstagramPostState,
  TrendingInstagramState,
  WeeklyNewsletterTrending,
} from "../../../features/dashboard/admin/planner/newsletter/types";
import {
  bufferCreateScheduledImagePost,
  bufferPostExists,
} from "../../../features/dashboard/admin/planner/social-media/buffer";
import { scheduleInstagramDueAt } from "../../../features/dashboard/admin/planner/social-media/instagramUtils";
import { uploadImageFromBuffer } from "../../../services/storage";
import { getTrendingForRange } from "../trending";
import {
  buildTrendingInstagramDueAt,
  getCompletedNewsletterEditionRange,
} from "./schedule";
import {
  buildTrendingInstagramCaptions,
  buildTrendingInstagramFirstComment,
  trendingItemsForKind,
  trendingPostHasContent,
} from "./captions";
import { renderTrendingCarouselSlides } from "./renderTrendingSlide";

const TRENDING_POST_KINDS: TrendingInstagramPostKind[] = [
  "books",
  "artists",
  "publishers",
];

async function findNewsletterCampaignByEditionStart(weekStart: Date) {
  const targetKey = toDateString(normalizeWeekStartDate(weekStart));
  const rows = await db.query.newsletterCampaigns.findMany({
    orderBy: [desc(newsletterCampaigns.weekStart)],
    limit: 64,
  });
  return (
    rows.find(
      (row) =>
        toDateString(normalizeStoredDate(row.weekStart)) === targetKey,
    ) ?? null
  );
}

async function saveTrendingInstagramState(
  campaignId: string,
  existingContent: typeof newsletterCampaigns.$inferSelect.generatedContent,
  state: TrendingInstagramState,
): Promise<Result<void, { reason: string }>> {
  try {
    await db
      .update(newsletterCampaigns)
      .set({
        generatedContent: {
          ...(existingContent ?? { generatedAt: new Date().toISOString() }),
          trendingInstagram: state,
        },
        updatedAt: new Date(),
      })
      .where(eq(newsletterCampaigns.id, campaignId));
    return ok(undefined);
  } catch (error) {
    console.error("saveTrendingInstagramState", error);
    return err({ reason: "Failed to save trending Instagram state" });
  }
}

async function resolveTrendingData(
  campaign: typeof newsletterCampaigns.$inferSelect,
  edition: { weekStart: Date; weekEnd: Date },
): Promise<WeeklyNewsletterTrending> {
  const stored = campaign.generatedContent?.trending;
  if (stored?.books?.length || stored?.artists?.length || stored?.publishers?.length) {
    return stored;
  }
  return getTrendingForRange(edition.weekStart, edition.weekEnd);
}

async function uploadTrendingSlides(
  kind: TrendingInstagramPostKind,
  editionWeekStart: string,
  slides: Buffer[],
): Promise<Result<string[], { reason: string }>> {
  const urls: string[] = [];
  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    if (!slide) continue;
    try {
      const uploaded = await uploadImageFromBuffer(
        slide,
        `social/trending/${editionWeekStart}/${kind}`,
      );
      urls.push(uploaded.url);
    } catch (error) {
      console.error("uploadTrendingSlides", error);
      return err({ reason: `Failed to upload ${kind} slide ${index + 1}` });
    }
  }
  if (urls.length === 0) {
    return err({ reason: `No ${kind} slides to upload` });
  }
  return ok(urls);
}

export type PrepareTrendingInstagramOptions = {
  dryRun?: boolean;
  referenceDate?: Date;
  force?: boolean;
};

export type PrepareTrendingInstagramResult = {
  campaignId: string | null;
  editionWeekStart: string;
  prepared: TrendingInstagramPostKind[];
  skipped: string[];
};

export async function prepareTrendingInstagramPosts(
  options: PrepareTrendingInstagramOptions = {},
): Promise<Result<PrepareTrendingInstagramResult, { reason: string }>> {
  const edition = getCompletedNewsletterEditionRange(options.referenceDate);
  const editionWeekStart = toDateString(edition.weekStart);
  const campaign = await findNewsletterCampaignByEditionStart(edition.weekStart);
  if (!campaign) {
    return err({
      reason: `No newsletter campaign found for edition starting ${editionWeekStart}`,
    });
  }

  const trending = await resolveTrendingData(campaign, edition);
  const captions = buildTrendingInstagramCaptions(trending);
  const existingState = campaign.generatedContent?.trendingInstagram;
  const posts: Partial<
    Record<TrendingInstagramPostKind, TrendingInstagramPostState>
  > = { ...(existingState?.posts ?? {}) };
  const prepared: TrendingInstagramPostKind[] = [];
  const skipped: string[] = [];

  for (const kind of TRENDING_POST_KINDS) {
    if (!trendingPostHasContent(kind, trending)) {
      skipped.push(`${kind}: no trending items`);
      continue;
    }

    const existingPost = posts[kind];
    if (
      !options.force &&
      existingPost?.imageUrls?.length &&
      existingPost.caption
    ) {
      skipped.push(`${kind}: already prepared`);
      continue;
    }

    const items = trendingItemsForKind(kind, trending);
    const slides = await renderTrendingCarouselSlides(kind, items);
    if (options.dryRun) {
      prepared.push(kind);
      posts[kind] = {
        imageUrls: slides.map(
          (_, index) => `dry-run://${editionWeekStart}/${kind}/${index + 1}`,
        ),
        caption: captions[kind],
      };
      continue;
    }

    const [uploadError, imageUrls] = await uploadTrendingSlides(
      kind,
      editionWeekStart,
      slides,
    );
    if (uploadError) {
      skipped.push(`${kind}: ${uploadError.reason}`);
      continue;
    }

    posts[kind] = {
      imageUrls,
      caption: captions[kind],
      error: null,
    };
    prepared.push(kind);
  }

  if (options.dryRun) {
    return ok({
      campaignId: campaign.id,
      editionWeekStart,
      prepared,
      skipped,
    });
  }

  const nextState: TrendingInstagramState = {
    preparedAt: new Date().toISOString(),
    editionWeekStart,
    posts,
  };
  const [saveError] = await saveTrendingInstagramState(
    campaign.id,
    campaign.generatedContent,
    nextState,
  );
  if (saveError) return err(saveError);

  return ok({
    campaignId: campaign.id,
    editionWeekStart,
    prepared,
    skipped,
  });
}

export type QueueTrendingInstagramOptions = {
  dryRun?: boolean;
  referenceDate?: Date;
  force?: boolean;
};

export type QueueTrendingInstagramResult = {
  campaignId: string | null;
  editionWeekStart: string;
  queued: Array<{ kind: TrendingInstagramPostKind; postId: string }>;
  skipped: string[];
};

async function resolveQueuedTrendingPost(
  postId: string,
): Promise<"skip" | "requeue" | "unknown"> {
  const [error, exists] = await bufferPostExists(postId);
  if (error) return "unknown";
  return exists ? "skip" : "requeue";
}

export async function queueTrendingInstagramPosts(
  options: QueueTrendingInstagramOptions = {},
): Promise<Result<QueueTrendingInstagramResult, { reason: string }>> {
  const edition = getCompletedNewsletterEditionRange(options.referenceDate);
  const editionWeekStart = toDateString(edition.weekStart);
  let campaign = await findNewsletterCampaignByEditionStart(edition.weekStart);
  if (!campaign) {
    return err({
      reason: `No newsletter campaign found for edition starting ${editionWeekStart}`,
    });
  }

  let state = campaign.generatedContent?.trendingInstagram;
  if (!state?.posts || Object.keys(state.posts).length === 0) {
    const [prepareError, prepareResult] = await prepareTrendingInstagramPosts({
      referenceDate: options.referenceDate,
      force: options.force,
    });
    if (prepareError) return err(prepareError);
    if (prepareResult.prepared.length === 0) {
      return ok({
        campaignId: campaign.id,
        editionWeekStart,
        queued: [],
        skipped: prepareResult.skipped,
      });
    }

    const refreshed = await findNewsletterCampaignByEditionStart(edition.weekStart);
    if (!refreshed) {
      return err({
        reason: `No newsletter campaign found for edition starting ${editionWeekStart}`,
      });
    }
    campaign = refreshed;
    state = campaign.generatedContent?.trendingInstagram;
    if (!state?.posts || Object.keys(state.posts).length === 0) {
      return err({ reason: "Trending Instagram posts are not prepared" });
    }
  }

  const trending = await resolveTrendingData(campaign, edition);
  const posts = { ...state.posts };
  const queued: QueueTrendingInstagramResult["queued"] = [];
  const skipped: string[] = [];

  for (const kind of TRENDING_POST_KINDS) {
    const post = posts[kind];
    if (!post?.imageUrls?.length || !post.caption) {
      skipped.push(`${kind}: not prepared`);
      continue;
    }

    if (
      !options.force &&
      post.queuedAt &&
      post.bufferPostId &&
      !post.bufferPostId.startsWith("dry-run://")
    ) {
      const action = await resolveQueuedTrendingPost(post.bufferPostId);
      if (action === "skip" || action === "unknown") {
        skipped.push(`${kind}: already queued`);
        continue;
      }
      posts[kind] = {
        ...post,
        bufferPostId: null,
        queuedAt: null,
        error: null,
      };
    }

    const dueAt = scheduleInstagramDueAt(
      buildTrendingInstagramDueAt(edition.sendWednesday, kind),
    );

    if (options.dryRun) {
      queued.push({ kind, postId: `dry-run-${kind}` });
      continue;
    }

    const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
      text: post.caption,
      imageUrls: post.imageUrls,
      dueAt,
      firstComment: buildTrendingInstagramFirstComment(kind, trending),
    });

    if (bufferError) {
      posts[kind] = { ...post, error: bufferError.reason };
      skipped.push(`${kind}: ${bufferError.reason}`);
      continue;
    }

    posts[kind] = {
      ...post,
      bufferPostId: bufferData.postId,
      queuedAt: new Date().toISOString(),
      error: null,
    };
    queued.push({ kind, postId: bufferData.postId });
  }

  if (!options.dryRun) {
    const [saveError] = await saveTrendingInstagramState(
      campaign.id,
      campaign.generatedContent,
      {
        ...state,
        editionWeekStart,
        posts,
      },
    );
    if (saveError) return err(saveError);
  }

  return ok({
    campaignId: campaign.id,
    editionWeekStart,
    queued,
    skipped,
  });
}

export async function runTrendingInstagramForEdition(
  options: PrepareTrendingInstagramOptions & QueueTrendingInstagramOptions = {},
): Promise<
  Result<
    PrepareTrendingInstagramResult & QueueTrendingInstagramResult,
    { reason: string }
  >
> {
  const [prepareError, prepared] = await prepareTrendingInstagramPosts(options);
  if (prepareError) return err(prepareError);

  const [queueError, queued] = await queueTrendingInstagramPosts(options);
  if (queueError) return err(queueError);

  return ok({
    campaignId: prepared.campaignId,
    editionWeekStart: prepared.editionWeekStart,
    prepared: prepared.prepared,
    skipped: [...prepared.skipped, ...queued.skipped],
    queued: queued.queued,
  });
}

export {
  getCompletedNewsletterEditionRange,
  buildTrendingInstagramDueAt,
  isTrendingInstagramRunDay,
  parseTrendingInstagramReferenceDate,
} from "./schedule";
