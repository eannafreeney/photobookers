import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import FileUploadInput from "../../../../../components/forms/FileUpload.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import ImagePreview from "../../../../../components/forms/ImagePreview.js";
import DragAndDropArea from "../../../../dashboard/images/components/DragAndDropArea.js";
const FairBannerForm = ({ initialUrl, fairId }) => {
  const alpineAttrs = {
    "x-data": `fairBannerForm({initialUrl: ${JSON.stringify(initialUrl)}})`,
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()"
  };
  return /* @__PURE__ */ jsxs("div", { id: "fair-banner-form", class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Fair Banner Image" }),
    /* @__PURE__ */ jsx(
      "form",
      {
        action: `/dashboard/images/fairs/${fairId}/banner`,
        method: "post",
        enctype: "multipart/form-data",
        ...alpineAttrs,
        children: /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              class: "flex flex-col md:flex-row items-center gap-4 justify-evenly",
              "x-show": "previewUrl || initialUrl",
              "x-cloak": true,
              children: /* @__PURE__ */ jsx(ImagePreview, {})
            }
          ),
          /* @__PURE__ */ jsx(DragAndDropArea, {}),
          /* @__PURE__ */ jsx(
            FileUploadInput,
            {
              label: "Add Fair Banner Image",
              name: "banner",
              required: true,
              "x-on:change": "onFileChange",
              "x-ref": "fileInput"
            }
          ),
          /* @__PURE__ */ jsx("p", { "x-show": "error", class: "text-sm text-red-600", "x-text": "error" }),
          /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "solid",
                color: "primary",
                "x-bind:disabled": "isSubmitting || previewUrl === initialUrl || isCompressing",
                children: [
                  /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: "Save" }),
                  /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", children: "Saving\u2026" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "solid",
                color: "inverse",
                "x-on:click": "cancelSelection",
                "x-bind:disabled": "isSubmitting || previewUrl === initialUrl || isCompressing",
                children: "Cancel"
              }
            )
          ] })
        ] })
      }
    )
  ] });
};
var FairBannerForm_default = FairBannerForm;
export {
  FairBannerForm_default as default
};
