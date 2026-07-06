import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { fadeTransition } from "../../lib/transitions.js";
const CarouselMobile = ({
  images = [],
  showIndicators = true
}) => {
  if (images.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-init": "autoplay",
      "x-data": `carouselForm(${JSON.stringify(images)})`,
      class: "relative w-full overflow-hidden",
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          class: "relative w-full min-h-70",
          "x-on:touchstart": "handleTouchStart($event)",
          "x-on:touchmove": "handleTouchMove($event)",
          "x-on:touchend": "handleTouchEnd()",
          ...fadeTransition,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                class: "absolute inset-0 z-20 bg-surface-variant/30 animate-pulse",
                "x-show": "!isFirstImageLoaded",
                "aria-hidden": "true",
                children: /* @__PURE__ */ jsx("div", { class: "w-full h-full flex items-center justify-center", children: imageSkeletonIcon })
              }
            ),
            /* @__PURE__ */ jsx("template", { "x-for": "(slide, index) in slides", children: /* @__PURE__ */ jsxs(
              "div",
              {
                class: "absolute inset-0 flex items-center justify-center overflow-hidden",
                "x-show": "currentSlideIndex === index + 1",
                "x-bind:class": "currentSlideIndex === index + 1 ? 'z-10' : 'z-0 pointer-events-none'",
                ...fadeTransition,
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      class: "absolute inset-0 bg-surface-variant",
                      "aria-hidden": "true"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      class: "relative z-10 block w-full h-full object-contain",
                      "x-bind:src": "slide.imgSrc",
                      "x-bind:alt": "slide.imgAlt",
                      "x-on:load": "if (index === 0) isFirstImageLoaded = true",
                      "x-on:error": "if (index === 0) isFirstImageLoaded = true"
                    }
                  )
                ]
              }
            ) }),
            showIndicators && /* @__PURE__ */ jsx("div", { class: "absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-2 pb-2", children: /* @__PURE__ */ jsx("template", { "x-for": "(slide, index) in slides", children: /* @__PURE__ */ jsx(
              "button",
              {
                class: "size-2 rounded-full transition",
                "x-on:click": "currentSlideIndex = index + 1",
                "x-bind:class": "[currentSlideIndex === index + 1 ? 'bg-on-surface' : 'bg-on-surface/50']",
                "x-bind:aria-label": "'slide ' + (index + 1)"
              }
            ) }) })
          ]
        }
      )
    }
  );
};
var CarouselMobile_default = CarouselMobile;
const imageSkeletonIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    "aria-hidden": "true",
    class: "w-full h-full fill-on-surface/20 dark:fill-on-surface-dark/20",
    preserveAspectRatio: "xMidYMid meet",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "fill-rule": "evenodd",
        d: "M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
        "clip-rule": "evenodd"
      }
    )
  }
);
export {
  CarouselMobile_default as default,
  imageSkeletonIcon
};
