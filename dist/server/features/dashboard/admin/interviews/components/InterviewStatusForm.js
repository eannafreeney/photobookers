import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { capitalize } from "../../../../../utils.js";
const InterviewStatusForm = ({ statusType }) => {
  return /* @__PURE__ */ jsxs(
    "form",
    {
      action: "/dashboard/admin/interviews/interviews-table-filter",
      "x-target": "interviews-table-container",
      class: "w-full flex items-center justify-center gap-2",
      children: [
        /* @__PURE__ */ jsx(FilterButton, { statusType, value: "published" }),
        /* @__PURE__ */ jsx(FilterButton, { statusType, value: "sent" }),
        /* @__PURE__ */ jsx(FilterButton, { statusType, value: "completed" }),
        /* @__PURE__ */ jsx(FilterButton, { statusType, value: "expired" }),
        statusType !== void 0 && /* @__PURE__ */ jsx(FilterButton, { statusType, value: "reset" })
      ]
    }
  );
};
var InterviewStatusForm_default = InterviewStatusForm;
const FilterButton = ({ statusType, value }) => {
  return /* @__PURE__ */ jsx(
    "button",
    {
      class: `cursor-pointer px-2 py-1 rounded-radius border border-outline ${statusType === value ? "bg-primary text-on-primary" : ""}`,
      name: "statusType",
      value,
      "aria-pressed": statusType === value,
      children: capitalize(value)
    }
  );
};
export {
  InterviewStatusForm_default as default
};
