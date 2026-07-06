import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import FileUploadInput from "../../../../components/forms/FileUpload.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import ImagePreview from "../../../../components/forms/ImagePreview.js";
import Card from "../../../../components/app/Card.js";
import CardCreatorCard from "../../../../components/app/CardCreatorCard.js";
import { canUploadImage } from "../../../../lib/permissions.js";
import DragAndDropArea from "../components/DragAndDropArea.js";
const BookCoverForm = ({ initialUrl, book, user }) => {
  const alpineAttrs = {
    "x-data": `bookCoverForm({initialUrl: ${JSON.stringify(initialUrl)}})`,
    "x-target": "toast",
    "x-target.error": "toast",
    "@ajax:before": "onBefore()",
    "@ajax:success": "onSuccess()",
    "@ajax:error": "onError()"
  };
  return /* @__PURE__ */ jsxs("div", { id: "book-cover-form", class: "space-y-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Book Cover" }),
    /* @__PURE__ */ jsx(
      "form",
      {
        action: `/dashboard/images/books/${book.id}/cover`,
        method: "post",
        enctype: "multipart/form-data",
        ...alpineAttrs,
        children: /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              class: "flex flex-col md:flex-row items-center gap-4 justify-evenly",
              "x-show": "previewUrl || initialUrl",
              "x-cloak": true,
              children: [
                /* @__PURE__ */ jsx(ImagePreview, {}),
                /* @__PURE__ */ jsx(CardPreview, { book })
              ]
            }
          ),
          /* @__PURE__ */ jsx(DragAndDropArea, {}),
          /* @__PURE__ */ jsx(
            FileUploadInput,
            {
              label: "Add Book Cover",
              name: "cover",
              required: true,
              "x-on:change": "onFileChange",
              "x-ref": "fileInput",
              isDisabled: !canUploadImage(user, book)
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
var BookCoverForm_default = BookCoverForm;
const CardPreview = ({ book }) => /* @__PURE__ */ jsxs("div", { class: "mb-4", children: [
  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-variant mb-2", children: "Book Card Preview" }),
  /* @__PURE__ */ jsxs(Card, { className: "max-w-[300px]", children: [
    /* @__PURE__ */ jsx("div", { class: "px-2 py-2 flex items-center justify-between", children: /* @__PURE__ */ jsx(CardCreatorCard, { creator: book.artist ?? null }) }),
    /* @__PURE__ */ jsx(
      "figure",
      {
        class: "relative w-full overflow-hidden bg-white shadow-sm aspect-4/3",
        style: "height: 300px",
        children: /* @__PURE__ */ jsx(
          "img",
          {
            "x-bind:src": "previewUrl || initialUrl || ''",
            "x-bind:alt": "''",
            class: "w-full h-full object-cover object-center"
          }
        )
      }
    ),
    /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsx(Card.Title, { children: book.title }) })
  ] })
] });
export {
  BookCoverForm_default as default
};
