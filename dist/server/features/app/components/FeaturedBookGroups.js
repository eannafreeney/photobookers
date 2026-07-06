import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { FEATURED_BOOK_GROUPS } from "../../../constants/featuredBookGroups.js";
import { tagBooksUrl } from "../../../lib/tags.js";
import { loadFeaturedBookGroupCovers } from "../services.js";
import GroupCard from "./GroupCard.js";
const FeaturedBookGroups = async () => {
  const covers = await loadFeaturedBookGroupCovers();
  return /* @__PURE__ */ jsxs("div", { id: "featured-book-groups", children: [
    /* @__PURE__ */ jsx("div", { class: "mb-6 border-t-2 border-on-surface-strong pt-3", children: /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "Browse by Theme", children: "Groups" }) }),
    /* @__PURE__ */ jsx("div", { class: "overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: /* @__PURE__ */ jsx("div", { class: "flex min-w-max items-center gap-4 pr-4", children: FEATURED_BOOK_GROUPS.map((tag) => /* @__PURE__ */ jsx(
      GroupCard,
      {
        tag,
        href: tagBooksUrl(tag),
        coverUrl: covers.get(tag) ?? null
      },
      tag
    )) }) })
  ] });
};
var FeaturedBookGroups_default = FeaturedBookGroups;
export {
  FeaturedBookGroups_default as default
};
