import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getTodaysBookOfTheDay } from "../../features/app/BOTDServices.js";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek
} from "../../features/app/CreatorSpotlightServices.js";
import Button from "./Button.js";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons.js";
import {
  buildHeroCarouselItems,
  loadHeroCarouselCoverStacks,
  toAlpineDataJson
} from "../../features/app/utils.js";
const HeroCarousel = async () => {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek()
  ]);
  const [bookErr, bookOfTheDay] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;
  if (artistErr || publisherErr) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  const { publisherCoverStack, artistCoverStack } = await loadHeroCarouselCoverStacks({
    publisherCreatorId: !publisherErr && publisherOfTheWeek ? publisherOfTheWeek.creatorId : null,
    artistCreatorId: !artistErr && artistOfTheWeek ? artistOfTheWeek.creatorId : null
  });
  const heroItems = buildHeroCarouselItems(
    bookErr ? null : bookOfTheDay,
    artistErr ? null : artistOfTheWeek,
    publisherErr ? null : publisherOfTheWeek,
    publisherCoverStack,
    artistCoverStack
  );
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "x-data": `heroCarousel(${toAlpineDataJson(heroItems)})`,
      "x-init": "init()",
      "x-on:mouseenter": "pause()",
      "x-on:mouseleave": "resume()",
      "x-on:touchstart": "handleTouchStart($event)",
      "x-on:touchmove": "handleTouchMove($event)",
      "x-on:touchend": "handleTouchEnd()",
      children: [
        /* @__PURE__ */ jsx("div", { class: "hidden md:flex flex-wrap gap-3 py-3 sm:gap-8 sm:py-4 border-b border-outline", children: /* @__PURE__ */ jsx("template", { "x-for": "(item, index) in items", children: /* @__PURE__ */ jsx(
          "button",
          {
            "x-on:click": "go(index)",
            "x-bind:class": "active === index ? 'text-on-surface-strong border-b-2 border-accent' : 'text-on-surface-weak border-b-2 border-transparent'",
            class: "pb-2 kicker transition cursor-pointer",
            type: "button",
            "x-text": "item.label"
          }
        ) }) }),
        /* @__PURE__ */ jsxs(
          "section",
          {
            class: "relative overflow-hidden py-6 text-on-surface transition-colors duration-300 ease-out sm:py-8 md:h-[500px]",
            "x-bind:class": "items[active] ? items[active].slideClass : ''",
            children: [
              /* @__PURE__ */ jsx("div", { class: "relative w-full md:h-full", children: /* @__PURE__ */ jsx("template", { "x-for": "(item, index) in items", children: /* @__PURE__ */ jsxs(
                "div",
                {
                  "x-show": "active === index",
                  "x-transition:enter": "transition ease-out duration-500",
                  "x-transition:enter-start": "opacity-0 translate-x-6",
                  "x-transition:enter-end": "opacity-100 translate-x-0",
                  class: "md:absolute md:inset-0 grid w-full grid-cols-1 grid-rows-[auto_auto] content-center gap-6 md:grid-cols-[3fr_2fr] md:grid-rows-1 md:gap-10 md:items-center",
                  children: [
                    /* @__PURE__ */ jsxs("div", { class: "relative order-1 flex w-full justify-center md:order-0", children: [
                      /* @__PURE__ */ jsx("template", { "x-if": "item.coverStack && item.coverStack.length >= 2", children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          class: "mx-auto grid max-h-[220px] w-fit max-w-[700px] grid-cols-2 gap-2 overflow-hidden min-[480px]:max-h-[300px] min-[480px]:gap-3 md:max-h-[340px]",
                          "x-bind:class": "item.coverStack.length === 2 ? 'min-[480px]:grid-cols-2' : item.coverStack.length === 3 ? 'min-[480px]:grid-cols-3' : 'min-[480px]:grid-cols-4'",
                          children: /* @__PURE__ */ jsx("template", { "x-for": "(url, i) in item.coverStack", children: /* @__PURE__ */ jsx("a", { "x-bind:href": "item.link", class: "cursor-pointer", children: /* @__PURE__ */ jsx(
                            "img",
                            {
                              "x-bind:src": "url",
                              "x-bind:class": "i >= 2 ? 'hidden min-[480px]:block' : ''",
                              class: "h-full max-h-[220px] w-full object-cover shadow-md min-[480px]:max-h-[300px] md:max-h-[340px] aspect-3/4"
                            }
                          ) }) })
                        }
                      ) }),
                      /* @__PURE__ */ jsx("template", { "x-if": "!item.coverStack || item.coverStack.length < 2", children: /* @__PURE__ */ jsx("a", { "x-bind:href": "item.link", class: "cursor-pointer", children: /* @__PURE__ */ jsx(
                        "img",
                        {
                          "x-bind:src": "item.image",
                          class: "max-h-[220px] shadow-xl transition duration-500 hover:scale-102 sm:max-h-[300px] md:max-h-[340px]"
                        }
                      ) }) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { class: "order-2 flex w-full max-w-md flex-col gap-2 md:order-0", children: [
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          class: "kicker text-accent text-center md:text-left",
                          "x-text": "item.label"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "p",
                        {
                          class: "font-display text-3xl font-medium text-on-surface-strong sm:text-5xl leading-tight text-center md:text-left text-balance",
                          "x-text": "item.title"
                        }
                      ),
                      /* @__PURE__ */ jsx("template", { "x-if": "item.text", children: /* @__PURE__ */ jsx(
                        "p",
                        {
                          class: "mb-2 text-on-surface text-center md:text-left text-sm",
                          "x-text": "item.text"
                        }
                      ) }),
                      /* @__PURE__ */ jsx("div", { class: "flex justify-center md:justify-start group", children: /* @__PURE__ */ jsx("a", { "x-bind:href": "item.link", class: "cursor-pointer", children: /* @__PURE__ */ jsx(
                        Button,
                        {
                          variant: "solid",
                          color: "primary",
                          width: "md",
                          "x-bind:href": "item.link",
                          children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center", children: [
                            "View",
                            /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap", children: "\xA0\u2192" })
                          ] })
                        }
                      ) }) })
                    ] })
                  ]
                }
              ) }) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "x-show": "items.length > 1",
                  "x-on:click": "prev()",
                  type: "button",
                  class: "hidden md:block absolute left-2 z-10 -translate-y-1/2 sm:left-6 md:left-10 top-1/2 cursor-pointer",
                  children: leftArrowIcon
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  "x-show": "items.length > 1",
                  "x-on:click": "next()",
                  type: "button",
                  class: "hidden md:block absolute right-2 z-10 -translate-y-1/2 sm:right-6 md:right-10 top-1/2 cursor-pointer",
                  children: rightArrowIcon
                }
              )
            ]
          }
        )
      ]
    }
  );
};
var HeroCarousel_default = HeroCarousel;
export {
  HeroCarousel_default as default
};
