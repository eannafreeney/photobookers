import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Input from "../../../components/forms/Input.js";
import TextArea from "../../../components/forms/TextArea.js";
import FormButton from "../../../components/forms/FormButtons.js";
const ContactForm = () => {
  const alpineAttrs = {
    "x-data": "contactForm",
    "x-target": "toast",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false"
  };
  return /* @__PURE__ */ jsxs(
    "form",
    {
      action: "/contact",
      method: "post",
      class: "flex flex-col gap-4 max-w-lg",
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx(Input, { label: "Name", name: "form.name", placeholder: "Your name", required: true }),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Email",
            name: "form.email",
            type: "email",
            placeholder: "you@example.com",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Message",
            name: "form.message",
            placeholder: "How can we help?",
            minRows: 5,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "website",
            class: "hidden",
            tabindex: -1,
            autocomplete: "off"
          }
        ),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "ts", value: "${Date.now()}" }),
        /* @__PURE__ */ jsx(FormButton, { buttonText: "Send message", loadingText: "Sending..." })
      ]
    }
  );
};
var ContactForm_default = ContactForm;
export {
  ContactForm_default as default
};
