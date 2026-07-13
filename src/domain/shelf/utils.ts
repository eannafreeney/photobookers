import { z } from "zod";

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const shelfSlugSchema = z
  .string()
  .transform(normalizeSlug)
  .pipe(
    z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
  );

const RESERVED_SHELF_SLUGS = new Set(["settings", "share"]);

export function isReservedShelfSlug(slug: string): boolean {
  return RESERVED_SHELF_SLUGS.has(slug);
}

type ShelfOwnerFields = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  creator?: { displayName: string } | null;
};

export function formatShelfOwnerName(user: ShelfOwnerFields): string {
  const creatorName = user.creator?.displayName?.trim();
  if (creatorName) return creatorName;

  const fullName = [user.firstName, user.lastName]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();
  if (fullName) return fullName;

  return "A photobookers member";
}

export function baseShelfSlugFromUser(user: ShelfOwnerFields): string | null {
  const parts = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .map((part) =>
      part!
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    )
    .filter(Boolean);

  if (parts.length === 0) return null;
  const joined = parts.join("-");
  const parsed = shelfSlugSchema.safeParse(joined);
  return parsed.success ? parsed.data : null;
}

export function withShelfSlugSuffix(base: string, suffix: number): string {
  return suffix <= 1 ? base : `${base}-${suffix}`;
}
