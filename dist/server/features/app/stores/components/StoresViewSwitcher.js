import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const StoresViewSwitcher = ({
  currentView,
  basePath,
  query = "",
  city = "",
  country = ""
}) => {
  const sharedParams = { query, city, country };
  const gridHref = buildHref(basePath, { ...sharedParams, view: "grid" });
  const mapHref = buildHref(basePath, { ...sharedParams, view: "map" });
  return /* @__PURE__ */ jsxs("div", { class: "flex gap-2 mb-4", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: gridHref,
        "x-target": "stores-content",
        class: viewClass(currentView === "grid"),
        children: "Grid View"
      }
    ),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: mapHref,
        "x-target": "stores-content",
        class: viewClass(currentView === "map"),
        children: "Map View"
      }
    )
  ] });
};
var StoresViewSwitcher_default = StoresViewSwitcher;
const viewClass = (active) => `px-4 py-2 text-sm rounded border transition-colors ${active ? "border-accent bg-accent text-on-accent" : "border-outline hover:border-accent"}`;
function buildHref(basePath, params) {
  const search = new URLSearchParams();
  if (params.view !== "grid") search.set("view", params.view);
  if (params.query) search.set("query", params.query);
  if (params.city) search.set("city", params.city);
  if (params.country) search.set("country", params.country);
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}
export {
  StoresViewSwitcher_default as default
};
