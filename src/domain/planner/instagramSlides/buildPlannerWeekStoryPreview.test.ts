import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SpotlightContentItem } from "../../../features/dashboard/admin/planner/spotlightBlurb";

const uploadImageFromBufferMock = vi.fn();
const renderBotdStoryBlurredMock = vi.fn();
const renderBotdStoryFullBleedMock = vi.fn();

vi.mock("../../../services/storage", () => ({
  uploadImageFromBuffer: (...args: unknown[]) =>
    uploadImageFromBufferMock(...args),
}));

vi.mock("./renderBotdStorySlide", () => ({
  renderBotdStoryBlurred: (...args: unknown[]) =>
    renderBotdStoryBlurredMock(...args),
  renderBotdStoryFullBleed: (...args: unknown[]) =>
    renderBotdStoryFullBleedMock(...args),
}));

import {
  buildPlannerWeekStoryPreviewUrls,
  previewKeyForSpotlightItem,
} from "./buildPlannerWeekStoryPreview";

const botdItem: SpotlightContentItem = {
  kind: "botd",
  date: new Date(Date.UTC(2026, 6, 13)),
  title: "Winter Light",
  artistName: "Jane Doe",
  publisherName: "Press",
  featuredImageUrl: "https://example.com/hero.jpg",
  artistProvidedStoryImageUrl: null,
  instagramImageUrls: ["https://example.com/cover.jpg"],
  sourceText: null,
  spotlightBlurb: null,
  instagramCaption: "Caption",
};

describe("buildPlannerWeekStoryPreviewUrls", () => {
  beforeEach(() => {
    uploadImageFromBufferMock.mockReset();
    renderBotdStoryBlurredMock.mockReset();
    renderBotdStoryFullBleedMock.mockReset();
    renderBotdStoryBlurredMock.mockResolvedValue(Buffer.from("blurred"));
    renderBotdStoryFullBleedMock.mockResolvedValue(Buffer.from("full"));
    uploadImageFromBufferMock.mockResolvedValue({
      url: "https://cdn.example.com/story.webp",
    });
  });

  it("renders a blurred story when no artist image is provided", async () => {
    const previews = await buildPlannerWeekStoryPreviewUrls(
      [botdItem],
      "2026-07-13",
    );

    expect(renderBotdStoryBlurredMock).toHaveBeenCalledWith(
      "https://example.com/cover.jpg",
      expect.objectContaining({
        title: "Winter Light",
        label: "BOOK OF THE DAY",
      }),
    );
    expect(renderBotdStoryFullBleedMock).not.toHaveBeenCalled();
    expect(previews.get(previewKeyForSpotlightItem(botdItem))).toEqual([
      "https://cdn.example.com/story.webp",
    ]);
  });

  it("renders full-bleed when an artist story image is provided", async () => {
    const item: SpotlightContentItem = {
      ...botdItem,
      artistProvidedStoryImageUrl: "https://example.com/artist.webp",
    };

    await buildPlannerWeekStoryPreviewUrls([item], "2026-07-13");

    expect(renderBotdStoryFullBleedMock).toHaveBeenCalledWith(
      "https://example.com/artist.webp",
      expect.objectContaining({ label: "BOOK OF THE DAY" }),
    );
    expect(renderBotdStoryBlurredMock).not.toHaveBeenCalled();
  });
});
