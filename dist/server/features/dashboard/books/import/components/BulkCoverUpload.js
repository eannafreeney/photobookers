import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Card from "../../../../../components/app/Card.js";
const BulkCoverUpload = ({ books }) => {
  const alpineAttrs = {
    "x-data": `bulkCoverUpload(${JSON.stringify(books)})`,
    "x-init": "init()"
  };
  const dropzoneAttrs = {
    "x-on:drop.prevent": "(e) => handleDrop(e, book.id)",
    "x-on:dragover.prevent": ""
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", ...alpineAttrs, children: [
    /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { children: "Upload covers and gallery images" }),
      /* @__PURE__ */ jsx("p", { class: "text-on-surface-weak", children: "Drop images for each book below. The first image will be the cover, additional images become gallery images (max 10 images per book)." })
    ] }),
    /* @__PURE__ */ jsx("div", { class: "space-y-6", children: /* @__PURE__ */ jsx("template", { "x-for": "(book, index) in books", "x-bind:key": "book.id", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { class: "font-medium", "x-text": "book.title" }),
        /* @__PURE__ */ jsxs(
          "span",
          {
            class: "text-sm",
            "x-show": "bookImages[book.id] && bookImages[book.id].length > 0",
            children: [
              /* @__PURE__ */ jsx("span", { "x-text": "bookImages[book.id].length" }),
              " image",
              /* @__PURE__ */ jsx("span", { "x-show": "bookImages[book.id].length !== 1", children: "s" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          class: "border-2 border-dashed border-outline rounded-radius p-8 text-center cursor-pointer hover:border-primary hover:bg-surface-alt/50 transition-colors",
          "x-on:click": "openFilePicker(book.id)",
          ...dropzoneAttrs,
          "x-show": "!bookImages[book.id] || bookImages[book.id].length === 0",
          children: [
            /* @__PURE__ */ jsx("p", { class: "text-on-surface-strong mb-1", children: "Drop images here or click to browse" }),
            /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-weak", children: "First image = cover, rest = gallery (max 10)" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          multiple: true,
          accept: "image/*",
          class: "hidden",
          "x-bind:id": "'fileInput-' + book.id",
          "x-on:change": "handleFileInput($event, book.id)"
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          "x-show": "bookImages[book.id] && bookImages[book.id].length > 0",
          class: "space-y-2",
          children: [
            /* @__PURE__ */ jsx("div", { class: "grid grid-cols-4 gap-2", children: /* @__PURE__ */ jsx(
              "template",
              {
                "x-for": "(file, i) in bookImages[book.id]",
                "x-bind:key": "i",
                children: /* @__PURE__ */ jsxs("div", { class: "relative group", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      "x-bind:src": "getFilePreview(file)",
                      "x-bind:alt": "file.name",
                      class: "w-full aspect-square object-cover rounded border"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      "x-show": "i === 0",
                      class: "absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded",
                      children: "Cover"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "x-on:click": "removeImage(book.id, i)",
                      class: "absolute top-1 right-1 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                      children: "\xD7"
                    }
                  )
                ] })
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  color: "inverse",
                  size: "sm",
                  "x-on:click": "openFilePicker(book.id)",
                  children: "Add more images"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "outline",
                  color: "danger",
                  size: "sm",
                  "x-on:click": "clearBook(book.id)",
                  children: "Clear all"
                }
              )
            ] })
          ]
        }
      )
    ] }) }) }) }) }),
    /* @__PURE__ */ jsxs("div", { class: "flex gap-4 sticky bottom-4 bg-surface border-t border-outline pt-4 -mx-4 px-4", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "solid",
          color: "primary",
          "x-on:click": "uploadAll()",
          "x-bind:disabled": "uploading || getTotalImages() === 0",
          children: [
            /* @__PURE__ */ jsxs("span", { "x-show": "!uploading", children: [
              "Upload ",
              /* @__PURE__ */ jsx("span", { "x-text": "getTotalImages()" }),
              " image",
              /* @__PURE__ */ jsx("span", { "x-show": "getTotalImages() !== 1", children: "s" }),
              " for",
              " ",
              /* @__PURE__ */ jsx("span", { "x-text": "getBooksWithImages()" }),
              " book",
              /* @__PURE__ */ jsx("span", { "x-show": "getBooksWithImages() !== 1", children: "s" })
            ] }),
            /* @__PURE__ */ jsx("span", { "x-show": "uploading", children: "Uploading..." })
          ]
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", "x-bind:disabled": "uploading", children: "Skip for now" }) })
    ] })
  ] });
};
var BulkCoverUpload_default = BulkCoverUpload;
export {
  BulkCoverUpload_default as default
};
