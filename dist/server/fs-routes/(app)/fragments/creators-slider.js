import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getTopCreatorsByViews } from "../../../features/creator-views/services.js";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import Button from "../../../components/app/Button.js";
const TRENDING_CREATORS_LIMIT = 20;
const GET = createRoute(async (c) => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);
  if (err || !creators || creators.length === 0) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "creators-slider-fragment", children: [
      /* @__PURE__ */ jsx("div", { class: "mb-6 border-t-2 border-on-surface-strong pt-3", children: /* @__PURE__ */ jsxs("div", { class: "mr-6 flex items-end justify-between", children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "The People", children: "Trending Creators" }),
        /* @__PURE__ */ jsx(ViewAllLink, { href: "/creators" })
      ] }) }),
      /* @__PURE__ */ jsx(CreatorsSlider, { creators }),
      /* @__PURE__ */ jsx("div", { class: " mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/creators", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Creators \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
