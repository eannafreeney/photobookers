import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FileUploadInput from "../../../../components/forms/FileUpload.js";
import FormButtons from "../../../../components/forms/FormButtons.js";
import TextArea from "../../../../components/forms/TextArea.js";
import DragAndDropArea from "../../images/components/DragAndDropArea.js";
const MessageForm = ({ creatorId }) => {
  const alpineAttrs = {
    "x-data": `messageForm()`,
    "x-on:submit": "submitForm($event)",
    "x-target": `toast creator-messages creator-messages-${creatorId}`,
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong", children: "Write a post" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        id: "message-form",
        method: "post",
        enctype: "multipart/form-data",
        action: `/dashboard/messages/${creatorId}`,
        class: "flex flex-col gap-4",
        ...alpineAttrs,
        children: [
          /* @__PURE__ */ jsx(
            TextArea,
            {
              name: "form.body",
              required: true,
              maxLength: 5e3,
              placeholder: "Share fair dates, new work, or news with your followers\u2026",
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
          /* @__PURE__ */ jsx(DragAndDropArea, {}),
          /* @__PURE__ */ jsx(
            FileUploadInput,
            {
              label: "Add Images",
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
var MessageForm_default = MessageForm;
export {
  MessageForm_default as default
};
