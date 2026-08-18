import type { SpotlightContentItem } from "../../../features/dashboard/admin/planner/spotlightBlurb";
import { resolveSpotlightStoryImageUrl } from "../../../features/dashboard/admin/planner/social-media/instagramUtils";
import { uploadImageFromBuffer } from "../../../services/storage";
import {
  renderBotdStoryBlurred,
  renderBotdStoryFullBleed,
  type BotdStorySlideMeta,
} from "./renderBotdStorySlide";

function previewKeyForItem(item: SpotlightContentItem): string {
  return item.kind === "botd"
    ? `botd-${item.date.toISOString().slice(0, 10)}`
    : item.kind;
}

function storyLabelForItem(item: SpotlightContentItem): string {
  switch (item.kind) {
    case "botd":
      return "BOOK OF THE DAY";
    case "artist":
      return "ARTIST OF THE WEEK";
    case "publisher":
      return "PUBLISHER OF THE WEEK";
  }
}

function storyMetaForItem(item: SpotlightContentItem): BotdStorySlideMeta {
  if (item.kind === "botd") {
    return {
      title: item.title,
      artistName: item.artistName,
      publisherName: item.publisherName,
      label: storyLabelForItem(item),
    };
  }
  return {
    title: item.title,
    label: storyLabelForItem(item),
  };
}

export async function buildSpotlightStoryPreviewUrl(
  item: SpotlightContentItem,
  weekKey: string,
): Promise<string | null> {
  const sourceUrl = resolveSpotlightStoryImageUrl(item);
  if (!sourceUrl) return null;

  const meta = storyMetaForItem(item);
  const buffer = item.artistProvidedStoryImageUrl
    ? await renderBotdStoryFullBleed(sourceUrl, meta)
    : await renderBotdStoryBlurred(sourceUrl, meta);

  const uploaded = await uploadImageFromBuffer(
    buffer,
    `social/preview/planner/${weekKey}/${previewKeyForItem(item)}/story`,
  );
  return uploaded.url;
}

export async function buildPlannerWeekStoryPreviewUrls(
  items: SpotlightContentItem[],
  weekKey: string,
): Promise<Map<string, string[]>> {
  const previews = new Map<string, string[]>();
  for (const item of items) {
    const url = await buildSpotlightStoryPreviewUrl(item, weekKey);
    previews.set(previewKeyForItem(item), url ? [url] : []);
  }
  return previews;
}

export function previewKeyForSpotlightItem(item: SpotlightContentItem): string {
  return previewKeyForItem(item);
}
