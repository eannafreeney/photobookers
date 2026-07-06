import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../lib/hxml.js";
import { Style, Text, View, Image, Behavior } from "../../../lib/hxml-comps.js";
import { AppLayout } from "../+layout.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { getRecentArtistsOfTheWeek } from "../../../features/app/AOTWServices.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import { aotwPath } from "../../../features/app/spotlightUrls.js";
import { formatOrdinalDate } from "../../../lib/utils.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, result] = await getRecentArtistsOfTheWeek();
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  const entries = result?.aotwEntries ?? [];
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Artists of the Week",
        baseUrl,
        user,
        showDock: true,
        fixedHeader: true,
        extraStyles: pageStyles(),
        children: /* @__PURE__ */ jsx(View, { style: "page-content", children: entries.length > 0 ? entries.map((entry) => /* @__PURE__ */ jsxs(View, { style: "spotlight-entry", children: [
          entry.creator.coverUrl ? /* @__PURE__ */ jsx(Image, { source: entry.creator.coverUrl, style: "spotlight-cover" }) : null,
          /* @__PURE__ */ jsx(Text, { style: "spotlight-date", children: `WEEK OF ${formatOrdinalDate(entry.weekStart).toUpperCase()}` }),
          /* @__PURE__ */ jsx(Text, { style: "spotlight-title", children: entry.creator.displayName }),
          /* @__PURE__ */ jsxs(View, { style: "spotlight-btn", children: [
            /* @__PURE__ */ jsx(Text, { style: "spotlight-btn-label", children: "View" }),
            /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview${aotwPath(entry.weekStart)}` })
          ] })
        ] })) : /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No artists of the week yet." }) })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-entry", gap: 8, marginBottom: 16 }),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-cover", width: "100%", height: 280 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-date",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1.5,
      color: "#a22c29"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-title", fontFamily: "Fraunces-Medium", fontSize: 20 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-btn",
      borderWidth: 1,
      borderColor: "#191613",
      paddingTop: 10,
      paddingBottom: 10,
      alignItems: "center"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "spotlight-btn-label", fontSize: 14, fontWeight: "600", color: "#191613" })
] });
export {
  GET
};
