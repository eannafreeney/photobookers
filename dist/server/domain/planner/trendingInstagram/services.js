import { desc, eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { newsletterCampaigns } from "../../../db/schema.js";
import { err, ok } from "../../../lib/result.js";
import {
  normalizeStoredDate,
  toDateString
} from "../../../lib/utils.js";
import {
  normalizeWeekStartDate
} from "../../../features/dashboard/admin/newsletters/services.js";
import {
  bufferCreateScheduledImagePost,
  bufferPostExists
} from "../../../features/dashboard/admin/planner/social-media/buffer.js";
import { scheduleInstagramDueAt } from "../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
import { uploadImageFromBuffer } from "../../../services/storage.js";
import { getTrendingForRange } from "../trending.js";
import {
  buildTrendingInstagramDueAt,
  getCompletedNewsletterEditionRange
} from "./schedule.js";
import {
  buildTrendingInstagramCaptions,
  buildTrendingInstagramFirstComment,
  trendingItemsForKind,
  trendingPostHasContent
} from "./captions.js";
import { renderTrendingCarouselSlides } from "./renderTrendingSlide.js";
import {
  markTrendingPreviewEmailSent,
  sendTrendingInstagramPreviewEmail
} from "../cron/trendingInstagramPreviewEmailServices.js";
const TRENDING_POST_KINDS = [
  "books",
  "artists",
  "publishers"
];
async function findNewsletterCampaignByEditionStart(weekStart) {
  const targetKey = toDateString(normalizeWeekStartDate(weekStart));
  const rows = await db.query.newsletterCampaigns.findMany({
    orderBy: [desc(newsletterCampaigns.weekStart)],
    limit: 64
  });
  return rows.find(
    (row) => toDateString(normalizeStoredDate(row.weekStart)) === targetKey
  ) ?? null;
}
async function saveTrendingInstagramState(campaignId, existingContent, state) {
  try {
    await db.update(newsletterCampaigns).set({
      generatedContent: {
        ...existingContent ?? { generatedAt: (/* @__PURE__ */ new Date()).toISOString() },
        trendingInstagram: state
      },
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(newsletterCampaigns.id, campaignId));
    return ok(void 0);
  } catch (error) {
    console.error("saveTrendingInstagramState", error);
    return err({ reason: "Failed to save trending Instagram state" });
  }
}
async function resolveTrendingData(campaign, edition) {
  const stored = campaign.generatedContent?.trending;
  if (stored?.books?.length || stored?.artists?.length || stored?.publishers?.length) {
    return stored;
  }
  return getTrendingForRange(edition.weekStart, edition.weekEnd);
}
async function uploadTrendingSlides(kind, editionWeekStart, slides) {
  const urls = [];
  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    if (!slide) continue;
    try {
      const uploaded = await uploadImageFromBuffer(
        slide,
        `social/trending/${editionWeekStart}/${kind}`
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
async function prepareTrendingInstagramPosts(options = {}) {
  const edition = getCompletedNewsletterEditionRange(options.referenceDate);
  const editionWeekStart = toDateString(edition.weekStart);
  const campaign = await findNewsletterCampaignByEditionStart(edition.weekStart);
  if (!campaign) {
    return err({
      reason: `No newsletter campaign found for edition starting ${editionWeekStart}`
    });
  }
  const trending = await resolveTrendingData(campaign, edition);
  const captions = buildTrendingInstagramCaptions(trending);
  const existingState = campaign.generatedContent?.trendingInstagram;
  const posts = { ...existingState?.posts ?? {} };
  const prepared = [];
  const skipped = [];
  for (const kind of TRENDING_POST_KINDS) {
    if (!trendingPostHasContent(kind, trending)) {
      skipped.push(`${kind}: no trending items`);
      continue;
    }
    const existingPost = posts[kind];
    if (!options.force && existingPost?.imageUrls?.length && existingPost.caption) {
      skipped.push(`${kind}: already prepared`);
      continue;
    }
    const items = trendingItemsForKind(kind, trending);
    const slides = await renderTrendingCarouselSlides(kind, items);
    if (options.dryRun) {
      prepared.push(kind);
      posts[kind] = {
        imageUrls: slides.map(
          (_, index) => `dry-run://${editionWeekStart}/${kind}/${index + 1}`
        ),
        caption: captions[kind]
      };
      continue;
    }
    const [uploadError, imageUrls] = await uploadTrendingSlides(
      kind,
      editionWeekStart,
      slides
    );
    if (uploadError) {
      skipped.push(`${kind}: ${uploadError.reason}`);
      continue;
    }
    posts[kind] = {
      imageUrls,
      caption: captions[kind],
      error: null
    };
    prepared.push(kind);
  }
  if (options.dryRun) {
    return ok({
      campaignId: campaign.id,
      editionWeekStart,
      prepared,
      skipped
    });
  }
  const nextState = {
    preparedAt: (/* @__PURE__ */ new Date()).toISOString(),
    editionWeekStart,
    posts
  };
  const [saveError] = await saveTrendingInstagramState(
    campaign.id,
    campaign.generatedContent,
    nextState
  );
  if (saveError) return err(saveError);
  return ok({
    campaignId: campaign.id,
    editionWeekStart,
    prepared,
    skipped
  });
}
async function resolveQueuedTrendingPost(postId) {
  const [error, exists] = await bufferPostExists(postId);
  if (error) return "unknown";
  return exists ? "skip" : "requeue";
}
async function queueTrendingInstagramPosts(options = {}) {
  const edition = getCompletedNewsletterEditionRange(options.referenceDate);
  const editionWeekStart = toDateString(edition.weekStart);
  let campaign = await findNewsletterCampaignByEditionStart(edition.weekStart);
  if (!campaign) {
    return err({
      reason: `No newsletter campaign found for edition starting ${editionWeekStart}`
    });
  }
  let state = campaign.generatedContent?.trendingInstagram;
  if (!state?.posts || Object.keys(state.posts).length === 0) {
    const [prepareError, prepareResult] = await prepareTrendingInstagramPosts({
      referenceDate: options.referenceDate,
      force: options.force
    });
    if (prepareError) return err(prepareError);
    if (prepareResult.prepared.length === 0) {
      return ok({
        campaignId: campaign.id,
        editionWeekStart,
        queued: [],
        skipped: prepareResult.skipped
      });
    }
    const refreshed = await findNewsletterCampaignByEditionStart(edition.weekStart);
    if (!refreshed) {
      return err({
        reason: `No newsletter campaign found for edition starting ${editionWeekStart}`
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
  const queued = [];
  const skipped = [];
  for (const kind of TRENDING_POST_KINDS) {
    const post = posts[kind];
    if (!post?.imageUrls?.length || !post.caption) {
      skipped.push(`${kind}: not prepared`);
      continue;
    }
    if (post.cancelledAt) {
      skipped.push(`${kind}: cancelled`);
      continue;
    }
    if (!options.force && post.queuedAt && post.bufferPostId && !post.bufferPostId.startsWith("dry-run://")) {
      const action = await resolveQueuedTrendingPost(post.bufferPostId);
      if (action === "skip" || action === "unknown") {
        skipped.push(`${kind}: already queued`);
        continue;
      }
      posts[kind] = {
        ...post,
        bufferPostId: null,
        queuedAt: null,
        error: null
      };
    }
    const dueAt = scheduleInstagramDueAt(
      buildTrendingInstagramDueAt(edition.sendWednesday, kind)
    );
    if (options.dryRun) {
      queued.push({ kind, postId: `dry-run-${kind}` });
      continue;
    }
    const [bufferError, bufferData] = await bufferCreateScheduledImagePost({
      text: post.caption,
      imageUrls: post.imageUrls,
      dueAt,
      firstComment: buildTrendingInstagramFirstComment(kind, trending)
    });
    if (bufferError) {
      posts[kind] = { ...post, error: bufferError.reason };
      skipped.push(`${kind}: ${bufferError.reason}`);
      continue;
    }
    posts[kind] = {
      ...post,
      bufferPostId: bufferData.postId,
      queuedAt: (/* @__PURE__ */ new Date()).toISOString(),
      error: null
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
        posts
      }
    );
    if (saveError) return err(saveError);
  }
  return ok({
    campaignId: campaign.id,
    editionWeekStart,
    queued,
    skipped
  });
}
async function sendTrendingInstagramPreviewForEdition(options = {}) {
  const edition = getCompletedNewsletterEditionRange(options.referenceDate);
  const editionWeekStart = toDateString(edition.weekStart);
  const campaign = await findNewsletterCampaignByEditionStart(edition.weekStart);
  if (!campaign) {
    return err({
      reason: `No newsletter campaign found for edition starting ${editionWeekStart}`
    });
  }
  const rawState = campaign.generatedContent?.trendingInstagram;
  if (!rawState?.posts || Object.keys(rawState.posts).length === 0) {
    return ok({ sent: false });
  }
  const state = {
    preparedAt: rawState.preparedAt,
    editionWeekStart: rawState.editionWeekStart,
    posts: rawState.posts
  };
  const [emailError, emailResult] = await sendTrendingInstagramPreviewEmail({
    campaignId: campaign.id,
    editionWeekStart,
    sendWednesday: edition.sendWednesday,
    state,
    dryRun: options.dryRun
  });
  if (emailError) return err(emailError);
  if (!emailResult.sent || options.dryRun) return ok(emailResult);
  const kindsToMark = ["books", "artists", "publishers"].filter(
    (kind) => {
      const post = state.posts[kind];
      return post?.imageUrls?.length && post.caption && !post.cancelledAt;
    }
  );
  const nextState = markTrendingPreviewEmailSent(state, kindsToMark);
  const [saveError] = await saveTrendingInstagramState(
    campaign.id,
    campaign.generatedContent,
    nextState
  );
  if (saveError) return err(saveError);
  return ok(emailResult);
}
async function runTrendingInstagramForEdition(options = {}) {
  const [prepareError, prepared] = await prepareTrendingInstagramPosts(options);
  if (prepareError) return err(prepareError);
  const [queueError, queued] = await queueTrendingInstagramPosts(options);
  if (queueError) return err(queueError);
  const [previewError] = await sendTrendingInstagramPreviewForEdition(options);
  if (previewError) return err(previewError);
  return ok({
    campaignId: prepared.campaignId,
    editionWeekStart: prepared.editionWeekStart,
    prepared: prepared.prepared,
    skipped: [...prepared.skipped, ...queued.skipped],
    queued: queued.queued
  });
}
import {
  getCompletedNewsletterEditionRange as getCompletedNewsletterEditionRange2,
  buildTrendingInstagramDueAt as buildTrendingInstagramDueAt2,
  isTrendingInstagramRunDay,
  parseTrendingInstagramReferenceDate
} from "./schedule.js";
export {
  buildTrendingInstagramDueAt2 as buildTrendingInstagramDueAt,
  getCompletedNewsletterEditionRange2 as getCompletedNewsletterEditionRange,
  isTrendingInstagramRunDay,
  parseTrendingInstagramReferenceDate,
  prepareTrendingInstagramPosts,
  queueTrendingInstagramPosts,
  runTrendingInstagramForEdition,
  sendTrendingInstagramPreviewForEdition
};
