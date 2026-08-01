import sharp from "sharp";
import {
  escapeXml,
  fetchInstagramSlideImage,
  getInstagramSlideFonts,
  INSTAGRAM_SLIDE_COLORS,
  INSTAGRAM_SLIDE_SIZE,
  instagramSlideFontStyles,
  truncateInstagramSlideText
} from "./shared.js";
const PUBLISHER_COVER_LAYOUT = {
  width: 680,
  height: 680,
  top: 196,
  fit: "inside"
};
const BOOK_COVER_LAYOUT = {
  width: 940,
  height: 680,
  top: 140,
  fit: "inside"
};
const CREATOR_COVER_LAYOUT = {
  width: 720,
  height: 720,
  top: 168,
  fit: "inside"
};
function coverLayoutForSpotlightLabel(label) {
  switch (label) {
    case "Book of the Day":
      return BOOK_COVER_LAYOUT;
    case "Publisher of the Week":
      return PUBLISHER_COVER_LAYOUT;
    default:
      return CREATOR_COVER_LAYOUT;
  }
}
const LABEL_FONT_SIZE = {
  "Book of the Day": 38,
  "Artist of the Week": 38,
  "Publisher of the Week": 38,
  "New on photobookers": 34
};
function buildBookCreditsSubtitle(book) {
  const credits = [book.artist?.displayName, book.publisher?.displayName].filter(
    Boolean
  );
  return credits.length > 0 ? credits.join(" \xB7 ") : null;
}
function buildSpotlightLeadOverlaySvg(label, meta = {}) {
  const fonts = getInstagramSlideFonts();
  const fontSize = LABEL_FONT_SIZE[label];
  const title = meta.title?.trim() ? truncateInstagramSlideText(meta.title, 52) : null;
  const subtitle = meta.subtitle?.trim() ? truncateInstagramSlideText(meta.subtitle, 60) : null;
  const titleY = subtitle ? 930 : 950;
  return `<svg width="${INSTAGRAM_SLIDE_SIZE}" height="${INSTAGRAM_SLIDE_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>${instagramSlideFontStyles(fonts)}</style>
  </defs>
  <rect width="100%" height="100%" fill="transparent"/>
  <text x="540" y="72" text-anchor="middle" fill="${INSTAGRAM_SLIDE_COLORS.ink}" font-family="Fraunces" font-size="${fontSize}" font-weight="600">${escapeXml(label)}</text>
  ${title ? `<text x="540" y="${titleY}" text-anchor="middle" fill="${INSTAGRAM_SLIDE_COLORS.ink}" font-family="Fraunces" font-size="34" font-weight="600">${escapeXml(title)}</text>` : ""}
  ${subtitle ? `<text x="540" y="972" text-anchor="middle" fill="${INSTAGRAM_SLIDE_COLORS.inkMuted}" font-family="Instrument Sans" font-size="24" font-weight="600">${escapeXml(subtitle)}</text>` : ""}
  <text x="540" y="1048" text-anchor="middle" fill="${INSTAGRAM_SLIDE_COLORS.inkMuted}" font-family="Instrument Sans" font-size="20" font-weight="600" letter-spacing="2">PHOTOBOOKERS.COM</text>
</svg>`;
}
async function buildMatCoverLayer(imageUrl, layout) {
  const mat = sharp({
    create: {
      width: layout.width,
      height: layout.height,
      channels: 3,
      background: INSTAGRAM_SLIDE_COLORS.surface
    }
  });
  const source = await fetchInstagramSlideImage(imageUrl);
  if (!source) {
    return mat.png().toBuffer();
  }
  const fitted = await sharp(source).resize(layout.width, layout.height, {
    fit: "inside",
    position: "centre"
  }).toBuffer();
  return mat.composite([{ input: fitted, gravity: "centre" }]).png().toBuffer();
}
async function renderEditorialCoverSlide(imageUrl, overlaySvg, layout) {
  const cover = await buildMatCoverLayer(imageUrl, layout);
  const coverLeft = Math.floor((INSTAGRAM_SLIDE_SIZE - layout.width) / 2);
  return sharp({
    create: {
      width: INSTAGRAM_SLIDE_SIZE,
      height: INSTAGRAM_SLIDE_SIZE,
      channels: 3,
      background: INSTAGRAM_SLIDE_COLORS.surface
    }
  }).composite([
    { input: cover, top: layout.top, left: coverLeft },
    { input: Buffer.from(overlaySvg), top: 0, left: 0 }
  ]).webp({ quality: 90 }).toBuffer();
}
async function renderSpotlightLeadSlide(imageUrl, label, meta = {}) {
  return renderEditorialCoverSlide(
    imageUrl,
    buildSpotlightLeadOverlaySvg(label, meta),
    coverLayoutForSpotlightLabel(label)
  );
}
async function renderPlainCoverSlide(imageUrl) {
  const layout = BOOK_COVER_LAYOUT;
  const cover = await buildMatCoverLayer(imageUrl, layout);
  const coverLeft = Math.floor((INSTAGRAM_SLIDE_SIZE - layout.width) / 2);
  return sharp({
    create: {
      width: INSTAGRAM_SLIDE_SIZE,
      height: INSTAGRAM_SLIDE_SIZE,
      channels: 3,
      background: INSTAGRAM_SLIDE_COLORS.surface
    }
  }).composite([{ input: cover, top: layout.top, left: coverLeft }]).webp({ quality: 90 }).toBuffer();
}
async function applySpotlightLeadToFeedImageUrls(imageUrls, label, options) {
  return prepareSpotlightFeedImageUrls(imageUrls, label, options);
}
const NEW_CREATOR_CAROUSEL_BOOK_LIMIT = 5;
async function prepareNewCreatorFeedImageUrls(creatorCoverUrl, bookCoverUrls, options) {
  const bookUrls = bookCoverUrls.filter(Boolean).slice(0, NEW_CREATOR_CAROUSEL_BOOK_LIMIT);
  const renderedLead = await renderSpotlightLeadSlide(
    creatorCoverUrl,
    "New on photobookers",
    { title: options.displayName }
  );
  const leadUrl = await options.upload(renderedLead, options.uploadFolder);
  return [leadUrl, ...bookUrls];
}
async function prepareSpotlightFeedImageUrls(imageUrls, label, options) {
  if (imageUrls.length === 0) return [];
  const firstUrl = imageUrls[0];
  if (!firstUrl) return imageUrls;
  const renderedLead = await renderSpotlightLeadSlide(
    firstUrl,
    label,
    options.meta
  );
  const leadUrl = await options.upload(renderedLead, options.uploadFolder);
  return [leadUrl, ...imageUrls.slice(1)];
}
export {
  NEW_CREATOR_CAROUSEL_BOOK_LIMIT,
  applySpotlightLeadToFeedImageUrls,
  buildBookCreditsSubtitle,
  buildSpotlightLeadOverlaySvg,
  coverLayoutForSpotlightLabel,
  prepareNewCreatorFeedImageUrls,
  prepareSpotlightFeedImageUrls,
  renderPlainCoverSlide,
  renderSpotlightLeadSlide
};
