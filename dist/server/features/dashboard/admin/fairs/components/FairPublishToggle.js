import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPatch from "../../../../../components/forms/FormPatch.js";
const FairPublishToggle = ({ fairId, status }) => {
  const isPublished = status === "published";
  const intent = isPublished ? "unpublish" : "publish";
  const alpineAttrs = {
    "x-data": `{ isPublished: ${isPublished} }`,
    "x-target": `fair-publish-toggle-${fairId} fair-status-${fairId} fair-preview-${fairId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`
  };
  return /* @__PURE__ */ jsxs(
    FormPatch,
    {
      id: `fair-publish-toggle-${fairId}`,
      action: `/dashboard/admin/fairs/${fairId}`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: intent }),
        /* @__PURE__ */ jsxs(
          "label",
          {
            class: "cursor-pointer",
            title: isPublished ? "Unpublish" : "Publish",
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  class: "peer sr-only",
                  checked: isPublished,
                  "x-on:change": "$root.requestSubmit()"
                }
              ),
              /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0" })
            ]
          }
        )
      ]
    }
  );
};
var FairPublishToggle_default = FairPublishToggle;
export {
  FairPublishToggle_default as default
};
