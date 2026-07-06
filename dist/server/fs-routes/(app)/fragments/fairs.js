import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import {
  getUpcomingFairs,
  getCurrentFairs
} from "../../../features/app/fairs/services.js";
import FairsSlider from "../../../features/app/fairs/components/FairsSlider.js";
import FairsGrid from "../../../features/app/fairs/components/FairsGrid.js";
import Button from "../../../components/app/Button.js";
const FEATURED_FAIRS_LIMIT = 5;
const GET = createRoute(async (c) => {
  const [[upcomingError, upcomingFairs], [currentError, currentFairs]] = await Promise.all([
    getUpcomingFairs(1, FEATURED_FAIRS_LIMIT),
    getCurrentFairs(1, FEATURED_FAIRS_LIMIT)
  ]);
  if (upcomingError || currentError) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  const seen = /* @__PURE__ */ new Set();
  const allFairs = [
    ...currentFairs?.fairs ?? [],
    ...upcomingFairs?.fairs ?? []
  ].filter((fair) => {
    if (seen.has(fair.id)) return false;
    seen.add(fair.id);
    return true;
  }).slice(0, FEATURED_FAIRS_LIMIT);
  if (allFairs.length === 0) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "fairs-fragment", children: [
      /* @__PURE__ */ jsx("div", { class: "mb-6 mt-12 border-t-2 border-on-surface-strong pt-3", children: /* @__PURE__ */ jsxs("div", { class: "mr-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "Days Out!", children: "Book Fairs" }),
        /* @__PURE__ */ jsx(ViewAllLink, { href: "/fairs" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { class: "sm:hidden", children: /* @__PURE__ */ jsx(FairsSlider, { fairs: allFairs }) }),
      /* @__PURE__ */ jsx("div", { class: "hidden sm:block", children: /* @__PURE__ */ jsx(
        FairsGrid,
        {
          fairs: allFairs,
          page: 1,
          totalPages: 1,
          baseUrl: "/fairs",
          targetId: "fairs-fragment-grid"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { class: "mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/fairs", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Fairs \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
