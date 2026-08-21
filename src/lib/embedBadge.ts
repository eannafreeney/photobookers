import { appBaseUrl, creatorUrl } from "../features/app/spotlightUrls";

/**
 * Embeddable profile badges: an icon a creator pastes into their own site's
 * social-links row so visitors can reach their Photobookers profile.
 *
 * Every embed carries `?ref=` so badge traffic is separable from organic
 * traffic in creator analytics — the assets are hot-linked from our origin, so
 * the `Referer` header alone can't tell us which site sent the visit once a
 * creator's page is HTTPS-to-HTTPS with a strict referrer policy.
 */

export const CREATOR_REFERRAL_PARAM = "ref";
export const BADGE_REFERRAL = "badge";

/** Matches the `ref` column width on `creator_views`. */
export const MAX_REFERRAL_LENGTH = 32;

/**
 * Referral values land in the database and in analytics group-bys, so accept
 * only a slug-ish shape. Anything else becomes null rather than an error —
 * a junk `?ref=` should never cost the visitor their page view.
 */
export function parseCreatorReferral(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.length > MAX_REFERRAL_LENGTH) return null;
  return /^[a-z0-9][a-z0-9_-]*$/.test(trimmed) ? trimmed : null;
}

export type BadgeVariant = "brand" | "dark" | "light" | "wordmark";

type BadgeSpec = {
  variant: BadgeVariant;
  file: string;
  label: string;
  hint: string;
  width: number;
  height: number;
};

export const BADGE_SPECS: readonly BadgeSpec[] = [
  {
    variant: "brand",
    file: "icon.svg",
    label: "Icon",
    hint: "Full colour. Works on light and dark backgrounds.",
    width: 32,
    height: 32,
  },
  {
    variant: "dark",
    file: "icon-dark.svg",
    label: "Icon (mono, dark)",
    hint: "Transparent background. For light-coloured sites.",
    width: 32,
    height: 32,
  },
  {
    variant: "light",
    file: "icon-light.svg",
    label: "Icon (mono, light)",
    hint: "Transparent background. For dark-coloured sites.",
    width: 32,
    height: 32,
  },
  {
    variant: "wordmark",
    file: "wordmark.svg",
    label: "Button",
    hint: "Icon plus the Photobookers name.",
    width: 146,
    height: 40,
  },
];

export function badgeSpec(variant: BadgeVariant): BadgeSpec {
  return BADGE_SPECS.find((spec) => spec.variant === variant) ?? BADGE_SPECS[0];
}

export function badgeAssetPath(variant: BadgeVariant): string {
  return `/badge/${badgeSpec(variant).file}`;
}

export function badgeAssetUrl(variant: BadgeVariant): string {
  return `${appBaseUrl().replace(/\/$/, "")}${badgeAssetPath(variant)}`;
}

/** Profile URL a badge links to, tagged so the visit is attributable. */
export function badgeProfileUrl(
  slug: string,
  referral: string = BADGE_REFERRAL,
): string {
  return `${creatorUrl(slug)}?${CREATOR_REFERRAL_PARAM}=${referral}`;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The copy-paste snippet. Kept to plain anchor + img on purpose: it has to
 * survive being pasted into a Squarespace block or a WordPress HTML widget,
 * neither of which reliably keeps <style> or class attributes.
 */
export function badgeEmbedHtml(params: {
  slug: string;
  displayName: string;
  variant: BadgeVariant;
  referral?: string;
}): string {
  const spec = badgeSpec(params.variant);
  const href = escapeHtmlAttribute(
    badgeProfileUrl(params.slug, params.referral),
  );
  const src = escapeHtmlAttribute(badgeAssetUrl(params.variant));
  const alt = escapeHtmlAttribute(`${params.displayName} on Photobookers`);

  return [
    `<a href="${href}" target="_blank" rel="noopener">`,
    `  <img src="${src}" alt="${alt}" width="${spec.width}" height="${spec.height}">`,
    `</a>`,
  ].join("\n");
}
