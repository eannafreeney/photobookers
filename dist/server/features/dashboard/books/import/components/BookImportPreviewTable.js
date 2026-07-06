import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Table from "../../../../../components/app/Table.js";
const BookImportPreviewTable = ({ results }) => {
  return /* @__PURE__ */ jsxs(Table, { id: "import-preview-table", children: [
    /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Row" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Release" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Details" })
    ] }) }),
    /* @__PURE__ */ jsx(Table.Body, { children: results.map((result) => /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx(Table.BodyRow, { children: result.rowNumber }),
      /* @__PURE__ */ jsx(Table.BodyRow, { children: result.row.title ?? "\u2014" }),
      /* @__PURE__ */ jsx(Table.BodyRow, { children: result.row.artist ?? "\u2014" }),
      /* @__PURE__ */ jsx(Table.BodyRow, { children: result.row.publisher ?? "\u2014" }),
      /* @__PURE__ */ jsx(Table.BodyRow, { children: result.row.release_date ?? "\u2014" }),
      /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: result.valid ? "text-success" : "text-danger", children: result.valid ? "OK" : "Error" }) }),
      /* @__PURE__ */ jsx(Table.BodyRow, { children: result.errors.length > 0 ? /* @__PURE__ */ jsx("span", { class: "text-danger text-sm", children: result.errors.join("; ") }) : /* @__PURE__ */ jsx("span", { class: "text-on-surface-weak text-sm", children: "Ready to import" }) })
    ] }, result.rowNumber)) })
  ] });
};
var BookImportPreviewTable_default = BookImportPreviewTable;
export {
  BookImportPreviewTable_default as default
};
