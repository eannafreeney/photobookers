import { SITE_APP } from "../../../../../constants/siteSocial.js";
import { emailFontLogo, emailFontSans } from "../newsletterEspHtml.js";
const appStoreUrl = SITE_APP.ios.href;
const appBaseUrl = process.env.PUBLIC_APP_URL ?? process.env.SITE_URL ?? "https://www.photobookers.com";
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
const newsletterNavLinks = [
  { label: "Featured", href: `${appBaseUrl}/featured` },
  { label: "Books", href: `${appBaseUrl}/books` },
  { label: "Book of the Day", href: `${appBaseUrl}/book-of-the-day` },
  { label: "This Week", href: `${appBaseUrl}/this-week` }
];
const newsletterWidthPx = 600;
const featureCardContentWidthPx = newsletterWidthPx - 50;
const featureCardMobileSidePaddingPx = 32;
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
  appBaseUrl,
  appStoreUrl,
  brand,
  featureCardContentWidthPx,
  featureCardMobileSidePaddingPx,
  newsletterAssets,
  newsletterLogoWidthPx,
  newsletterNavLinks,
  newsletterSocial,
  newsletterWidthPx
};
