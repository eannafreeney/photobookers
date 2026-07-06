import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../../lib/hxml-comps.js";
import { botdPath } from "../../../app/spotlightUrls.js";
import { formatOrdinalDate } from "../../../../lib/utils.js";
const ThisWeekBookEntry = ({ entry, baseUrl }) => {
  const { book } = entry;
  const href = `${baseUrl}/hyperview${botdPath(entry.date)}`;
  return /* @__PURE__ */ jsxs(View, { style: "spotlight-botd-entry", children: [
    book.coverUrl ? /* @__PURE__ */ jsx(
      Image,
      {
        source: book.coverUrl,
        style: "spotlight-botd-cover",
        "resize-mode": "cover"
      }
    ) : /* @__PURE__ */ jsx(View, { style: "spotlight-botd-cover" }),
    /* @__PURE__ */ jsxs(View, { style: "spotlight-botd-text", children: [
      /* @__PURE__ */ jsx(Text, { style: "spotlight-botd-date", children: formatOrdinalDate(entry.date).toUpperCase() }),
      /* @__PURE__ */ jsx(Text, { style: "spotlight-botd-title", children: book.title }),
      book.artist ? /* @__PURE__ */ jsx(Text, { style: "spotlight-botd-artist", children: book.artist.displayName }) : null,
      /* @__PURE__ */ jsxs(View, { style: "spotlight-botd-btn", children: [
        /* @__PURE__ */ jsx(Text, { style: "spotlight-botd-btn-label", children: "View" }),
        /* @__PURE__ */ jsx(Behavior, { href })
      ] })
    ] })
  ] });
};
var ThisWeekBookEntry_default = ThisWeekBookEntry;
const thisWeekBookEntryStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-entry",
      flexDirection: "row",
      gap: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#e4e0d5",
      borderRadius: 0,
      marginBottom: 12,
      backgroundColor: "#fbfaf7"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-cover",
      width: 96,
      height: 128,
      borderRadius: 0,
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-botd-text", flex: 1, gap: 4 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-date",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1.5,
      color: "#a22c29"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-title",
      fontFamily: "Fraunces-Medium",
      fontSize: 16,
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-botd-artist", fontSize: 13, color: "#45413a" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-teaser",
      fontSize: 12,
      color: "#45413a",
      lineHeight: 18
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-btn",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      paddingTop: 8,
      paddingBottom: 8,
      alignItems: "center",
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-botd-btn-label",
      fontSize: 13,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  ThisWeekBookEntry_default as default,
  thisWeekBookEntryStyles
};
