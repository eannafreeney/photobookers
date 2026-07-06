import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { capitalize } from "../../../../../utils.js";
const CreatorTypeForm = ({ type }) => {
  return /* @__PURE__ */ jsxs(
    "form",
    {
      action: "/dashboard/admin/creators/creators-table-filter",
      "x-target": "creators-table-container",
      class: "w-full flex items-center justify-center gap-2",
      children: [
        /* @__PURE__ */ jsx(FilterButton, { type, value: "artist" }),
        /* @__PURE__ */ jsx(FilterButton, { type, value: "publisher" }),
        type !== void 0 && /* @__PURE__ */ jsx(FilterButton, { type, value: "reset" })
      ]
    }
  );
};
var CreatorTypeForm_default = CreatorTypeForm;
const FilterButton = ({ type, value }) => {
  return /* @__PURE__ */ jsx(
    "button",
    {
      class: `cursor-pointer px-2 py-1 rounded-radius border border-outline ${type === value ? "bg-primary text-on-primary" : ""}`,
      name: "type",
      value,
      "aria-pressed": type === value,
      children: capitalize(value)
    }
  );
};
export {
  CreatorTypeForm_default as default
};
