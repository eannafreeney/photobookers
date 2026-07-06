import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  visibleHomepageActivityParts
} from "../homepageActivityVisibility.js";
const HomepageActivityPulse = ({
  bookViews,
  profileViews
}) => {
  const { showBooks, showProfiles } = visibleHomepageActivityParts({
    bookViews,
    profileViews
  });
  if (!showBooks && !showProfiles) return null;
  return /* @__PURE__ */ jsxs("p", { class: "text-center text-sm text-on-surface text-pretty", children: [
    showBooks ? /* @__PURE__ */ jsxs(Fragment, { children: [
      " ",
      /* @__PURE__ */ jsx("span", { class: "font-semibold text-on-surface-strong", children: bookViews.toLocaleString() }),
      " ",
      "book views"
    ] }) : null,
    showBooks && showProfiles ? "," : null,
    showProfiles ? /* @__PURE__ */ jsxs(Fragment, { children: [
      " ",
      /* @__PURE__ */ jsx("span", { class: "font-semibold text-on-surface-strong", children: profileViews.toLocaleString() }),
      " ",
      "artist & publisher profile visits"
    ] }) : null,
    " ",
    "so far this week."
  ] });
};
var HomepageActivityPulse_default = HomepageActivityPulse;
export {
  HomepageActivityPulse_default as default
};
