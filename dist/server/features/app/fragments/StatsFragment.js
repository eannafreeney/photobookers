import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getHomepageStats } from "../services.js";
const StatsFragment = async () => {
  const [error, stats] = await getHomepageStats();
  if (error) return /* @__PURE__ */ jsxs("div", { children: [
    "Error: ",
    error.reason
  ] });
  return /* @__PURE__ */ jsxs("div", { id: "stats-fragment", class: "flex items-center gap-4 justify-evenly", children: [
    /* @__PURE__ */ jsx("a", { href: "/publishers", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2 bg-surface shadow-sm", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          "x-data": `countUp(${stats.publishers})`,
          "x-init": "start()",
          "x-text": "display",
          class: "text-2xl font-semibold"
        }
      ),
      /* @__PURE__ */ jsx("p", { class: "text-sm text-gray-500", children: "Publishers" })
    ] }) }),
    /* @__PURE__ */ jsx("a", { href: "/artists", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2 bg-surface shadow-sm", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          "x-data": `countUp(${stats.artists})`,
          "x-init": "start()",
          "x-text": "display",
          class: "text-2xl font-semibold"
        }
      ),
      /* @__PURE__ */ jsx("p", { class: "text-sm text-gray-500", children: "Artists" })
    ] }) }),
    /* @__PURE__ */ jsx("a", { href: "/books", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2 bg-surface shadow-sm", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          "x-data": `countUp(${stats.books})`,
          "x-init": "start()",
          "x-text": "display",
          class: "text-2xl font-semibold"
        }
      ),
      /* @__PURE__ */ jsx("p", { class: "text-sm text-gray-500", children: "Books" })
    ] }) })
  ] });
};
var StatsFragment_default = StatsFragment;
export {
  StatsFragment_default as default
};
