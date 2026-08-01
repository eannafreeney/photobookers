import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import FormPost from "../../../components/forms/FormPost.js";
const inputClass = "bg-surface rounded-radius border border-outline hover:border-outline-strong transition-colors px-3 py-2 text-base md:text-sm font-normal text-on-surface focus:outline focus:outline-offset-2 focus:outline-accent";
const UserProfileForm = ({ user }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast"
  };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      action: `/users/${user.id}/edit`,
      className: "space-y-4",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("label", { class: "flex flex-col gap-1 text-sm", children: [
            /* @__PURE__ */ jsx("span", { class: "font-medium text-on-surface-strong", children: "First name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "firstName",
                value: user.firstName ?? "",
                maxLength: 255,
                autocomplete: "given-name",
                placeholder: "First name",
                class: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { class: "flex flex-col gap-1 text-sm", children: [
            /* @__PURE__ */ jsx("span", { class: "font-medium text-on-surface-strong", children: "Last name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "lastName",
                value: user.lastName ?? "",
                maxLength: 255,
                autocomplete: "family-name",
                placeholder: "Last name",
                class: inputClass
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "lg", children: /* @__PURE__ */ jsx("span", { children: "Save" }) })
      ]
    }
  );
};
var UserProfileForm_default = UserProfileForm;
export {
  UserProfileForm_default as default
};
