import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Input from "../../../components/forms/Input.js";
const ValidateEmail = ({ isAvailable }) => {
  const emailAlpineAttrs = {
    "x-on:change": "$ajax('/auth/validate/email', { method: 'post', body: { email: form.email } })"
  };
  return /* @__PURE__ */ jsxs("div", { id: "email_field", ...emailAlpineAttrs, children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        label: "Email",
        name: "form.email",
        type: "email",
        placeholder: "you@example.com",
        validateInput: "validateEmail()",
        required: true,
        isError: isAvailable === false,
        isSuccess: isAvailable === true
      }
    ),
    typeof isAvailable === "boolean" && /* @__PURE__ */ jsx(
      "div",
      {
        class: "hidden",
        "x-init": `$dispatch('email-availability', { emailIsAvailable: ${isAvailable} })`
      }
    )
  ] });
};
var ValidateEmail_default = ValidateEmail;
export {
  ValidateEmail_default as default
};
