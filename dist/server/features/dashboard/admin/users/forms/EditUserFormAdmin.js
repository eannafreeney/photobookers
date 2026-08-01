import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import Input from "../../../../../components/forms/Input.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const EditUserFormAdmin = ({ formValues, userId }) => {
  const alpineAttrs = {
    "x-data": `editUserFormAdmin(${JSON.stringify(formValues)}, true)`,
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:success": "onSuccess()",
    "x-on:ajax:error": "onError()",
    "x-on:submit": "submitForm($event)"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Edit user" }),
    /* @__PURE__ */ jsxs(FormPost, { action: `/dashboard/admin/users/${userId}`, ...alpineAttrs, children: [
      /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Email",
            name: "form.email",
            type: "email",
            validateInput: "validateField('email')",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "First Name",
            name: "form.firstName",
            validateInput: "validateField('firstName')"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Last Name",
            name: "form.lastName",
            validateInput: "validateField('lastName')"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(FormButtons, { buttonText: "Save", loadingText: "Saving..." })
    ] })
  ] });
};
var EditUserFormAdmin_default = EditUserFormAdmin;
export {
  EditUserFormAdmin_default as default
};
