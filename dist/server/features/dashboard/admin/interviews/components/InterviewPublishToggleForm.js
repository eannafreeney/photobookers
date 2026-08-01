import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPatch from "../../../../../components/forms/FormPatch.js";
const InterviewPublishToggleForm = ({ interview }) => {
  const interviewId = interview.id;
  const isPublished = interview.status === "published";
  const intent = isPublished ? "unpublish" : "publish";
  const canToggle = interview.status === "published" || interview.status === "completed" && !!interview.promoImageUrl && !!interview.answers;
  const alpineAttrs = {
    "x-data": `{ isPublished: ${isPublished} }`,
    "x-target": `interview-publish-toggle-${interviewId} interview-status-${interviewId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublished = ${isPublished}`,
    "x-target.back": `toast interview-publish-toggle-${interviewId}`
  };
  return /* @__PURE__ */ jsxs(
    FormPatch,
    {
      id: `interview-publish-toggle-${interviewId}`,
      action: `/dashboard/admin/interviews/${interviewId}`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: intent }),
        /* @__PURE__ */ jsxs("label", { class: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              class: "peer sr-only",
              checked: isPublished,
              name: "isPublished",
              "x-on:change": "$root.requestSubmit()",
              title: "Publish",
              disabled: !canToggle
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" })
        ] })
      ]
    }
  );
};
var InterviewPublishToggleForm_default = InterviewPublishToggleForm;
export {
  InterviewPublishToggleForm_default as default
};
