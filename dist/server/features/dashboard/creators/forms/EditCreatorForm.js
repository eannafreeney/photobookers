import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../../components/forms/FormButtons.js";
import Input from "../../../../components/forms/Input.js";
import CountrySelect from "../../../../components/forms/CountrySelect.js";
import TextArea from "../../../../components/forms/TextArea.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import { capitalize } from "../../../../utils.js";
import { canEditCreator } from "../../../../lib/permissions.js";
import FormPost from "../../../../components/forms/FormPost.js";
const EditCreatorForm = ({
  formValues,
  creator,
  type = "artist",
  user
}) => {
  const isEditPage = !!creator.id;
  const alpineAttrs = {
    "x-data": `editCreatorForm(${formValues}, ${isEditPage})`,
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "isSubmitting = false",
    "x-on:submit": "submitForm($event)"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4 ", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: `${isEditPage ? "Edit" : "Create"} ${capitalize(
      type
    )} Profile` }),
    /* @__PURE__ */ jsxs(FormPost, { action: `/dashboard/creators/${creator.id}`, ...alpineAttrs, children: [
      /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Display Name",
            name: "form.displayName",
            validateInput: "validateField('displayName')",
            maxLength: 100,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(Input, { label: "Tagline", name: "form.tagline", maxLength: 150 }),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Biography",
            name: "form.bio",
            validateInput: "validateField('bio')",
            maxLength: 1e3,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(Input, { label: "City", name: "form.city", maxLength: 50, required: true }),
        /* @__PURE__ */ jsx(CountrySelect, { isRequired: true }),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Website",
            name: "form.website",
            type: "url",
            placeholder: "https://..."
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Facebook",
            name: "form.facebook",
            type: "url",
            placeholder: "https://..."
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Twitter",
            name: "form.twitter",
            placeholder: "https://...",
            type: "url"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Instagram",
            name: "form.instagram",
            type: "url",
            placeholder: "https://..."
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "type",
            value: type,
            "x-init": `form.type = '${type}'`
          }
        )
      ] }),
      /* @__PURE__ */ jsx(FormButtons, { isDisabled: !canEditCreator(user, creator) })
    ] })
  ] });
};
var EditCreatorForm_default = EditCreatorForm;
export {
  EditCreatorForm_default as default
};
