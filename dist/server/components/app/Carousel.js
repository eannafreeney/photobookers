import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
const Carousel = ({ images = [] }) => {
  if (images.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "x-data": `carouselForm(${JSON.stringify(images)})`,
      class: "relative w-full overflow-hidden bg-white rounded-radius border border-outline p-2",
      children: [
        /* @__PURE__ */ jsx("div", { class: "w-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            class: "flex transition-transform duration-300 ease-out",
            "x-bind:style": "`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`",
            children: /* @__PURE__ */ jsx("template", { "x-for": "slide in slides", children: /* @__PURE__ */ jsx("div", { class: "w-full shrink-0 h-auto", children: /* @__PURE__ */ jsx(
              "img",
              {
                class: "w-full h-full object-contain",
                "x-bind:src": "slide.imgSrc",
                "x-bind:alt": "slide.imgAlt"
              }
            ) }) })
          }
        ) }),
        /* @__PURE__ */ jsx("div", { class: "flex gap-2 mt-4 overflow-x-auto pb-2", children: /* @__PURE__ */ jsx("template", { "x-for": "(slide, idx) in slides", children: /* @__PURE__ */ jsx(
          "button",
          {
            "x-on:click": "currentSlideIndex = idx + 1",
            class: "shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded cursor-pointer border-2 transition-all",
            "x-bind:class": "currentSlideIndex == idx + 1 ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'",
            children: /* @__PURE__ */ jsx(
              "img",
              {
                class: "w-full h-full object-cover",
                "x-bind:src": "slide.imgSrc",
                "x-bind:alt": "slide.imgAlt"
              }
            )
          }
        ) }) })
      ]
    }
  );
};
var Carousel_default = Carousel;
const leftArrowIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "3",
    class: "size-5 md:size-6 pr-0.5",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M15.75 19.5 8.25 12l7.5-7.5" })
  }
);
const rightArrowIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "3",
    class: "size-5 md:size-6 pl-0.5",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M8.25 4.5l7.5 7.5-7.5 7.5" })
  }
);
export {
  Carousel_default as default
};
