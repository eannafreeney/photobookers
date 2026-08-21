import { SITE_APP, SITE_SKOOL } from "../../../../constants/siteSocial.js";
import { emailFontLogo, emailFontSans } from "./espHtml.js";
const appStoreUrl = SITE_APP.ios.href;
function resolveAppBaseUrl() {
  const raw = process.env.PUBLIC_APP_URL?.trim() || process.env.SITE_URL?.trim() || "https://www.photobookers.com";
  return raw.replace(/\/$/, "");
}
const newsletterStorageBase = "https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/newsletter";
const newsletterAssets = {
  /** Public Supabase asset — email clients cannot load localhost URLs. */
  logo: `${newsletterStorageBase}/logo.png`,
  hero: `${newsletterStorageBase}/hero.jpg`,
  footerBanner: `${newsletterStorageBase}/footer.jpg`
};
const newsletterLogoWidthPx = 120;
const newsletterSocial = {
  instagramUrl: "https://instagram.com/photobookers",
  /** Hosted on production — not available on localhost during dev. */
  instagramIconUrl: "https://www.photobookers.com/icons/social/instagram.png"
};
function newsletterNavLinks() {
  const base = resolveAppBaseUrl();
  return [
    { label: "Featured", href: `${base}/featured` },
    { label: "Books", href: `${base}/books` },
    { label: "Book of the Day", href: `${base}/book-of-the-day` },
    { label: "This Week", href: `${base}/this-week` },
    { label: "Publish Your Photobook", href: SITE_SKOOL.href }
  ];
}
const newsletterWidthPx = 600;
const featureCardContentWidthPx = newsletterWidthPx - 50;
const featureCardMobileSidePaddingPx = 32;
const featureCardRowImageWidthPx = 110;
const featureCardRowMobileImageMaxWidthPx = 200;
const featureCardRowMobileGapPx = 12;
const newsletterThreeColCount = 3;
const newsletterThreeColGapPx = 16;
const newsletterThreeColHalfGapPx = newsletterThreeColGapPx / 2;
const newsletterThreeColContentWidthPx = Math.floor(
  (featureCardContentWidthPx - newsletterThreeColGapPx * (newsletterThreeColCount - 1)) / newsletterThreeColCount
);
const brand = {
  surface: "#fbfaf7",
  surfaceAlt: "#f2efe8",
  onSurface: "#45413a",
  onSurfaceStrong: "#191613",
  onSurfaceWeak: "#a39d90",
  outline: "#e4e0d5",
  outlineStrong: "#191613",
  accent: "#a22c29",
  onAccent: "#fbfaf7",
  primary: "#191613",
  onPrimary: "#fbfaf7",
  fontSans: emailFontSans,
  fontDisplay: "Fraunces, Iowan Old Style, Georgia, Times New Roman, serif",
  fontLogo: emailFontLogo
};
export {
  appStoreUrl,
  brand,
  featureCardContentWidthPx,
  featureCardMobileSidePaddingPx,
  featureCardRowImageWidthPx,
  featureCardRowMobileGapPx,
  featureCardRowMobileImageMaxWidthPx,
  newsletterAssets,
  newsletterLogoWidthPx,
  newsletterNavLinks,
  newsletterSocial,
  newsletterThreeColContentWidthPx,
  newsletterThreeColCount,
  newsletterThreeColGapPx,
  newsletterThreeColHalfGapPx,
  newsletterWidthPx,
  resolveAppBaseUrl
};
