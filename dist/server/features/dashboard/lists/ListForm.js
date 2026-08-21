import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../components/forms/FormButtons.js";
import FormPost from "../../../components/forms/FormPost.js";
import Input from "../../../components/forms/Input.js";
import TextArea from "../../../components/forms/TextArea.js";
import ToggleInput from "../../../components/forms/ToggleInput.js";
const ListForm = ({ formValues, listId, disabled = false }) => {
  const isEditPage = !!listId;
  const action = isEditPage ? `/dashboard/lists/${listId}` : "/dashboard/lists";
  const alpineAttrs = disabled ? {
    "x-data": `listForm(${JSON.stringify(formValues ?? {})}, ${isEditPage})`,
    "x-on:submit.prevent": ""
  } : {
    "x-data": `listForm(${JSON.stringify(formValues ?? {})}, ${isEditPage})`,
    "x-on:submit": "submitForm($event)",
    "x-target": isEditPage ? "toast list-form-panel list-share-panel" : "toast",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      id: isEditPage ? "list-form-panel" : "list-create-form",
      action,
      class: "flex flex-col gap-4 max-w-xl",
      ...alpineAttrs,
      children: [
        isEditPage ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "PATCH" }) : null,
        /* @__PURE__ */ jsxs(
          "fieldset",
          {
            disabled,
            class: `flex flex-col gap-4 ${disabled ? "opacity-50" : ""}`,
            children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  label: "Title",
                  name: "form.title",
                  maxLength: 255,
                  validateInput: "validateField('title')",
                  placeholder: "Favourite books of the year",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                TextArea,
                {
                  label: "Description",
                  name: "form.description",
                  maxLength: 2e3,
                  minRows: 4,
                  validateInput: "validateField('description')",
                  placeholder: "Optional notes about this list"
                }
              ),
              isEditPage ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    label: "URL slug",
                    name: "form.slug",
                    maxLength: 255,
                    validateInput: "validateField('slug')",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx("p", { class: "-mt-2 text-xs text-on-surface-weak", children: "Used in your public list URL when the list is public." }),
                /* @__PURE__ */ jsx(
                  ToggleInput,
                  {
                    label: "Make this list public on my shelf",
                    name: "form.isPublic",
                    isChecked: Boolean(formValues?.isPublic)
                  }
                )
              ] }) : null,
              /* @__PURE__ */ jsx(
                FormButtons,
                {
                  buttonText: isEditPage ? "Save changes" : "Create list",
                  loadingText: isEditPage ? "Saving\u2026" : "Creating\u2026",
                  isDisabled: disabled
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var ListForm_default = ListForm;
export {
  ListForm_default as default
};
