import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const DescriptionForm = ({ bookId, blurb, action }) => {
  const initialForm = { blurb: blurb ?? "" };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      action: `${action}/blurb`,
      "x-data": `magazineBlurbForm(${JSON.stringify(initialForm)})`,
      "x-target": "toast",
      "x-on:submit": "submitForm($event)",
      className: "mt-1 flex flex-col gap-1",
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Description",
            name: "form.blurb",
            minRows: 12,
            validateInput: "validateField('blurb')"
          }
        ),
        /* @__PURE__ */ jsx(FormButtons, { buttonText: "Save description", loadingText: "Saving..." })
      ]
    }
  );
};
var DescriptionForm_default = DescriptionForm;
export {
  DescriptionForm_default as default
};
