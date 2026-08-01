import {
  prepareSpotlightFeedImageUrls
} from "./renderSpotlightLeadSlide.js";
import { uploadImageFromBuffer } from "../../../services/storage.js";
function spotlightLabelForItem(item) {
  switch (item.kind) {
    case "botd":
      return "Book of the Day";
    case "artist":
      return "Artist of the Week";
    case "publisher":
      return "Publisher of the Week";
  }
}
function previewKeyForItem(item) {
  return item.kind === "botd" ? `botd-${item.date.toISOString().slice(0, 10)}` : item.kind;
}
async function buildSpotlightFeedPreviewUrls(item, weekKey) {
  const sourceUrls = item.instagramImageUrls.slice(0, 3);
  if (sourceUrls.length === 0) return [];
  return prepareSpotlightFeedImageUrls(
    sourceUrls,
    spotlightLabelForItem(item),
    {
      upload: async (buffer, folder) => {
        const uploaded = await uploadImageFromBuffer(buffer, folder);
        return uploaded.url;
      },
      uploadFolder: `social/preview/planner/${weekKey}/${previewKeyForItem(item)}/feed`,
      meta: { title: item.title }
    }
  );
}
async function buildPlannerWeekFeedPreviewUrls(items, weekKey) {
  const previews = /* @__PURE__ */ new Map();
  for (const item of items) {
    previews.set(
      previewKeyForItem(item),
      await buildSpotlightFeedPreviewUrls(item, weekKey)
    );
  }
  return previews;
}
function previewKeyForSpotlightItem(item) {
  return previewKeyForItem(item);
}
export {
  buildPlannerWeekFeedPreviewUrls,
  buildSpotlightFeedPreviewUrls,
  previewKeyForSpotlightItem
};
