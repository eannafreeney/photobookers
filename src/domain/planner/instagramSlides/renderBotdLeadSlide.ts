import {
  prepareSpotlightFeedImageUrls,
  renderSpotlightLeadSlide,
  type SpotlightLeadLabel,
} from "./renderSpotlightLeadSlide";

export {
  buildBookCreditsSubtitle,
  buildSpotlightLeadOverlaySvg,
  prepareNewCreatorFeedImageUrls,
  prepareSpotlightFeedImageUrls,
  renderPlainCoverSlide,
  renderSpotlightLeadSlide,
  type SpotlightLeadLabel,
  type SpotlightSlideMeta,
} from "./renderSpotlightLeadSlide";

/** @deprecated Use renderSpotlightLeadSlide with "Book of the Day" */
export async function renderBotdLeadSlide(imageUrl: string): Promise<Buffer> {
  return renderSpotlightLeadSlide(imageUrl, "Book of the Day");
}

export async function applyBotdLeadSlideToFeedImageUrls(
  imageUrls: string[],
  options: {
    upload: (buffer: Buffer, folder: string) => Promise<string>;
    uploadFolder: string;
  },
): Promise<string[]> {
  return prepareSpotlightFeedImageUrls(imageUrls, "Book of the Day", options);
}

export const BOTD_LEAD_LABEL: SpotlightLeadLabel = "Book of the Day";
