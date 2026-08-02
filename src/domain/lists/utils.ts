import { z } from "zod";

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const listSlugSchema = z
  .string()
  .transform(normalizeSlug)
  .pipe(
    z
      .string()
      .min(1, "Slug is required")
      .max(255)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
  );

export const listTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(255, "Title is too long");

export const listDescriptionSchema = z
  .string()
  .trim()
  .max(2000, "Description is too long")
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const RESERVED_LIST_SLUGS = new Set(["favorites", "favourites", "new"]);

export function isReservedListSlug(slug: string): boolean {
  return RESERVED_LIST_SLUGS.has(slug);
}

export function slugFromTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function withListSlugSuffix(base: string, suffix: number): string {
  return suffix <= 1 ? base : `${base}-${suffix}`;
}

/** Public list + public shelf with slug — required to promote / show on homepage. */
export function isListPromotionEligible(
  list: { isPublic: boolean },
  owner: { shelfPublic: boolean; shelfSlug: string | null },
): boolean {
  return list.isPublic && owner.shelfPublic && Boolean(owner.shelfSlug);
}

/** Any signed-in member can manage personal book lists (creators included). */
export function userCanManageBookLists(user: { id?: string } | null): boolean {
  return Boolean(user?.id);
}

