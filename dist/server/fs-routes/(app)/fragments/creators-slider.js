import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getTopCreatorsByViews } from "../../../features/creator-views/services.js";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider.js";
import SectionHeader from "../../../components/app/SectionHeader.js";
import ViewAllLink from "../../../features/app/components/ViewAllLink.js";
import Button from "../../../components/app/Button.js";
import { findFollowedCreatorIds } from "../../../db/queries.js";
import { getUser } from "../../../utils.js";
const TRENDING_CREATORS_LIMIT = 20;
const GET = createRoute(async (c) => {
  const [[err, creators], user] = await Promise.all([
    getTopCreatorsByViews(TRENDING_CREATORS_LIMIT),
    getUser(c)
  ]);
  if (err || !creators || creators.length === 0) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  const followedCreatorIds = user?.id ? await findFollowedCreatorIds(
    user.id,
    creators.map((creator) => creator.id)
  ) : /* @__PURE__ */ new Set();
  return c.html(
    /* @__PURE__ */ jsxs("div", { id: "creators-slider-fragment", children: [
      /* @__PURE__ */ jsx(SectionHeader, { kicker: "The People", action: /* @__PURE__ */ jsx(ViewAllLink, { href: "/creators" }), children: "Trending Creators" }),
      /* @__PURE__ */ jsx(
        CreatorsSlider,
        {
          creators,
          user,
          followedCreatorIds,
          showFollow: true
        }
      ),
      /* @__PURE__ */ jsx("div", { class: " mt-8 flex md:hidden justify-center", children: /* @__PURE__ */ jsx("a", { href: "/creators", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Creators \u2192" }) }) })
    ] })
  );
});
export {
  GET
};
