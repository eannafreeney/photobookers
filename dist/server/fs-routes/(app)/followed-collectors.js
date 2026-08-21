import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import InfoPage from "../../pages/InfoPage.js";
import { getFollowedCollectors } from "../../domain/collectors/services.js";
import CollectorCircle from "../../features/app/components/CollectorCircle.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user?.id) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const [err, collectors] = await getFollowedCollectors(user.id);
  if (err) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: err.reason, user }));
  const results = collectors ?? [];
  const title = "Collectors I Follow";
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title, user, noIndex: true, children: /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(PageHeader, { kicker: "Your People", title }),
      results.length === 0 ? /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface", children: [
        "You're not following any public collectors yet.",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/creators?type=collector",
            class: "text-accent underline underline-offset-2",
            children: "Discover collectors"
          }
        )
      ] }) : /* @__PURE__ */ jsx("ul", { class: "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", children: results.map((collector) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(CollectorCircle, { collector }) })) })
    ] }) })
  );
});
export {
  GET
};
