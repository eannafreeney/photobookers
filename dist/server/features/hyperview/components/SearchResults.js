import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
const HVSearchResults = ({ books, creators, baseUrl }) => {
  const hasResults = books.length > 0 || creators.length > 0;
  if (!hasResults) {
    return /* @__PURE__ */ jsx(
      View,
      {
        xmlns: "https://hyperview.org/hyperview",
        style: "search-results-stack",
        children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No results found" })
      }
    );
  }
  return /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", style: "search-results-stack", children: [
    creators.length > 0 ? /* @__PURE__ */ jsxs(View, { style: "search-block", children: [
      /* @__PURE__ */ jsx(Text, { style: "search-section-label", children: "Creators" }),
      creators.map((c) => /* @__PURE__ */ jsxs(View, { style: "search-row", children: [
        /* @__PURE__ */ jsx(
          Behavior,
          {
            href: `${baseUrl}/hyperview/creators/${c.id}/tab/books`
          }
        ),
        c.coverUrl ? /* @__PURE__ */ jsx(
          Image,
          {
            source: c.coverUrl,
            style: "search-avatar",
            "resize-mode": "cover"
          }
        ) : /* @__PURE__ */ jsx(View, { style: "search-avatar-placeholder" }),
        /* @__PURE__ */ jsxs(View, { style: "search-row-main", children: [
          /* @__PURE__ */ jsx(Text, { style: "search-row-title", children: c.displayName }),
          /* @__PURE__ */ jsx(Text, { style: "search-row-sub", children: c.type })
        ] }),
        c.status === "verified" ? /* @__PURE__ */ jsx(Text, { style: "search-verified", children: "\u2713" }) : null
      ] }, c.id))
    ] }) : null,
    books.length > 0 ? /* @__PURE__ */ jsxs(
      View,
      {
        style: creators.length > 0 ? "search-block-spaced" : "search-block",
        children: [
          /* @__PURE__ */ jsx(Text, { style: "search-section-label", children: "Books" }),
          books.map((b) => /* @__PURE__ */ jsxs(View, { style: "search-row", children: [
            /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/books/${b.id}/tab/book` }),
            b.coverUrl ? /* @__PURE__ */ jsx(
              Image,
              {
                source: b.coverUrl,
                style: "search-book-thumb",
                "resize-mode": "cover"
              }
            ) : /* @__PURE__ */ jsx(View, { style: "search-book-thumb-placeholder" }),
            /* @__PURE__ */ jsxs(View, { style: "search-row-main", children: [
              /* @__PURE__ */ jsx(Text, { style: "search-row-title", children: b.title }),
              b.artist ? /* @__PURE__ */ jsxs(Text, { style: "search-row-sub", children: [
                b.artist.displayName,
                b.publisher?.displayName ? ` \u2014 ${b.publisher.displayName}` : ""
              ] }) : null
            ] })
          ] }, b.id))
        ]
      }
    ) : null
  ] });
};
var SearchResults_default = HVSearchResults;
const hvSearchResultsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-results-stack",
      flexDirection: "column",
      paddingTop: 8,
      paddingLeft: 4,
      paddingRight: 4
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "search-block", flexDirection: "column" }),
  /* @__PURE__ */ jsx(Style, { id: "search-block-spaced", flexDirection: "column", marginTop: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-section-label",
      fontSize: 11,
      fontWeight: "600",
      color: "#45413a",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-row",
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-row-main",
      flex: 1,
      flexDirection: "column",
      marginLeft: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-row-title",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-row-sub",
      fontSize: 12,
      color: "#45413a",
      marginTop: 2,
      textTransform: "uppercase"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "search-avatar", width: 48, height: 48, borderRadius: 24 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-avatar-placeholder",
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "search-book-thumb", width: 48, height: 48, borderRadius: 0 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-book-thumb-placeholder",
      width: 48,
      height: 48,
      borderRadius: 0,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "search-verified",
      fontSize: 14,
      fontWeight: "700",
      color: "#a22c29"
    }
  )
] });
export {
  SearchResults_default as default,
  hvSearchResultsStyles
};
