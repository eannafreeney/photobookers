import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, Text, View } from "../../../lib/hxml-comps.js";
import {
  visibleHomepageActivityParts
} from "../../app/homepageActivityVisibility.js";
const HomepageActivityPulse = ({
  bookViews,
  profileViews
}) => {
  const { showBooks, showProfiles } = visibleHomepageActivityParts({
    bookViews,
    profileViews
  });
  if (!showBooks && !showProfiles) return null;
  return /* @__PURE__ */ jsx(View, { style: "homepage-activity-pulse", children: /* @__PURE__ */ jsxs(Text, { style: "homepage-activity-pulse-text", children: [
    "This week:",
    " ",
    showBooks ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { style: "homepage-activity-pulse-emphasis", children: bookViews.toLocaleString() }),
      " book views"
    ] }) : null,
    showBooks && showProfiles ? " and " : null,
    showProfiles ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Text, { style: "homepage-activity-pulse-emphasis", children: profileViews.toLocaleString() }),
      " creator profile views"
    ] }) : null,
    "."
  ] }) });
};
var HomepageActivityPulse_default = HomepageActivityPulse;
const homepageActivityPulseStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "homepage-activity-pulse", paddingHorizontal: 16, width: "100%" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "homepage-activity-pulse-text",
      fontSize: 13,
      color: "#45413a",
      textAlign: "center",
      lineHeight: 18,
      width: "100%"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "homepage-activity-pulse-emphasis",
      fontSize: 13,
      fontWeight: "600",
      color: "#191613",
      lineHeight: 18
    }
  )
] });
export {
  HomepageActivityPulse_default as default,
  homepageActivityPulseStyles
};
