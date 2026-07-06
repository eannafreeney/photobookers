import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import Input from "../../../../../components/forms/Input.js";
import ValidateEmail from "../../../../auth/components/ValidateEmail.js";
import CreatorsComboBox from "../components/CreatorsComboBox.js";
const CreateUserFormAdmin = async () => {
  const alpineAttrs = {
    "x-data": "newUserForm()",
    "x-target": "modal-root create-user-form",
    "x-target.error": "toast",
    "x-on:ajax:success": "isSubmitting = false, $dispatch('users:updated')",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:email-availability.window": "emailIsTaken = !$event.detail.emailIsAvailable"
  };
  return /* @__PURE__ */ jsxs("div", { id: "create-user-form", class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "New User" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        action: "/dashboard/admin/users/create",
        method: "post",
        class: "flex flex-col md:flex-row items-center justify-between gap-4",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx("div", { class: "flex-1 min-w-0 w-full md:w-auto", children: /* @__PURE__ */ jsx(ValidateEmail, {}) }),
          /* @__PURE__ */ jsx("div", { class: "flex-1 min-w-0 w-full md:w-auto", children: /* @__PURE__ */ jsx(
            Input,
            {
              label: "First Name",
              name: "form.firstName",
              validateInput: "validateField('firstName')"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { class: "flex-1 min-w-0 w-full md:w-auto", children: /* @__PURE__ */ jsx(
            Input,
            {
              label: "Last Name",
              name: "form.lastName",
              validateInput: "validateField('lastName')"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { class: "flex-1 min-w-0 w-full md:w-auto", children: /* @__PURE__ */ jsx(CreatorsComboBox, {}) }),
          /* @__PURE__ */ jsx(FormButtons, { buttonText: "Create", loadingText: "Creating..." })
        ]
      }
    )
  ] });
};
var CreateUserFormAdmin_default = CreateUserFormAdmin;
export {
  CreateUserFormAdmin_default as default
};
