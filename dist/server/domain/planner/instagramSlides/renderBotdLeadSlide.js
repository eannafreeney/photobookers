import {
  prepareSpotlightFeedImageUrls,
  renderSpotlightLeadSlide
} from "./renderSpotlightLeadSlide.js";
import {
  buildBookCreditsSubtitle,
  buildSpotlightLeadOverlaySvg,
  prepareNewCreatorFeedImageUrls,
  prepareSpotlightFeedImageUrls as prepareSpotlightFeedImageUrls2,
  renderPlainCoverSlide,
  renderSpotlightLeadSlide as renderSpotlightLeadSlide2
} from "./renderSpotlightLeadSlide.js";
async function renderBotdLeadSlide(imageUrl) {
  return renderSpotlightLeadSlide(imageUrl, "Book of the Day");
}
async function applyBotdLeadSlideToFeedImageUrls(imageUrls, options) {
  return prepareSpotlightFeedImageUrls(imageUrls, "Book of the Day", options);
}
const BOTD_LEAD_LABEL = "Book of the Day";
export {
  BOTD_LEAD_LABEL,
  applyBotdLeadSlideToFeedImageUrls,
  buildBookCreditsSubtitle,
  buildSpotlightLeadOverlaySvg,
  prepareNewCreatorFeedImageUrls,
  prepareSpotlightFeedImageUrls2 as prepareSpotlightFeedImageUrls,
  renderBotdLeadSlide,
  renderPlainCoverSlide,
  renderSpotlightLeadSlide2 as renderSpotlightLeadSlide
};
