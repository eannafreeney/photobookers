import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
const SiteTrafficEmptyTable = ({
  title,
  columns,
  emptyMessage
}) => /* @__PURE__ */ jsxs("div", { children: [
  /* @__PURE__ */ jsx(SectionTitle, { children: title }),
  /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
    /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsx("tr", { children: columns.map((column) => /* @__PURE__ */ jsx(Table.HeadRow, { children: column }, column)) }) }),
    /* @__PURE__ */ jsx(Table.Body, { children: /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
      "td",
      {
        colspan: columns.length,
        class: "px-4 py-2 text-sm text-on-surface",
        children: emptyMessage
      }
    ) }) })
  ] }) })
] });
const siteTrafficDisclaimer = "Web traffic from Google Analytics; may undercount due to ad blockers.";
export {
  SiteTrafficEmptyTable,
  siteTrafficDisclaimer
};
