import { emailFontLogo, emailFontSans } from "../newsletterEspHtml";

export const appBaseUrl =
  process.env.PUBLIC_APP_URL ??
  process.env.SITE_URL ??
  "https://www.photobookers.com";

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

export const newsletterNavLinks = [
  { label: "Featured", href: `${appBaseUrl}/featured` },
  { label: "Books", href: `${appBaseUrl}/books` },
  { label: "Book of the Day", href: `${appBaseUrl}/book-of-the-day` },
  { label: "This Week", href: `${appBaseUrl}/this-week` },
] as const;

export const newsletterWidthPx = 600;
/** Inner card width after section horizontal padding (25px each side). */
export const featureCardContentWidthPx = newsletterWidthPx - 50;
export const featureCardMobileSidePaddingPx = 32;

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
  fontDisplay:
    "Fraunces, Iowan Old Style, Georgia, Times New Roman, serif",
  fontLogo: emailFontLogo,
} as const;
