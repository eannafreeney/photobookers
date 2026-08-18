import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import FileUploadInput from "../../../components/forms/FileUpload.js";
import FormPost from "../../../components/forms/FormPost.js";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea.js";
import { storyUploadLabel } from "../utils.js";
const StoryUploadForm = ({ token, kind, title, credits }) => {
  const alpineAttrs = {
    "x-data": "storyUploadForm()",
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()"
  };
  return /* @__PURE__ */ jsx(
    FormPost,
    {
      id: "story-upload-form",
      action: `/story-upload/${token}`,
      enctype: "multipart/form-data",
      ...alpineAttrs,
      children: /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { class: "flex flex-col items-center gap-4", "x-show": "previewUrl", "x-cloak": true, children: /* @__PURE__ */ jsxs(
          "div",
          {
            class: "relative w-full max-w-[240px] overflow-hidden rounded bg-gray-100",
            style: "aspect-ratio: 9/16;",
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  "x-bind:src": "previewUrl",
                  alt: "Story preview",
                  class: "absolute inset-0 h-full w-full object-cover"
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  class: "absolute inset-0",
                  style: "background: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%, transparent 72%, rgba(0,0,0,0.2) 100%);"
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  class: "absolute left-0 right-0",
                  style: "top: 9.375%; padding-left: 7.4%; padding-right: 7.4%;",
                  children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        class: "text-[10px] font-semibold uppercase tracking-[0.35em] text-white",
                        style: "font-size: 10px; line-height: 1;",
                        children: storyUploadLabel(kind)
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        class: "font-semibold text-white",
                        style: "font-size: 16px; line-height: 1.2; margin-top: 8px; font-family: Georgia, serif;",
                        children: title
                      }
                    ),
                    credits ? /* @__PURE__ */ jsx(
                      "div",
                      {
                        class: "text-white/90",
                        style: "font-size: 12px; line-height: 1.2; margin-top: 6px;",
                        children: credits
                      }
                    ) : null
                  ]
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(DragAndDropArea, {}),
        /* @__PURE__ */ jsx(
          FileUploadInput,
          {
            label: "Add image",
            name: "image",
            required: true,
            "x-on:change": "onFileChange",
            "x-ref": "fileInput"
          }
        ),
        /* @__PURE__ */ jsx("p", { "x-show": "error", class: "text-sm text-red-600", "x-text": "error" }),
        /* @__PURE__ */ jsx("div", { class: "flex gap-2", children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "solid",
            color: "primary",
            "x-bind:disabled": "isSubmitting || isCompressing",
            children: [
              /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: "Upload" }),
              /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", children: "Uploading\u2026" })
            ]
          }
        ) })
      ] })
    }
  );
};
var StoryUploadForm_default = StoryUploadForm;
export {
  StoryUploadForm_default as default
};
