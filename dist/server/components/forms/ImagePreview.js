import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
const ImagePreview = () => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { "x-show": "previewUrl", class: "relative w-full md:w-80", children: [
  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-variant mb-2", children: "Image Preview" }),
  /* @__PURE__ */ jsx(
    "img",
    {
      "x-bind:src": "previewUrl",
      class: "w-full rounded border",
      alt: "Book cover"
    }
  )
] }) });
var ImagePreview_default = ImagePreview;
export {
  ImagePreview_default as default
};
