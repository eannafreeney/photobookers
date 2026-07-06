import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getHomepageStats } from "../../../features/app/services.js";
import { capitalize } from "../../../utils.js";
const GET = createRoute(async (c) => {
  const [statsError, statsResult] = await getHomepageStats();
  if (statsError) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  const { books, artists, publishers } = statsResult;
  if (!books || !artists || !publishers) return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  return c.html(
    /* @__PURE__ */ jsx("div", { id: "stats-fragment", class: "flex flex-col", children: /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6", children: [
      /* @__PURE__ */ jsx(StatsCard, { entity: "books", count: books, href: "/books" }),
      /* @__PURE__ */ jsx(StatsCard, { entity: "artists", count: artists, href: "/artists" }),
      /* @__PURE__ */ jsx(StatsCard, { entity: "publishers", count: publishers, href: "/publishers" })
    ] }) })
  );
});
const StatsCard = ({ entity, count, href }) => /* @__PURE__ */ jsxs(
  "a",
  {
    href,
    class: "group mx-auto flex w-full flex-col gap-1 border-t-2 border-on-surface-strong pt-3 md:min-w-50",
    children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: capitalize(entity) }),
      /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "x-data": `countUp(${count})`,
            "x-init": "start()",
            "x-text": "display",
            class: "font-display text-5xl font-medium text-on-surface-strong"
          }
        ),
        /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak group-hover:text-on-surface-strong transition-colors", children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center", children: [
          "View All",
          /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap", children: "\xA0\u2192" })
        ] }) })
      ] })
    ]
  }
);
export {
  GET
};
