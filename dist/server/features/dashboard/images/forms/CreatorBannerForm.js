import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import FileUploadInput from "../../../../components/forms/FileUpload.js";
import ImagePreview from "../../../../components/forms/ImagePreview.js";
import DragAndDropArea from "../components/DragAndDropArea.js";
const CreatorCoverForm = ({ initialUrl, creator }) => {
  const initialUrlString = initialUrl ? JSON.stringify(initialUrl) : null;
  const alpineAttrs = {
    "x-data": `creatorBannerForm({initialUrl: ${initialUrlString}})`,
    "x-target": "toast nav-avatar",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess(), $dispatch('avatar:updated')",
    "@ajax:error": "onError()"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Banner Image" }),
    /* @__PURE__ */ jsx(
      "form",
      {
        method: "post",
        action: `/dashboard/images/creators/${creator.id}/banner`,
        enctype: "multipart/form-data",
        class: "space-y-4",
        ...alpineAttrs,
        children: /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
          /* @__PURE__ */ jsx(ImagePreview, {}),
          /* @__PURE__ */ jsx(DragAndDropArea, {}),
          /* @__PURE__ */ jsx(
            FileUploadInput,
            {
              label: "Replace Image",
              name: "banner",
              "x-on:change": "onFileChange",
              "x-ref": "fileInput"
            }
          ),
          /* @__PURE__ */ jsx("p", { "x-show": "isCompressing", class: "text-sm text-gray-500", children: "Compressing image\u2026" }),
          /* @__PURE__ */ jsx("p", { "x-show": "error", class: "text-sm text-red-600", "x-text": "error" }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "solid",
              color: "primary",
              width: "lg",
              "x-bind:disabled": "isSubmitting || previewUrl === initialUrl || isCompressing",
              children: [
                /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: "Save" }),
                /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", children: "Saving\u2026" })
              ]
            }
          )
        ] })
      }
    )
  ] });
};
var CreatorBannerForm_default = CreatorCoverForm;
export {
  CreatorBannerForm_default as default
};
