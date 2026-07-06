import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const POTWForm = ({ formValues, options, week }) => {
  const isEditMode = !!formValues;
  const alpineAttrs = {
    "x-data": `aotwForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value"
  };
  const action = `/dashboard/admin/planner/publisher-of-the-week/${week}/create`;
  return /* @__PURE__ */ jsxs(
    "form",
    {
      ...alpineAttrs,
      action,
      method: "post",
      class: "flex flex-col gap-4",
      children: [
        /* @__PURE__ */ jsx(
          OptionsComboBox,
          {
            options,
            name: "form.creatorId",
            label: "Publisher",
            required: true
          }
        ),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "weekStart", value: week }),
        /* @__PURE__ */ jsx(
          FormButtons,
          {
            buttonText: isEditMode ? "Update" : "Schedule",
            loadingText: isEditMode ? "Updating..." : "Scheduling...",
            showCancelButton: true
          }
        )
      ]
    }
  );
};
var POTWForm_default = POTWForm;
export {
  POTWForm_default as default
};
