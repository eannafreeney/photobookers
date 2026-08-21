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
const LIST_ITEM_NOTE_MAX_LENGTH = 1e3;
const listItemNoteSchema = z.string().trim().max(LIST_ITEM_NOTE_MAX_LENGTH, "Note is too long").transform((v) => v.length > 0 ? v : null);
function commentBodyAsListNote(body) {
  return body.trim().slice(0, LIST_ITEM_NOTE_MAX_LENGTH);
}
const RESERVED_LIST_SLUGS = /* @__PURE__ */ new Set(["favorites", "favourites", "new"]);
const FAVORITES_LIST_ID = "favorites";
const FAVORITES_LIST_SLUG = "favorites";
const FAVORITES_LIST_TITLE = "Favorites";
function isReservedListSlug(slug) {
  return RESERVED_LIST_SLUGS.has(slug);
}
function isFavoritesListSlug(slug) {
  return slug === "favorites" || slug === "favourites";
}
function isFavoritesListId(id) {
  return id === FAVORITES_LIST_ID;
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
  FAVORITES_LIST_ID,
  FAVORITES_LIST_SLUG,
  FAVORITES_LIST_TITLE,
  LIST_ITEM_NOTE_MAX_LENGTH,
  commentBodyAsListNote,
  isFavoritesListId,
  isFavoritesListSlug,
  isListPromotionEligible,
  isReservedListSlug,
  listDescriptionSchema,
  listItemNoteSchema,
  listSlugSchema,
  listTitleSchema,
  slugFromTitle,
  userCanManageBookLists,
  withListSlugSuffix
};
