import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormButtons from "../../../components/forms/FormButtons.js";
import Input from "../../../components/forms/Input.js";
const SetPasswordForm = ({
  buttonText = "Set Password",
  loadingText = "Setting...",
  redirectUrl = null
}) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        type: "password",
        label: "Password",
        name: "form.password",
        validateInput: "validatePassword()",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        validationTrigger: "blur",
        required: true
      }
    ),
    /* @__PURE__ */ jsx(
      Input,
      {
        type: "password",
        label: "Confirm Password",
        name: "form.confirmPassword",
        validateInput: "validateConfirmPassword()",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        validationTrigger: "blur",
        required: true
      }
    ),
    redirectUrl && redirectUrl !== "/" ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "redirectUrl", value: redirectUrl }) : null,
    /* @__PURE__ */ jsx(FormButtons, { buttonText, loadingText }),
    /* @__PURE__ */ jsx("div", { class: "h-4", children: /* @__PURE__ */ jsx(
      "p",
      {
        "x-show": "errors.globalError",
        class: "text-red-500",
        "x-text": "errors.globalError"
      }
    ) })
  ] });
};
var SetPasswordForm_default = SetPasswordForm;
export {
  SetPasswordForm_default as default
};
