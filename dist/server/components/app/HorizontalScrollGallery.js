import { Fragment, jsx } from "hono/jsx/jsx-runtime";
const HorizontalScrollGallery = ({ images, imageAlt }) => {
  if (images.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": "horizontalScrollGallery",
      class: "flex h-[min(70vh,36rem)] items-stretch gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3 snap-x snap-mandatory scroll-smooth",
      role: "region",
      "aria-label": "Image gallery",
      children: images.map((src, index) => /* @__PURE__ */ jsx(
        "div",
        {
          class: "h-[min(70vh,36rem)] shrink-0 snap-center overflow-hidden rounded-radius bg-surface-alt",
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src,
              alt: `${imageAlt} ${index + 1}`,
              loading: index === 0 ? "eager" : "lazy",
              class: "block h-[min(70vh,36rem)] w-auto"
            }
          )
        },
        src
      ))
    }
  );
};
var HorizontalScrollGallery_default = HorizontalScrollGallery;
export {
  HorizontalScrollGallery_default as default
};
