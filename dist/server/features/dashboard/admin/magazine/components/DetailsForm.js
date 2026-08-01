import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import Input from "../../../../../components/forms/Input.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const DetailsForm = ({ issue, action }) => {
  const initialForm = {
    title: issue.title,
    subtitle: issue.subtitle ?? "",
    editorsLetter: issue.editorsLetter.join("\n\n")
  };
  const alpineAttrs = {
    "x-data": `magazineDetailsForm(${JSON.stringify(initialForm)}, ${JSON.stringify(
      `${action}/regenerate-title`
    )})`,
    "x-target": "toast",
    "x-on:submit": "submitForm($event)"
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 border-t border-outline pt-4", children: [
    /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Edit details" }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        ...alpineAttrs,
        action: `${action}/details`,
        className: "flex flex-col gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", { class: "flex items-end gap-2", children: [
            /* @__PURE__ */ jsx("div", { class: "flex-1", children: /* @__PURE__ */ jsx(
              Input,
              {
                label: "Title",
                name: "form.title",
                required: true,
                validateInput: "validateField('title')"
              }
            ) }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                "x-on:click": "regenerateTitle()",
                "x-bind:disabled": "regeneratingTitle",
                class: "mb-1 shrink-0 border border-outline px-3 py-2 text-sm font-semibold text-on-surface hover:border-outline-strong disabled:opacity-60",
                children: [
                  /* @__PURE__ */ jsx("span", { "x-show": "!regeneratingTitle", children: "Regenerate" }),
                  /* @__PURE__ */ jsx("span", { "x-show": "regeneratingTitle", "x-cloak": true, children: "Regenerating\u2026" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { "x-show": "titleError", "x-cloak": true, "x-text": "titleError", class: "text-sm text-danger" }),
          /* @__PURE__ */ jsx(Input, { label: "Subtitle", name: "form.subtitle" }),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "Editor's letter",
              name: "form.editorsLetter",
              minRows: 10,
              placeholder: "Separate paragraphs with a blank line."
            }
          ),
          /* @__PURE__ */ jsx(FormButtons, { buttonText: "Save details", loadingText: "Saving..." })
        ]
      }
    )
  ] });
};
var DetailsForm_default = DetailsForm;
export {
  DetailsForm_default as default
};
