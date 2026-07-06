import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Input from "../../../components/forms/Input.js";
const ValidateWebsite = ({ isAvailable, isRequired = false }) => {
  const websiteAlpineAttrs = {
    "x-on:change": "$ajax('/auth/validate/website', { method: 'post', body: { website: form.website } })"
  };
  return /* @__PURE__ */ jsxs("div", { id: "website_field", ...websiteAlpineAttrs, children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        label: "Website",
        name: "form.website",
        type: "url",
        validationTrigger: "change",
        validateInput: "validateWebsite()",
        isError: isAvailable === false,
        isSuccess: isAvailable === true,
        required: isRequired
      }
    ),
    typeof isAvailable === "boolean" && /* @__PURE__ */ jsx(
      "div",
      {
        class: "hidden",
        "x-init": `$dispatch('website-availability', { websiteIsAvailable: ${isAvailable} })`
      }
    )
  ] });
};
var ValidateWebsite_default = ValidateWebsite;
export {
  ValidateWebsite_default as default
};
