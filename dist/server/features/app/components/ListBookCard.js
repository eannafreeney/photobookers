import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
import Link from "../../../components/app/Link.js";
import { bookShareText, bookShareTitle } from "../../../lib/share.js";
import SaveToListButton from "../../api/components/SaveToListButton.js";
import ShareButton from "../../api/components/ShareButton.js";
import SpotlightCreator from "./SpotlightCreator.js";
import { bookUrl } from "../spotlightUrls.js";
const galleryUrls = (book) => {
  const raw = [
    book.coverUrl,
    ...book.images?.map((image) => image.imageUrl) ?? []
  ].filter(Boolean);
  return Array.from(new Set(raw));
};
const ListBookCard = ({ book, user }) => {
  const images = galleryUrls(book);
  const artist = book.artist;
  const publisher = book.publisher;
  const note = book.note?.trim();
  const hasArtist = !!artist;
  const hasPublisher = !!publisher;
  const href = `/books/${book.slug}`;
  return /* @__PURE__ */ jsxs("article", { class: "flex w-full flex-col gap-5", children: [
    /* @__PURE__ */ jsx(ImageCarousel, { images, alt: book.title }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsx("h2", { class: "text-center font-display text-2xl font-medium text-on-surface-strong text-balance", children: /* @__PURE__ */ jsx(Link, { href, className: "hover:text-accent no-underline", children: book.title }) }),
      (hasArtist || hasPublisher) && /* @__PURE__ */ jsxs(
        "div",
        {
          class: `flex w-full flex-col items-center gap-4 ${hasArtist && hasPublisher ? "sm:grid sm:grid-cols-2" : ""}`,
          children: [
            hasArtist ? /* @__PURE__ */ jsx("a", { href: `/creators/${artist.slug}`, children: /* @__PURE__ */ jsx(
              SpotlightCreator,
              {
                creator: artist,
                role: "Artist",
                truncateName: false,
                isVerified: artist.status === "verified"
              }
            ) }) : null,
            hasPublisher ? /* @__PURE__ */ jsx("a", { href: `/creators/${publisher.slug}`, children: /* @__PURE__ */ jsx(
              SpotlightCreator,
              {
                creator: publisher,
                role: "Publisher",
                truncateName: false,
                isVerified: publisher.status === "verified"
              }
            ) }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { class: "grid w-full grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(SaveToListButton, { book, user, variant: "button" }),
        /* @__PURE__ */ jsx(
          ShareButton,
          {
            title: bookShareTitle(book),
            text: bookShareText(book),
            url: bookUrl(book.slug)
          }
        )
      ] }),
      note ? /* @__PURE__ */ jsx("p", { class: "max-w-prose whitespace-pre-wrap text-center text-base leading-relaxed text-on-surface text-pretty", children: note }) : null,
      /* @__PURE__ */ jsx("a", { href, class: "w-full", children: /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", color: "primary", width: "full", children: "View book \u2192" }) })
    ] })
  ] });
};
const ImageCarousel = ({ images, alt }) => {
  if (images.length === 0) {
    return /* @__PURE__ */ jsx("div", { class: "flex aspect-[4/5] w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak", children: "No images" });
  }
  const multiple = images.length > 1;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": `carouselForm(${JSON.stringify(images)})`,
      class: "group relative w-full overflow-hidden border border-outline bg-surface-alt",
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          class: "relative w-full",
          "x-on:touchstart": "handleTouchStart($event)",
          "x-on:touchmove": "handleTouchMove($event)",
          "x-on:touchend": "handleTouchEnd()",
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                class: "flex items-center h-full transition-transform duration-300 ease-out",
                "x-bind:style": "`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`",
                children: /* @__PURE__ */ jsx("template", { "x-for": "slide in slides", children: /* @__PURE__ */ jsx("div", { class: "h-full w-full shrink-0", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    class: "h-full w-full object-contain",
                    "x-bind:src": "slide.imgSrc",
                    alt,
                    loading: "lazy"
                  }
                ) }) })
              }
            ),
            multiple ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Previous image",
                  "x-on:click": "previous()",
                  class: "absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100 cursor-pointer",
                  children: arrowLeftIcon
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Next image",
                  "x-on:click": "next()",
                  class: "absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100 cursor-pointer",
                  children: arrowRightIcon
                }
              ),
              /* @__PURE__ */ jsx("div", { class: "absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5", children: /* @__PURE__ */ jsx("template", { "x-for": "(slide, index) in slides", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  class: "size-1.5 rounded-full transition",
                  "x-on:click": "currentSlideIndex = index + 1",
                  "x-bind:class": "currentSlideIndex === index + 1 ? 'bg-on-surface-strong w-4' : 'bg-on-surface/50'",
                  "x-bind:aria-label": "'Image ' + (index + 1)"
                }
              ) }) })
            ] }) : null
          ]
        }
      )
    }
  );
};
const arrowLeftIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "2.5",
    class: "size-4",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M15.75 19.5 8.25 12l7.5-7.5" })
  }
);
const arrowRightIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "2.5",
    class: "size-4",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M8.25 4.5l7.5 7.5-7.5 7.5" })
  }
);
var ListBookCard_default = ListBookCard;
export {
  ListBookCard_default as default
};
