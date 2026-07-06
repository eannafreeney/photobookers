import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import Input from "../../../../../components/forms/Input.js";
import CountrySelect from "../../../../../components/forms/CountrySelect.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import { capitalize } from "../../../../../utils.js";
import ValidateDisplayName from "../../../../auth/components/ValidateDisplayName.js";
import ValidateWebsite from "../../../../auth/components/ValidateWebsite.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const EditCreatorFormAdmin = ({
  formValues,
  creatorId,
  type = "artist"
}) => {
  const isEditPage = !!creatorId;
  const alpineAttrs = {
    "x-data": `editCreatorFormAdmin(${formValues}, ${isEditPage})`,
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)",
    "x-on:displayName-availability.window": "displayNameIsTaken = !$event.detail.displayNameIsAvailable"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4 ", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: `${isEditPage ? "Edit" : "Create"} ${capitalize(
      type
    )} Profile` }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/admin/creators/${creatorId}`,
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2", children: [
            /* @__PURE__ */ jsx(ValidateDisplayName, {}),
            /* @__PURE__ */ jsx(Input, { label: "Tagline", name: "form.tagline", maxLength: 150 }),
            /* @__PURE__ */ jsx(
              TextArea,
              {
                label: "Biography",
                name: "form.bio",
                validateInput: "validateField('bio')",
                maxLength: 1e3
              }
            ),
            /* @__PURE__ */ jsx(Input, { label: "City", name: "form.city", maxLength: 50 }),
            /* @__PURE__ */ jsx(CountrySelect, {}),
            /* @__PURE__ */ jsx(ValidateWebsite, {}),
            /* @__PURE__ */ jsx(Input, { label: "Email", name: "form.email", type: "email" }),
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
          /* @__PURE__ */ jsx(FormButtons, {})
        ]
      }
    )
  ] });
};
var EditCreatorFormAdmin_default = EditCreatorFormAdmin;
export {
  EditCreatorFormAdmin_default as default
};
