import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FileUploadInput from "../../../components/forms/FileUpload.js";
import FormButtons from "../../../components/forms/FormButtons.js";
import TextArea from "../../../components/forms/TextArea.js";
import DragAndDropArea from "../../dashboard/images/components/DragAndDropArea.js";
import { POST_BODY_MAX_LENGTH } from "../../../domain/posts/utils.js";
const PostForm = ({
  disabled = false,
  postId,
  initialBody,
  initialImageUrl,
  placeholder = "Share a recent find, a favourite spread, or what you're hunting for\u2026"
}) => {
  const isEdit = Boolean(postId);
  const formConfig = JSON.stringify({
    body: initialBody ?? "",
    previewUrl: initialImageUrl ?? null,
    isEdit
  });
  const alpineAttrs = disabled ? {
    "x-data": `messageForm(${formConfig})`,
    "x-on:submit.prevent": ""
  } : {
    "x-data": `messageForm(${formConfig})`,
    "x-on:submit": "submitForm($event)",
    "x-target": isEdit ? "modal-root toast" : "toast",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:success": isEdit ? "onSuccess(); $dispatch('dialog:close')" : "onSuccess()"
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    !isEdit && /* @__PURE__ */ jsx("h2", { class: "mb-3 text-lg font-semibold text-on-surface-strong", children: "Share what's new" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        id: isEdit ? "post-edit-form" : "post-form",
        method: "post",
        enctype: "multipart/form-data",
        action: isEdit ? `/dashboard/posts/${postId}` : "/dashboard/posts",
        class: "flex flex-col gap-4",
        ...alpineAttrs,
        children: [
          isEdit ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "PATCH" }) : null,
          /* @__PURE__ */ jsxs(
            "fieldset",
            {
              disabled,
              class: `flex flex-col gap-4 ${disabled ? "opacity-50" : ""}`,
              children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    class: isEdit ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "flex flex-col gap-4",
                    children: [
                      /* @__PURE__ */ jsx(
                        TextArea,
                        {
                          label: "Post",
                          name: "form.body",
                          required: true,
                          maxLength: POST_BODY_MAX_LENGTH,
                          minRows: isEdit ? 8 : 5,
                          placeholder,
                          validateInput: "validateField('body')"
                        }
                      ),
                      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
                        /* @__PURE__ */ jsx("div", { "x-show": "previewUrl", "x-cloak": true, children: /* @__PURE__ */ jsx(
                          "img",
                          {
                            "x-bind:src": "previewUrl",
                            alt: "Post image preview",
                            class: isEdit ? "h-40 w-full rounded-radius object-cover border border-outline" : "w-full max-w-md rounded-radius object-cover border border-outline"
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
                        )
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  FormButtons,
                  {
                    buttonText: isEdit ? "Save changes" : "Publish post",
                    loadingText: isEdit ? "Saving\u2026" : "Publishing\u2026",
                    isDisabled: disabled,
                    showCancelButton: isEdit
                  }
                )
              ]
            }
          )
        ]
      }
    )
  ] });
};
var PostForm_default = PostForm;
export {
  PostForm_default as default
};
