import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Button from "../../../../../components/app/Button.js";
const BookImportResults = ({ results }) => {
  const created = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const createdBookIds = created.map((r) => r.bookId).filter(Boolean);
  return /* @__PURE__ */ jsxs("div", { class: "space-y-6", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Import complete" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Created ",
      created.length,
      " book",
      created.length === 1 ? "" : "s",
      failed.length > 0 ? ` (${failed.length} failed)` : "",
      "."
    ] }),
    createdBookIds.length > 0 && /* @__PURE__ */ jsxs("div", { class: "flex gap-4", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/dashboard/books/import/images?books=${createdBookIds.join(",")}`,
          children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Upload images for these books" })
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: "Skip and upload later" }) })
    ] }),
    created.length > 0 && /* @__PURE__ */ jsx("ul", { class: "list-disc pl-5 space-y-1", children: created.map((r) => /* @__PURE__ */ jsx("li", { children: r.bookId ? /* @__PURE__ */ jsx(Link, { href: `/dashboard/books/${r.bookId}`, children: r.title }) : r.title }, r.rowNumber)) }),
    failed.length > 0 && /* @__PURE__ */ jsxs("div", { class: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { class: "text-danger font-medium", children: "Failed rows" }),
      /* @__PURE__ */ jsx("ul", { class: "list-disc pl-5 space-y-1 text-sm text-danger", children: failed.map((r) => /* @__PURE__ */ jsxs("li", { children: [
        "Row ",
        r.rowNumber,
        ": ",
        r.title,
        " \u2014 ",
        r.error
      ] }, r.rowNumber)) })
    ] }),
    /* @__PURE__ */ jsx(Link, { href: "/dashboard", children: /* @__PURE__ */ jsx("span", { class: "underline", children: "Back to books overview" }) })
  ] });
};
var BookImportResults_default = BookImportResults;
export {
  BookImportResults_default as default
};
