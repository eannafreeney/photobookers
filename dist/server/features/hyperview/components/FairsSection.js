import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { ScrollView, Style, View } from "../../../lib/hxml-comps.js";
import { getCurrentFairs, getUpcomingFairs } from "../../app/fairs/services.js";
import FairCard, { fairCardStyles } from "./FairCard.js";
import SectionHeader, { sectionHeaderStyles } from "./SectionHeader.js";
const FEATURED_FAIRS_LIMIT = 5;
const FairsSection = async ({ baseUrl }) => {
  const [[upcomingError, upcomingResult], [currentError, currentResult]] = await Promise.all([
    getUpcomingFairs(1, FEATURED_FAIRS_LIMIT),
    getCurrentFairs(1, FEATURED_FAIRS_LIMIT)
  ]);
  if (upcomingError || currentError) return /* @__PURE__ */ jsx(Fragment, {});
  const seen = /* @__PURE__ */ new Set();
  const allFairs = [
    ...currentResult?.fairs ?? [],
    ...upcomingResult?.fairs ?? []
  ].filter((fair) => {
    if (seen.has(fair.id)) return false;
    seen.add(fair.id);
    return true;
  }).slice(0, FEATURED_FAIRS_LIMIT);
  if (allFairs.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(View, { style: "fairs-section", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Book Fairs",
        viewAllHref: `${baseUrl}/hyperview/fairs`
      }
    ),
    /* @__PURE__ */ jsx(
      ScrollView,
      {
        style: "fairs-scroll",
        horizontal: "true",
        "shows-scroll-indicator": "false",
        children: allFairs.map((fair) => /* @__PURE__ */ jsx(
          FairCard,
          {
            fair,
            href: `${baseUrl}/hyperview/fairs/${fair.slug}`
          },
          fair.id
        ))
      }
    )
  ] });
};
var FairsSection_default = FairsSection;
const fairsSectionStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  sectionHeaderStyles(),
  fairCardStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fairs-section",
      flexDirection: "column",
      gap: 12,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "fairs-scroll", flexDirection: "row" })
] });
export {
  FairsSection_default as default,
  fairsSectionStyles
};
