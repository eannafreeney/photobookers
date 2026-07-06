import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import FileUploadInput from "../../../../components/forms/FileUpload.js";
import { canUploadImage } from "../../../../lib/permissions.js";
import DragAndDropArea from "../components/DragAndDropArea.js";
import ImagePreviewGrid from "../components/ImagePreviewGrid.js";
import ImagePreviewLightbox from "../components/ImagePreviewLightbox.js";
const BookGalleryForm = ({ initialImages, book, user }) => {
  const initialImagesString = initialImages ? JSON.stringify(initialImages) : null;
  const alpineAttrs = {
    "x-data": `bookGalleryForm({initialImages: ${initialImagesString}})`,
    "x-target": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError($event)",
    "x-on:submit": "submitForm($event)"
  };
  return /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Book Gallery" }),
    /* @__PURE__ */ jsx(
      "form",
      {
        enctype: "multipart/form-data",
        method: "post",
        action: `/dashboard/images/books/${book.id}/gallery`,
        ...alpineAttrs,
        children: /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { "x-show": "images.length > 0 || initialImages.length > 0", "x-cloak": true, children: /* @__PURE__ */ jsx(ImagePreviewGrid, {}) }),
          /* @__PURE__ */ jsx(DragAndDropArea, {}),
          /* @__PURE__ */ jsx(
            FileUploadInput,
            {
              label: "Add Images",
              multiple: true,
              "x-on:change": "onFilesChange",
              "x-ref": "fileInput",
              isDisabled: !canUploadImage(user, book)
            }
          ),
          /* @__PURE__ */ jsx("p", { "x-show": "isCompressing", class: "text-sm text-gray-500", children: "Compressing image\u2026" }),
          /* @__PURE__ */ jsx("p", { "x-show": "error", class: "text-sm text-danger", "x-text": "error" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "hidden",
              name: "removedIds",
              "x-bind:value": "JSON.stringify(removedIds)"
            }
          ),
          /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "solid",
                color: "primary",
                "x-bind:disabled": "isSubmitting || !hasChanges || isCompressing",
                children: [
                  /* @__PURE__ */ jsx("span", { "x-show": "!isSubmitting", children: "Save" }),
                  /* @__PURE__ */ jsx("span", { "x-show": "isSubmitting", children: "Saving\u2026" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "solid",
                color: "secondary",
                "x-show": "hasChanges",
                "x-on:click": "reset()",
                children: /* @__PURE__ */ jsx("span", { children: "Undo Changes" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(ImagePreviewLightbox, {})
        ] })
      }
    )
  ] });
};
var BookGalleryForm_default = BookGalleryForm;
export {
  BookGalleryForm_default as default
};
