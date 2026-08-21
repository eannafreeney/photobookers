import { appBaseUrl, creatorUrl } from "../features/app/spotlightUrls.js";
const CREATOR_REFERRAL_PARAM = "ref";
const BADGE_REFERRAL = "badge";
const MAX_REFERRAL_LENGTH = 32;
function parseCreatorReferral(value) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.length > MAX_REFERRAL_LENGTH) return null;
  return /^[a-z0-9][a-z0-9_-]*$/.test(trimmed) ? trimmed : null;
}
const BADGE_SPECS = [
  {
    variant: "brand",
    file: "icon.svg",
    label: "Icon",
    hint: "Full colour. Works on light and dark backgrounds.",
    width: 32,
    height: 32
  },
  {
    variant: "dark",
    file: "icon-dark.svg",
    label: "Icon (mono, dark)",
    hint: "Transparent background. For light-coloured sites.",
    width: 32,
    height: 32
  },
  {
    variant: "light",
    file: "icon-light.svg",
    label: "Icon (mono, light)",
    hint: "Transparent background. For dark-coloured sites.",
    width: 32,
    height: 32
  },
  {
    variant: "wordmark",
    file: "wordmark.svg",
    label: "Button",
    hint: "Icon plus the Photobookers name.",
    width: 146,
    height: 40
  }
];
function badgeSpec(variant) {
  return BADGE_SPECS.find((spec) => spec.variant === variant) ?? BADGE_SPECS[0];
}
function badgeAssetPath(variant) {
  return `/badge/${badgeSpec(variant).file}`;
}
function badgeAssetUrl(variant) {
  return `${appBaseUrl().replace(/\/$/, "")}${badgeAssetPath(variant)}`;
}
function badgeProfileUrl(slug, referral = BADGE_REFERRAL) {
  return `${creatorUrl(slug)}?${CREATOR_REFERRAL_PARAM}=${referral}`;
}
function escapeHtmlAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function badgeEmbedHtml(params) {
  const spec = badgeSpec(params.variant);
  const href = escapeHtmlAttribute(
    badgeProfileUrl(params.slug, params.referral)
  );
  const src = escapeHtmlAttribute(badgeAssetUrl(params.variant));
  const alt = escapeHtmlAttribute(`${params.displayName} on Photobookers`);
  return [
    `<a href="${href}" target="_blank" rel="noopener">`,
    `  <img src="${src}" alt="${alt}" width="${spec.width}" height="${spec.height}">`,
    `</a>`
  ].join("\n");
}
export {
  BADGE_REFERRAL,
  BADGE_SPECS,
  CREATOR_REFERRAL_PARAM,
  MAX_REFERRAL_LENGTH,
  badgeAssetPath,
  badgeAssetUrl,
  badgeEmbedHtml,
  badgeProfileUrl,
  badgeSpec,
  parseCreatorReferral
};
