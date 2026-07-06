import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import CollapsibleFilters from "../../components/CollapsibleFilters.js";
const StoresSearchForm = ({
  query = "",
  city = "",
  country = "",
  countries,
  baseUrl,
  view = "grid"
}) => {
  const activeFilterCount = [query, city, country].filter(
    (value) => value.trim().length > 0
  ).length;
  return /* @__PURE__ */ jsxs("form", { method: "get", action: baseUrl, class: "mb-6", children: [
    view === "map" ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "view", value: "map" }) : null,
    /* @__PURE__ */ jsxs(
      CollapsibleFilters,
      {
        activeFilterCount,
        controlsId: "stores-search-filters",
        desktopGridClass: "md:grid-cols-2 lg:grid-cols-4",
        children: [
          /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx("label", { for: "query", class: "text-sm font-medium text-on-surface-strong", children: "Search" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "query",
                name: "query",
                value: query,
                placeholder: "Name, address...",
                class: "px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx("label", { for: "city", class: "text-sm font-medium text-on-surface-strong", children: "City" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "city",
                name: "city",
                value: city,
                placeholder: "e.g., Paris",
                class: "px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                for: "country",
                class: "text-sm font-medium text-on-surface-strong",
                children: "Country"
              }
            ),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "country",
                name: "country",
                class: "px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All countries" }),
                  countries.map((countryName) => /* @__PURE__ */ jsx(
                    "option",
                    {
                      value: countryName,
                      selected: country === countryName,
                      children: countryName
                    },
                    countryName
                  ))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { class: "flex items-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                class: "px-6 py-2 text-sm font-medium rounded bg-accent text-on-accent hover:bg-accent/90 transition-colors",
                children: "Search"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: baseUrl,
                class: "px-6 py-2 text-sm font-medium rounded border border-outline hover:border-accent transition-colors",
                children: "Clear"
              }
            )
          ] })
        ]
      }
    )
  ] });
};
var StoresSearchForm_default = StoresSearchForm;
export {
  StoresSearchForm_default as default
};
