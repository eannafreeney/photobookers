import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const AOTWForm = ({ options, week }) => {
  const alpineAttrs = {
    "x-data": `aotwForm`,
    "x-target": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value"
  };
  const action = `/dashboard/admin/planner/artist-of-the-week/${week}/create`;
  return /* @__PURE__ */ jsxs(FormPost, { ...alpineAttrs, action, className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(
      OptionsComboBox,
      {
        options,
        name: "form.creatorId",
        label: "Artist",
        required: true
      }
    ),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "weekStart", value: week }),
    /* @__PURE__ */ jsx(
      FormButtons,
      {
        buttonText: "Schedule",
        loadingText: "Scheduling...",
        showCancelButton: true
      }
    )
  ] });
};
var AOTWForm_default = AOTWForm;
export {
  AOTWForm_default as default
};
