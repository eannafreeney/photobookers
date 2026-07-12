import {
  prepareSpotlightFeedImageUrls,
  type SpotlightLeadLabel,
} from "./renderSpotlightLeadSlide";
import type { SpotlightContentItem } from "../../../features/dashboard/admin/planner/spotlightBlurb";
import { uploadImageFromBuffer } from "../../../services/storage";

function spotlightLabelForItem(item: SpotlightContentItem): SpotlightLeadLabel {
  switch (item.kind) {
    case "botd":
      return "Book of the Day";
    case "artist":
      return "Artist of the Week";
    case "publisher":
      return "Publisher of the Week";
  }
}

function previewKeyForItem(item: SpotlightContentItem): string {
  return item.kind === "botd" ? `botd-${item.date.toISOString().slice(0, 10)}` : item.kind;
}

export async function buildSpotlightFeedPreviewUrls(
  item: SpotlightContentItem,
  weekKey: string,
): Promise<string[]> {
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
      meta: { title: item.title },
    },
  );
}

export async function buildPlannerWeekFeedPreviewUrls(
  items: SpotlightContentItem[],
  weekKey: string,
): Promise<Map<string, string[]>> {
  const previews = new Map<string, string[]>();
  for (const item of items) {
    previews.set(
      previewKeyForItem(item),
      await buildSpotlightFeedPreviewUrls(item, weekKey),
    );
  }
  return previews;
}

export function previewKeyForSpotlightItem(item: SpotlightContentItem): string {
  return previewKeyForItem(item);
}
