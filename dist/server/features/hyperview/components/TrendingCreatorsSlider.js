import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getTopCreatorsByViews } from "../../creator-views/services.js";
import { ScrollView, Style, View } from "../../../lib/hxml-comps.js";
import SectionHeader from "./SectionHeader.js";
import { verificationBadgeStyles } from "./VerificationBadge.js";
import CreatorCircle, { creatorCircleStyles } from "./CreatorCirle.js";
const TRENDING_CREATORS_LIMIT = 20;
const TrendingCreatorsSlider = async ({ baseUrl }) => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);
  if (err || !creators?.length) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(View, { style: "trending-creators-section", children: [
    /* @__PURE__ */ jsx(
      SectionHeader,
      {
        title: "Trending Creators",
        viewAllHref: `${baseUrl}/hyperview/creators`
      }
    ),
    /* @__PURE__ */ jsx(
      ScrollView,
      {
        style: "trending-creators-scroll",
        horizontal: "true",
        "shows-scroll-indicator": "false",
        children: creators.map((creator) => /* @__PURE__ */ jsx(CreatorCircle, { creator, baseUrl }, creator.id))
      }
    )
  ] });
};
var TrendingCreatorsSlider_default = TrendingCreatorsSlider;
const trendingCreatorsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "trending-creators-section",
      flexDirection: "column",
      gap: 0,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "trending-creators-scroll", flexDirection: "row", marginTop: 12 }),
  verificationBadgeStyles(),
  creatorCircleStyles()
] });
export {
  TRENDING_CREATORS_LIMIT,
  TrendingCreatorsSlider_default as default,
  trendingCreatorsStyles
};
