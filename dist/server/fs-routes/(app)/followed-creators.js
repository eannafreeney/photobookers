import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import SectionTitle from "../../components/app/SectionTitle.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import Divider from "../../components/Divider.js";
import InfoPage from "../../pages/InfoPage.js";
import { getFollowedCreators } from "../../features/app/services.js";
import CreatorsCircle from "../../features/app/components/CreatorsCircle.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const [err, result] = await getFollowedCreators(user.id);
  if (err) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: err.reason }));
  const { artists, publishers } = result;
  const title = "Creators I Follow";
  const alpineAttrs = {
    "x-init": "true",
    "@followed-creators:updated.window": "$ajax('/followed-creators', { target: 'followed-creators-grid' })"
  };
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title, user, noIndex: true, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { id: "followed-creators-grid", class: "space-y-6", ...alpineAttrs, children: [
      /* @__PURE__ */ jsx(PageHeader, { kicker: "Your People", title }),
      /* @__PURE__ */ jsx(FollowedCreatorsGrid, { creators: artists, title: "Artists" }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(FollowedCreatorsGrid, { creators: publishers, title: "Publishers" })
    ] }) }) })
  );
});
const FollowedCreatorsGrid = ({ creators, title }) => {
  if (creators.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: title }),
    /* @__PURE__ */ jsx("div", { class: "grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6", children: creators.map((creator) => /* @__PURE__ */ jsx(CreatorsCircle, { creator })) })
  ] });
};
export {
  GET
};
