import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const BookOfTheDayForm = ({ formValues, options, date }) => {
  const isEditMode = !!formValues;
  const alpineAttrs = {
    "x-data": `bookOfTheDayForm(${JSON.stringify(formValues)}, ${isEditMode})`,
    "x-target": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "x-on:form-field-update": "form[$event.detail.field] = $event.detail.value"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      ...alpineAttrs,
      method: "post",
      action: `/dashboard/admin/planner/book-of-the-day/${date}/create`,
      class: "flex flex-col gap-4",
      children: [
        /* @__PURE__ */ jsx(
          OptionsComboBox,
          {
            options,
            name: "form.bookId",
            label: "Book",
            required: true,
            initialSelectedId: formValues?.bookId
          }
        ),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "date", value: date }),
        /* @__PURE__ */ jsx(FormButtons, { buttonText: "Schedule", loadingText: "Scheduling..." })
      ]
    }
  );
};
var BookOfTheDayForm_default = BookOfTheDayForm;
export {
  BookOfTheDayForm_default as default
};
