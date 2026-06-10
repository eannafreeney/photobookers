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

export const newsletterLogoWidthPx = 100;

export const newsletterSocial = {
  instagramUrl: "https://instagram.com/photobookers",
  /** Hosted on production — not available on localhost during dev. */
  instagramIconUrl: "https://www.photobookers.com/icons/social/instagram.png",
} as const;

export const newsletterNavLinks = [
  { label: "Featured", href: `${appBaseUrl}/featured` },
  { label: "Creators", href: `${appBaseUrl}/creators` },
  { label: "Book of the Day", href: `${appBaseUrl}/book-of-the-day` },
] as const;

export const newsletterWidthPx = 600;
export const featureImageWidthPx = 240;

export const brand = {
  surface: "#ffffff",
  surfaceAlt: "#F4F4F4",
  onSurface: "#525252",
  onSurfaceStrong: "#171717",
  onSurfaceWeak: "#a3a3a3",
  outline: "#d4d4d4",
  primary: "#000000",
  onPrimary: "#f5f5f5",
  fontSans: emailFontSans,
  fontLogo: emailFontLogo,
} as const;
