import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Input from "../../../components/forms/Input.js";
const ValidateDisplayName = ({ isAvailable }) => {
  const displayNameAlpineAttrs = {
    "x-on:change": "$ajax('/auth/validate/display-name', { method: 'post', body: { displayName: form.displayName } })"
  };
  return /* @__PURE__ */ jsxs("div", { id: "displayName_field", ...displayNameAlpineAttrs, children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        type: "text",
        label: "Display Name",
        name: "form.displayName",
        validateInput: "validateDisplayName()",
        isError: isAvailable === false,
        isSuccess: isAvailable === true,
        required: true
      }
    ),
    typeof isAvailable === "boolean" && /* @__PURE__ */ jsx(
      "div",
      {
        class: "hidden",
        "x-init": `$dispatch('displayName-availability', { displayNameIsAvailable: ${isAvailable} })`
      }
    )
  ] });
};
var ValidateDisplayName_default = ValidateDisplayName;
export {
  ValidateDisplayName_default as default
};
