import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
const AppAnalyticsCountriesTable = ({ data }) => {
  const { topCountries } = data;
  if (topCountries.length === 0) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Top countries" }),
      /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface shadow-sm", children: "No country download data for this period." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Top countries" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Country" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Downloads" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "First-time" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Redownloads" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: topCountries.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.countryCode }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.downloads.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.firstTimeDownloads.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.redownloads.toLocaleString() })
      ] }, row.countryCode)) })
    ] }) })
  ] });
};
var AppAnalyticsCountriesTable_default = AppAnalyticsCountriesTable;
export {
  AppAnalyticsCountriesTable_default as default
};
