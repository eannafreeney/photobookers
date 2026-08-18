import { resolveSpotlightStoryImageUrl } from "../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
import { uploadImageFromBuffer } from "../../../services/storage.js";
import {
  renderBotdStoryBlurred,
  renderBotdStoryFullBleed
} from "./renderBotdStorySlide.js";
function previewKeyForItem(item) {
  return item.kind === "botd" ? `botd-${item.date.toISOString().slice(0, 10)}` : item.kind;
}
function storyLabelForItem(item) {
  switch (item.kind) {
    case "botd":
      return "BOOK OF THE DAY";
    case "artist":
      return "ARTIST OF THE WEEK";
    case "publisher":
      return "PUBLISHER OF THE WEEK";
  }
}
function storyMetaForItem(item) {
  if (item.kind === "botd") {
    return {
      title: item.title,
      artistName: item.artistName,
      publisherName: item.publisherName,
      label: storyLabelForItem(item)
    };
  }
  return {
    title: item.title,
    label: storyLabelForItem(item)
  };
}
async function buildSpotlightStoryPreviewUrl(item, weekKey) {
  const sourceUrl = resolveSpotlightStoryImageUrl(item);
  if (!sourceUrl) return null;
  const meta = storyMetaForItem(item);
  const buffer = item.artistProvidedStoryImageUrl ? await renderBotdStoryFullBleed(sourceUrl, meta) : await renderBotdStoryBlurred(sourceUrl, meta);
  const uploaded = await uploadImageFromBuffer(
    buffer,
    `social/preview/planner/${weekKey}/${previewKeyForItem(item)}/story`
  );
  return uploaded.url;
}
async function buildPlannerWeekStoryPreviewUrls(items, weekKey) {
  const previews = /* @__PURE__ */ new Map();
  for (const item of items) {
    const url = await buildSpotlightStoryPreviewUrl(item, weekKey);
    previews.set(previewKeyForItem(item), url ? [url] : []);
  }
  return previews;
}
function previewKeyForSpotlightItem(item) {
  return previewKeyForItem(item);
}
export {
  buildPlannerWeekStoryPreviewUrls,
  buildSpotlightStoryPreviewUrl,
  previewKeyForSpotlightItem
};
