import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { dragHandleIcon } from "../../../../lib/icons.js";
const ImagePreviewGrid = () => {
  const reorderAttrs = {
    draggable: true,
    "@dragstart": "onReorderDragStart(index)",
    "@dragenter.prevent": "onReorderDragEnter(index)",
    "@dragover.prevent": true,
    "@dragend": "onReorderDragEnd()",
    "@drop.prevent": true,
    ":class": "dragOverIndex === index ? 'ring-2 ring-primary scale-[0.98]' : ''"
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { class: "grid grid-cols-4 gap-4", "x-show": "images.length > 0", children: /* @__PURE__ */ jsx("template", { "x-for": "(img, index) in images", "x-bind:key": "img.id", children: /* @__PURE__ */ jsxs("div", { class: "relative group", ...reorderAttrs, children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        "x-bind:src": "img.previewUrl",
        class: "w-full aspect-square object-cover rounded border cursor-pointer",
        alt: "Gallery image",
        "x-on:click": "previewImage = img.previewUrl"
      }
    ),
    /* @__PURE__ */ jsx("div", { class: "absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-black/55 text-white p-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none", children: dragHandleIcon() }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "x-on:click": "removeImage(index)",
        class: "absolute cursor-pointer top-1 right-1 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
        children: removeIcon
      }
    ),
    /* @__PURE__ */ jsx(
      "span",
      {
        class: "absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded",
        "x-text": "index + 1"
      }
    )
  ] }) }) }) });
};
var ImagePreviewGrid_default = ImagePreviewGrid;
const removeIcon = /* @__PURE__ */ jsx("svg", { class: "size-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
  "path",
  {
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "2",
    d: "M6 18L18 6M6 6l12 12"
  }
) });
export {
  ImagePreviewGrid_default as default
};
