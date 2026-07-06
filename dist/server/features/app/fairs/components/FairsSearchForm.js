import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import CollapsibleFilters from "../../components/CollapsibleFilters.js";
const FairsSearchForm = ({
  query = "",
  city = "",
  country = "",
  startDate = "",
  endDate = "",
  baseUrl
}) => {
  const activeFilterCount = [query, city, country, startDate, endDate].filter(
    (value) => value.trim().length > 0
  ).length;
  return /* @__PURE__ */ jsx("form", { method: "get", action: baseUrl, class: "mb-6", children: /* @__PURE__ */ jsxs(
    CollapsibleFilters,
    {
      activeFilterCount,
      controlsId: "fairs-search-filters",
      desktopGridClass: "md:grid-cols-2 lg:grid-cols-5",
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
              placeholder: "Name, venue...",
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
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "country",
              name: "country",
              value: country,
              placeholder: "e.g., France",
              class: "px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              for: "startDate",
              class: "text-sm font-medium text-on-surface-strong",
              children: "From Date"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              id: "startDate",
              name: "startDate",
              value: startDate,
              class: "px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              for: "endDate",
              class: "text-sm font-medium text-on-surface-strong",
              children: "To Date"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              id: "endDate",
              name: "endDate",
              value: endDate,
              class: "px-3 py-2 text-sm border border-outline rounded bg-surface text-on-surface focus:border-accent focus:outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "lg:col-span-5 flex gap-2", children: [
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
  ) });
};
var FairsSearchForm_default = FairsSearchForm;
export {
  FairsSearchForm_default as default
};
