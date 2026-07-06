import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { toAlpineDataJson } from "../../features/app/utils.js";
import { heroLcpImageSources } from "../../lib/imageUrl.js";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons.js";
import Button from "./Button.js";
const HERO_IMAGE_CLASS = "h-auto w-full max-h-[220px] object-contain sm:max-h-[260px] md:h-full md:max-h-none md:w-full object-cover";
const HERO_SLIDE_GRID_CLASS = "grid grid-cols-1 pt-6 pb-12 md:h-full md:grid-cols-2 md:pt-0 md:pb-0";
const HERO_TEXT_COLUMN_CLASS = "flex flex-col items-center justify-center order-2 px-4 py-4 text-center sm:p-8 lg:p-12";
const HERO_BUTTON_ROW_CLASS = "mt-1 mb-4 flex items-center justify-center gap-3 group md:justify-start";
const HERO_IMAGE_WIDTH = 600;
const HERO_IMAGE_HEIGHT = 800;
const HeroCarouselFeatureCard = ({ heroItems }) => {
  if (heroItems.length === 0) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  const firstItem = heroItems[0];
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": `heroCarousel(${toAlpineDataJson(heroItems)})`,
      "x-init": "init()",
      "x-on:mouseenter": "pause()",
      "x-on:mouseleave": "resume()",
      "x-on:touchstart": "handleTouchStart($event)",
      "x-on:touchmove": "handleTouchMove($event)",
      "x-on:touchend": "handleTouchEnd()",
      children: /* @__PURE__ */ jsxs(
        "section",
        {
          class: `border-t-2 border-b-2 border-on-surface-strong relative text-on-surface transition-colors duration-300 ease-out md:h-[500px] ${firstItem.slideClass ?? ""}`,
          "x-bind:class": "items[active] ? items[active].slideClass : ''",
          children: [
            /* @__PURE__ */ jsxs("div", { class: "relative overflow-hidden rounded-radius md:h-full", children: [
              /* @__PURE__ */ jsx(
                HeroCarouselLcpSlide,
                {
                  item: firstItem,
                  "x-show": "active === 0",
                  class: "md:absolute md:inset-0"
                }
              ),
              /* @__PURE__ */ jsx("template", { "x-for": "(item, index) in items.slice(1)", children: /* @__PURE__ */ jsx(
                "div",
                {
                  "x-show": "active === index + 1",
                  "x-transition:enter": "transition ease-out duration-500",
                  "x-transition:enter-start": "opacity-0 translate-x-6",
                  "x-transition:enter-end": "opacity-100 translate-x-0",
                  class: "md:absolute md:inset-0",
                  children: /* @__PURE__ */ jsxs("div", { class: HERO_SLIDE_GRID_CLASS, children: [
                    /* @__PURE__ */ jsx("div", { class: HERO_TEXT_COLUMN_CLASS, children: /* @__PURE__ */ jsxs("div", { class: "max-w-xl flex flex-col items-center justify-center gap-2", children: [
                      /* @__PURE__ */ jsx("p", { class: "kicker text-accent", "x-text": "item.label" }),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          class: "font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance sm:text-5xl",
                          "x-text": "item.title"
                        }
                      ),
                      /* @__PURE__ */ jsx("template", { "x-if": "item.text", children: /* @__PURE__ */ jsx(
                        "p",
                        {
                          class: "max-w-md text-sm leading-6 text-on-surface sm:text-base",
                          "x-text": "item.text"
                        }
                      ) }),
                      /* @__PURE__ */ jsx("div", { class: HERO_BUTTON_ROW_CLASS, children: /* @__PURE__ */ jsx("a", { "x-bind:href": "item.link", class: "cursor-pointer", children: /* @__PURE__ */ jsx(
                        Button,
                        {
                          variant: "solid",
                          color: "primary",
                          width: "lg",
                          "x-bind:href": "item.link",
                          children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center", children: [
                            "View feature",
                            /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap", children: "\xA0\u2192" })
                          ] })
                        }
                      ) }) })
                    ] }) }),
                    /* @__PURE__ */ jsx("div", { class: "order-1 relative border-b border-outline/70 sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0", children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        "x-bind:href": "item.link",
                        class: "flex h-full w-full items-center justify-center md:justify-end cursor-pointer",
                        children: /* @__PURE__ */ jsx(
                          "img",
                          {
                            "x-bind:src": "item.image || ''",
                            "x-bind:alt": "item.title",
                            class: HERO_IMAGE_CLASS
                          }
                        )
                      }
                    ) })
                  ] })
                }
              ) }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  "x-show": "items.length > 1",
                  class: "hidden md:block absolute inset-x-0 top-6 z-20 kicker tabular-nums text-center text-on-surface-strong",
                  "aria-live": "polite",
                  "x-text": "`${active + 1}-${items.length}`",
                  children: heroItems.length > 1 ? `1-${heroItems.length}` : null
                }
              ),
              /* @__PURE__ */ jsx("div", { class: "absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2 md:hidden", children: /* @__PURE__ */ jsx("template", { "x-for": "(item, index) in items", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "x-on:click": "go(index)",
                  class: "h-2.5 w-2.5 rounded-full border border-outline/70 transition",
                  "x-bind:class": "active === index ? 'bg-on-surface-strong' : 'bg-surface/70'",
                  "x-bind:aria-label": "`Go to ${item.label}`"
                }
              ) }) })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                "x-show": "items.length > 1",
                "x-on:click": "prev()",
                type: "button",
                class: "group absolute left-2 top-2/3 md:top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center text-on-surface-strong transition duration-300 ease-out hover:-translate-x-1 sm:left-4 md:left-10 md:size-11 cursor-pointer",
                children: /* @__PURE__ */ jsx("span", { class: "transition-transform duration-300 ease-out group-hover:-translate-x-0.5", children: leftArrowIcon })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                "x-show": "items.length > 1",
                "x-on:click": "next()",
                type: "button",
                class: "group absolute right-2 top-2/3 md:top-1/2 z-20 flex size-8 -translate-y-1/2 items-center justify-center text-on-surface-strong transition duration-300 ease-out hover:translate-x-1 sm:right-4 md:right-10 md:size-11 cursor-pointer",
                children: /* @__PURE__ */ jsx("span", { class: "transition-transform duration-300 ease-out group-hover:translate-x-0.5", children: rightArrowIcon })
              }
            )
          ]
        }
      )
    }
  );
};
const HeroCarouselLcpSlide = ({
  item,
  class: className,
  "x-show": xShow
}) => {
  const imageSources = item.image ? heroLcpImageSources(item.image) : null;
  return /* @__PURE__ */ jsx("div", { class: className, ...xShow ? { "x-show": xShow } : {}, children: /* @__PURE__ */ jsxs("div", { class: HERO_SLIDE_GRID_CLASS, children: [
    /* @__PURE__ */ jsx("div", { class: HERO_TEXT_COLUMN_CLASS, children: /* @__PURE__ */ jsxs("div", { class: "max-w-xl flex flex-col items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: item.label }),
      /* @__PURE__ */ jsx("p", { class: "font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance sm:text-5xl", children: item.title }),
      item.text ? /* @__PURE__ */ jsx("p", { class: "max-w-md text-sm leading-6 text-on-surface sm:text-base", children: item.text }) : null,
      /* @__PURE__ */ jsx("div", { class: HERO_BUTTON_ROW_CLASS, children: /* @__PURE__ */ jsx("a", { href: item.link, class: "cursor-pointer", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "solid",
          color: "primary",
          width: "lg",
          href: item.link,
          children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center", children: [
            "View feature",
            /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap", children: "\xA0\u2192" })
          ] })
        }
      ) }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { class: "order-1 relative border-b border-outline/70 sm:px-4 sm:py-6 md:order-2 md:h-full md:min-h-[240px] md:border-b-0 md:px-0 md:py-0", children: /* @__PURE__ */ jsx(
      "a",
      {
        href: item.link,
        class: "flex h-full w-full items-center justify-center md:justify-end cursor-pointer",
        children: imageSources ? /* @__PURE__ */ jsx(
          "img",
          {
            src: imageSources.src,
            srcset: imageSources.srcSet,
            sizes: imageSources.sizes,
            alt: item.title,
            width: HERO_IMAGE_WIDTH,
            height: HERO_IMAGE_HEIGHT,
            fetchpriority: "high",
            class: HERO_IMAGE_CLASS
          }
        ) : null
      }
    ) })
  ] }) });
};
var HeroCarouselFeatureCard_default = HeroCarouselFeatureCard;
export {
  HeroCarouselFeatureCard_default as default
};
