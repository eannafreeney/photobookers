import { SITE_APP, SITE_SKOOL } from "../../../../constants/siteSocial";
import { emailFontLogo, emailFontSans } from "./espHtml";

export const appStoreUrl = SITE_APP.ios.href;

/**
 * Absolute site origin for newsletter hrefs.
 * Use `||` (not `??`): GitHub Actions injects unset secrets as `""`, which
 * would otherwise produce relative links like `/books/…` that break in email.
 */
export function resolveAppBaseUrl(): string {
  const raw =
    process.env.PUBLIC_APP_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://www.photobookers.com";
  return raw.replace(/\/$/, "");
}

/** Hero/footer in the public `newsletter` Supabase bucket. */
const newsletterStorageBase =
  "https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/newsletter";

export const newsletterAssets = {
  /** Public Supabase asset — email clients cannot load localhost URLs. */
  logo: `${newsletterStorageBase}/logo.png`,
  hero: `${newsletterStorageBase}/hero.jpg`,
  footerBanner: `${newsletterStorageBase}/footer.jpg`,
} as const;

export const newsletterLogoWidthPx = 120;

export const newsletterSocial = {
  instagramUrl: "https://instagram.com/photobookers",
  /** Hosted on production — not available on localhost during dev. */
  instagramIconUrl: "https://www.photobookers.com/icons/social/instagram.png",
} as const;

export function newsletterNavLinks() {
  const base = resolveAppBaseUrl();
  return [
    { label: "Home", href: `${base}/` },
    { label: "Books", href: `${base}/books` },
    { label: "Book of the Day", href: `${base}/book-of-the-day` },
    { label: "This Week", href: `${base}/this-week` },
    { label: "Publish Your Photobook", href: SITE_SKOOL.href },
  ] as const;
}

export const newsletterWidthPx = 600;
/** Inner card width after section horizontal padding (25px each side). */
export const featureCardContentWidthPx = newsletterWidthPx - 50;
export const featureCardMobileSidePaddingPx = 32;
export const featureCardRowImageWidthPx = 110;
export const featureCardRowMobileImageMaxWidthPx = 200;
export const featureCardRowMobileGapPx = 12;
export const newsletterThreeColCount = 3;
export const newsletterThreeColGapPx = 16;
export const newsletterThreeColHalfGapPx = newsletterThreeColGapPx / 2;
export const newsletterThreeColContentWidthPx = Math.floor(
  (featureCardContentWidthPx -
    newsletterThreeColGapPx * (newsletterThreeColCount - 1)) /
    newsletterThreeColCount,
);

/** Editorial theme — aligned with `src/styles/styles.css`. */
export const brand = {
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
  fontLogo: emailFontLogo,
} as const;
