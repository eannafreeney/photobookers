import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { capitalize } from "../../../../../utils.js";
const BookStatusForm = ({ status }) => {
  return /* @__PURE__ */ jsxs(
    "form",
    {
      action: "/dashboard/admin/books/books-table-filter",
      "x-target": "books-table-container",
      class: "w-full flex items-center justify-center gap-2",
      children: [
        /* @__PURE__ */ jsx(FilterButton, { status, value: "approved" }),
        /* @__PURE__ */ jsx(FilterButton, { status, value: "pending" }),
        /* @__PURE__ */ jsx(FilterButton, { status, value: "rejected" }),
        status !== void 0 && /* @__PURE__ */ jsx(FilterButton, { status, value: "reset" })
      ]
    }
  );
};
var BookStatusForm_default = BookStatusForm;
const FilterButton = ({ status, value }) => {
  return /* @__PURE__ */ jsx(
    "button",
    {
      class: `cursor-pointer px-4 py-1.5 rounded-full border-2 kicker transition-colors ${status === value ? "bg-on-surface-strong text-surface border-on-surface-strong" : "bg-surface text-on-surface-strong border-outline-strong hover:bg-on-surface-strong hover:text-surface"}`,
      name: "status",
      value,
      "aria-pressed": status === value,
      children: capitalize(value)
    }
  );
};
export {
  BookStatusForm_default as default
};
