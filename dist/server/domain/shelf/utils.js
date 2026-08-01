import { z } from "zod";
const normalizeSlug = (value) => value.toLowerCase().trim().replace(/-+/g, "-").replace(/^-|-$/g, "");
const shelfSlugSchema = z.string().transform(normalizeSlug).pipe(
  z.string().min(1, "Slug is required").regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
  )
);
const RESERVED_SHELF_SLUGS = /* @__PURE__ */ new Set(["settings", "share"]);
function isReservedShelfSlug(slug) {
  return RESERVED_SHELF_SLUGS.has(slug);
}
const capitalizeName = (value) => value.replace(new RegExp("(^|[\\s'-])(\\p{L})", "gu"), (_, sep, ch) => sep + ch.toUpperCase());
function formatShelfOwnerName(user) {
  const creatorName = user.creator?.displayName?.trim();
  if (creatorName) return creatorName;
  const fullName = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).map((part) => capitalizeName(part)).join(" ").trim();
  if (fullName) return fullName;
  return "A photobookers member";
}
function baseShelfSlugFromUser(user) {
  const parts = [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).map(
    (part) => part.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  ).filter(Boolean);
  if (parts.length === 0) return null;
  const joined = parts.join("-");
  const parsed = shelfSlugSchema.safeParse(joined);
  return parsed.success ? parsed.data : null;
}
function withShelfSlugSuffix(base, suffix) {
  return suffix <= 1 ? base : `${base}-${suffix}`;
}
export {
  baseShelfSlugFromUser,
  formatShelfOwnerName,
  isReservedShelfSlug,
  shelfSlugSchema,
  withShelfSlugSuffix
};
