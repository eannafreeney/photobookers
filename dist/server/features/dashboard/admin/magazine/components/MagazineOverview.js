import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import ThemeGenerator from "./ThemeGenerator.js";
import MagazineTable from "./MagazineTable.js";
const MagazineOverview = ({ issues }) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Admin" }),
      /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium text-on-surface-strong", children: "Magazine" }),
      /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Generate a themed draft from the catalogue, prune it, then approve and assign it an issue number." })
    ] }),
    /* @__PURE__ */ jsx(ThemeGenerator, {}),
    /* @__PURE__ */ jsx(MagazineTable, { issues })
  ] });
};
var MagazineOverview_default = MagazineOverview;
export {
  MagazineOverview_default as default
};
