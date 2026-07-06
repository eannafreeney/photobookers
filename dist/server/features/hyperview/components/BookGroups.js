import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { ScrollView, Style, View } from "../../../lib/hxml-comps.js";
import { FEATURED_BOOK_GROUPS } from "../../../constants/featuredBookGroups.js";
import { hyperviewTagBooksUrl } from "../../../lib/tags.js";
import { loadFeaturedBookGroupCovers } from "../../app/services.js";
import SectionHeader from "./SectionHeader.js";
import GroupCard, { groupCardStyles } from "./GroupCard.js";
const BookGroups = async ({ baseUrl = "" }) => {
  const covers = await loadFeaturedBookGroupCovers();
  return /* @__PURE__ */ jsxs(View, { style: "book-groups-section", children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Groups" }),
    /* @__PURE__ */ jsx(
      ScrollView,
      {
        style: "book-groups-scroll",
        horizontal: "true",
        "shows-scroll-indicator": "false",
        children: FEATURED_BOOK_GROUPS.map((tag) => /* @__PURE__ */ jsx(
          GroupCard,
          {
            tag,
            href: hyperviewTagBooksUrl(baseUrl, tag),
            coverUrl: covers.get(tag) ?? null
          },
          tag
        ))
      }
    )
  ] });
};
var BookGroups_default = BookGroups;
const bookGroupsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-groups-section",
      flexDirection: "column",
      gap: 12,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-groups-scroll", flexDirection: "row" }),
  groupCardStyles()
] });
export {
  bookGroupsStyles,
  BookGroups_default as default
};
