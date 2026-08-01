import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const collectPlacementImageOptions = (book) => {
  const raw = [
    book?.coverUrl,
    ...book?.images?.map((image) => image.imageUrl) ?? []
  ].filter(Boolean);
  return Array.from(new Set(raw));
};
const SelectImageModal = ({
  action,
  bookId,
  number,
  title,
  imageOptions,
  selectedImageUrl
}) => {
  const saveAttrs = {
    // Swap the book card (new thumbnail) and prepend a toast, then close.
    "x-target": `magazine-book-${number} toast`,
    "x-target.error": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsx(Modal, { title: `Featured image \u2014 ${title}`, maxWidth: "max-w-2xl", children: imageOptions.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "This book has no images to choose from." }) : /* @__PURE__ */ jsxs(FormPost, { action: `${action}/image`, ...saveAttrs, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
    /* @__PURE__ */ jsx("p", { class: "mb-3 text-sm text-on-surface", children: "Pick the single image to feature for this book in the issue." }),
    /* @__PURE__ */ jsx("div", { class: "max-h-[min(55vh,calc(100dvh-14rem))] overflow-y-auto overscroll-contain rounded border border-outline/60 bg-surface p-2", children: /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-3 gap-2 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("label", { class: "flex aspect-3/4 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-outline p-1 text-center text-[0.65rem] text-on-surface-weak [&:has(input:checked)]:border-primary [&:has(input:checked)]:text-on-surface-strong [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "radio",
            name: "imageUrl",
            value: "",
            checked: !selectedImageUrl,
            class: "sr-only"
          }
        ),
        "Book default"
      ] }),
      imageOptions.map((url) => /* @__PURE__ */ jsxs(
        "label",
        {
          class: "cursor-pointer rounded border border-outline p-1 [&:has(input:checked)]:border-primary [&:has(input:checked)]:ring-2 [&:has(input:checked)]:ring-primary",
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "radio",
                name: "imageUrl",
                value: url,
                checked: url === selectedImageUrl,
                class: "sr-only"
              }
            ),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: url,
                alt: "",
                loading: "lazy",
                class: "aspect-3/4 w-full rounded object-cover"
              }
            )
          ]
        },
        url
      ))
    ] }) }),
    /* @__PURE__ */ jsxs("div", { class: "mt-4 flex items-center gap-3 border-t border-outline pt-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          class: "rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer",
          children: "Save image"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "x-on:click": "$dispatch('dialog:close')",
          class: "rounded border border-outline px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-alt cursor-pointer",
          children: "Cancel"
        }
      )
    ] })
  ] }) });
};
var SelectImageModal_default = SelectImageModal;
export {
  collectPlacementImageOptions,
  SelectImageModal_default as default
};
