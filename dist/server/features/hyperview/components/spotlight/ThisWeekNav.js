import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, View } from "../../../../lib/hxml-comps.js";
import { toWeekStart, toWeekString } from "../../../../lib/utils.js";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles
} from "../SecondaryButtonLink.js";
const ThisWeekNav = ({ baseUrl, weekStart }) => {
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7);
  const canGoNext = nextWeekStart.getTime() <= toWeekStart(/* @__PURE__ */ new Date()).getTime();
  return /* @__PURE__ */ jsxs(View, { style: "spotlight-week-nav", children: [
    /* @__PURE__ */ jsx(
      SecondaryButtonLink,
      {
        label: "\u2190 Previous week",
        href: `${baseUrl}/hyperview/this-week?week=${toWeekString(prevWeekStart)}`
      }
    ),
    canGoNext ? /* @__PURE__ */ jsx(
      SecondaryButtonLink,
      {
        label: "Next week \u2192",
        href: `${baseUrl}/hyperview/this-week?week=${toWeekString(nextWeekStart)}`
      }
    ) : /* @__PURE__ */ jsx(
      SecondaryButtonLink,
      {
        isDisabled: true,
        label: "Next week \u2192",
        href: `${baseUrl}/hyperview/this-week?week=${toWeekString(nextWeekStart)}`
      }
    )
  ] });
};
var ThisWeekNav_default = ThisWeekNav;
const thisWeekNavStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-week-nav",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 16,
      marginTop: 8,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: "#e4e0d5"
    }
  ),
  secondaryButtonLinkStyles()
] });
export {
  ThisWeekNav_default as default,
  thisWeekNavStyles
};
