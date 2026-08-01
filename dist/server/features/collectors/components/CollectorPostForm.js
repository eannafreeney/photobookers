import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FileUploadInput from "../../../components/forms/FileUpload.js";
import FormButtons from "../../../components/forms/FormButtons.js";
import TextArea from "../../../components/forms/TextArea.js";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea.js";
const CollectorPostForm = () => {
  const formConfig = JSON.stringify({ body: "", previewUrl: null });
  const alpineAttrs = {
    "x-data": `messageForm(${formConfig})`,
    "x-on:submit": "submitForm($event)",
    "x-target": "toast collector-posts-table-body",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong", children: "Share what's new" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        id: "collector-post-form",
        method: "post",
        enctype: "multipart/form-data",
        action: "/dashboard/posts",
        class: "flex flex-col gap-4",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx(
            TextArea,
            {
              name: "form.body",
              required: true,
              maxLength: 5e3,
              placeholder: "Share a recent find, a favourite spread, or what you're hunting for\u2026",
              validateInput: "validateField('body')"
            }
          ),
          /* @__PURE__ */ jsx("div", { "x-show": "previewUrl", "x-cloak": true, children: /* @__PURE__ */ jsx(
            "img",
            {
              "x-bind:src": "previewUrl",
              alt: "Post image preview",
              class: "w-full max-w-md rounded-radius object-cover border border-outline"
            }
          ) }),
          /* @__PURE__ */ jsx(DragAndDropArea, { prompt: "Drag and drop or click here to upload an image." }),
          /* @__PURE__ */ jsx(
            FileUploadInput,
            {
              label: "Add image",
              name: "image",
              "x-on:change": "onFileChange($event)",
              "x-ref": "fileInput"
            }
          ),
          /* @__PURE__ */ jsx(FormButtons, { buttonText: "Publish post", loadingText: "Publishing\u2026" })
        ]
      }
    )
  ] });
};
var CollectorPostForm_default = CollectorPostForm;
export {
  CollectorPostForm_default as default
};
