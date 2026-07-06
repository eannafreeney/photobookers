import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import FileUploadInput from "../../../../../components/forms/FileUpload.js";
import { MAX_IMPORT_ROWS } from "../constants.js";
import BookImportPreviewTable from "./BookImportPreviewTable.js";
const BookImportForm = ({
  creatorType,
  previewResults,
  validRows
}) => {
  const hasPreview = !!previewResults;
  const validCount = previewResults?.filter((r) => r.valid).length ?? 0;
  const invalidCount = previewResults?.filter((r) => !r.valid).length ?? 0;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Upload CSV" }),
      /* @__PURE__ */ jsxs("p", { class: "text-on-surface-weak", children: [
        "Import up to ",
        MAX_IMPORT_ROWS,
        " books at once. Books are created as drafts \u2014 upload covers from the books table to publish."
      ] }),
      /* @__PURE__ */ jsxs("ul", { class: "list-disc pl-5 text-sm text-on-surface-weak space-y-1", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "title" }),
          " (required) \u2014 at least 3 characters"
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "description" }),
          ", ",
          /* @__PURE__ */ jsx("strong", { children: "release_date" }),
          " ",
          "(YYYY-MM-DD), ",
          /* @__PURE__ */ jsx("strong", { children: "tags" }),
          ", ",
          /* @__PURE__ */ jsx("strong", { children: "purchase_link" }),
          ",",
          " ",
          /* @__PURE__ */ jsx("strong", { children: "availability_status" }),
          " (available / sold_out / unavailable)"
        ] }),
        creatorType === "publisher" ? /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "artist" }),
          " (required) \u2014 artist display name per row"
        ] }) : /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { children: "publisher" }),
          " (optional) \u2014 leave blank for self-published"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/books/import/template", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: "Download template CSV" }) })
    ] }),
    !hasPreview && /* @__PURE__ */ jsxs(
      "form",
      {
        method: "post",
        action: "/dashboard/books/import",
        enctype: "multipart/form-data",
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: "preview" }),
          /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
            /* @__PURE__ */ jsx(
              FileUploadInput,
              {
                label: "Choose CSV file",
                name: "csv",
                accept: ".csv,text/csv",
                required: true,
                isVisible: true
              }
            ),
            /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", type: "submit", children: "Preview import" })
          ] })
        ]
      }
    ),
    hasPreview && /* @__PURE__ */ jsxs("div", { id: "import-preview", class: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("span", { class: "text-success", children: [
          validCount,
          " valid row",
          validCount === 1 ? "" : "s"
        ] }),
        invalidCount > 0 && /* @__PURE__ */ jsxs("span", { class: "text-danger", children: [
          invalidCount,
          " row",
          invalidCount === 1 ? "" : "s",
          " with errors"
        ] })
      ] }),
      /* @__PURE__ */ jsx(BookImportPreviewTable, { results: previewResults }),
      /* @__PURE__ */ jsxs("div", { class: "flex gap-4", children: [
        validRows && validRows.length > 0 && /* @__PURE__ */ jsxs("form", { method: "post", action: "/dashboard/books/import", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: "confirm" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "hidden",
              name: "rows_json",
              value: JSON.stringify(validRows)
            }
          ),
          /* @__PURE__ */ jsxs(Button, { variant: "solid", color: "primary", type: "submit", children: [
            "Confirm import (",
            validRows.length,
            " book",
            validRows.length === 1 ? "" : "s",
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: "/dashboard/books/import", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: "Upload a different file" }) })
      ] })
    ] })
  ] });
};
var BookImportForm_default = BookImportForm;
export {
  BookImportForm_default as default
};
