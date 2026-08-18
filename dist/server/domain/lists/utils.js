import { z } from "zod";
const normalizeSlug = (value) => value.toLowerCase().trim().replace(/-+/g, "-").replace(/^-|-$/g, "");
const listSlugSchema = z.string().transform(normalizeSlug).pipe(
  z.string().min(1, "Slug is required").max(255).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens"
  )
);
const listTitleSchema = z.string().trim().min(1, "Title is required").max(255, "Title is too long");
const listDescriptionSchema = z.string().trim().max(2e3, "Description is too long").optional().transform((v) => v && v.length > 0 ? v : null);
const RESERVED_LIST_SLUGS = /* @__PURE__ */ new Set(["favorites", "favourites", "new"]);
function isReservedListSlug(slug) {
  return RESERVED_LIST_SLUGS.has(slug);
}
function slugFromTitle(title) {
  return title.normalize("NFD").replace(new RegExp("\\p{Mark}", "gu"), "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function withListSlugSuffix(base, suffix) {
  return suffix <= 1 ? base : `${base}-${suffix}`;
}
function isListPromotionEligible(list, owner) {
  return list.isPublic && owner.shelfPublic && Boolean(owner.shelfSlug);
}
function userCanManageBookLists(user) {
  return Boolean(user?.id);
}
export {
  isListPromotionEligible,
  isReservedListSlug,
  listDescriptionSchema,
  listSlugSchema,
  listTitleSchema,
  slugFromTitle,
  userCanManageBookLists,
  withListSlugSuffix
};
