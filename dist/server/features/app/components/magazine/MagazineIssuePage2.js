import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import PageHeader from "../../../../components/app/PageHeader.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Link from "../../../../components/app/Link.js";
const proseClass = "text-lg leading-relaxed text-balance text-on-surface text-pretty font-display";
const bookImages = (book) => {
  const raw = [
    book?.coverUrl,
    ...book?.images?.map((image) => image.imageUrl) ?? []
  ].filter(Boolean);
  return Array.from(new Set(raw));
};
const MagazineIssuePage2 = ({ issue }) => {
  const placements = issue.placements.filter((p) => p.book);
  const bookCount = placements.length;
  const [featured, ...rest] = placements;
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-5xl flex-col gap-12", children: [
    issue.bannerUrl ? /* @__PURE__ */ jsx("figure", { class: "-mt-2 flex flex-col gap-2", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: issue.bannerUrl,
        alt: `${issue.kicker ?? "Issue"}: ${issue.title}`,
        width: 1600,
        height: 560,
        class: "h-56 w-full border border-outline object-cover md:h-96"
      }
    ) }) : null,
    /* @__PURE__ */ jsxs("header", { class: "grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsx(
          PageHeader,
          {
            kicker: issue.kicker ?? void 0,
            title: issue.title,
            intro: issue.subtitle ?? void 0
          }
        ),
        /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: [
          issue.publishedLabel,
          issue.readingMinutes ? `${issue.readingMinutes} min read` : null,
          `${bookCount} books`
        ].filter(Boolean).join(" \xB7 ") })
      ] }),
      issue.editorsLetter.length > 0 ? /* @__PURE__ */ jsxs(
        "section",
        {
          id: "editors-letter",
          class: "scroll-mt-24 flex flex-col gap-4 border-l-0 border-t border-outline pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0",
          children: [
            /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Editor's letter" }),
            issue.editorsLetter.map((paragraph) => /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface text-pretty font-display", children: paragraph })),
            /* @__PURE__ */ jsx("p", { class: "font-display text-base italic text-on-surface-weak", children: "\u2014 The editors, Photobookers" })
          ]
        }
      ) : null
    ] }),
    placements.length > 0 ? /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-10 border-t border-outline pt-10", children: [
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: "The selection", children: "Books in this issue" }),
      featured ? /* @__PURE__ */ jsx(FeaturedBookPlate, { placement: featured }) : null,
      rest.length > 0 ? /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 items-start gap-8 sm:grid-cols-2", children: rest.map((placement) => /* @__PURE__ */ jsx(BookCard, { placement }, placement.bookId)) }) : null
    ] }) : null,
    /* @__PURE__ */ jsx(ContributorsAndShare, { placements })
  ] });
};
const BookCarousel = ({
  images,
  ratio = "aspect-[4/5]"
}) => {
  if (images.length === 0) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        class: clsx(
          "flex w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak",
          ratio
        ),
        children: "No images"
      }
    );
  }
  const multiple = images.length > 1;
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": `carouselForm(${JSON.stringify(images)})`,
      class: "group relative w-full overflow-hidden border border-outline bg-surface",
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          class: clsx("relative w-full", ratio),
          "x-on:touchstart": "handleTouchStart($event)",
          "x-on:touchmove": "handleTouchMove($event)",
          "x-on:touchend": "handleTouchEnd()",
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                class: "flex h-full transition-transform duration-300 ease-out",
                "x-bind:style": "`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`",
                children: /* @__PURE__ */ jsx("template", { "x-for": "slide in slides", children: /* @__PURE__ */ jsx("div", { class: "h-full w-full shrink-0", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    class: "h-full w-full object-cover",
                    "x-bind:src": "slide.imgSrc",
                    "x-bind:alt": "slide.imgAlt",
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
                  class: "absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100",
                  children: arrowLeftIcon
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Next image",
                  "x-on:click": "next()",
                  class: "absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100",
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
const BookMeta = ({
  placement,
  align = "left"
}) => {
  const { book, number } = placement;
  const title = book?.title ?? "Untitled";
  const artist = book?.artist;
  const isVerified = artist?.status === "verified";
  const href = book ? `/books/${book.slug}` : "#";
  const isRight = align === "right";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      class: clsx(
        "flex min-w-0 flex-col gap-3",
        isRight && "sm:items-end sm:text-right"
      ),
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            class: clsx(
              "flex items-center gap-2",
              isRight && "sm:flex-row-reverse"
            ),
            children: [
              /* @__PURE__ */ jsx("span", { class: "h-px w-6 bg-accent" }),
              /* @__PURE__ */ jsxs("span", { class: "kicker text-accent", children: [
                "Book ",
                number
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("h3", { class: "font-display text-2xl font-medium text-on-surface-strong text-balance", children: /* @__PURE__ */ jsx(Link, { href, className: "hover:text-accent no-underline", children: title }) }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            class: clsx(
              "flex flex-wrap items-center gap-2",
              isRight && "sm:justify-end"
            ),
            children: [
              artist?.displayName ? artist.slug ? /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/creators/${artist.slug}`,
                  className: "text-sm font-semibold text-on-surface-strong hover:text-accent no-underline",
                  children: artist.displayName
                }
              ) : /* @__PURE__ */ jsx("span", { class: "text-sm font-semibold text-on-surface-strong", children: artist.displayName }) : null,
              isVerified ? /* @__PURE__ */ jsx("span", { class: "inline-flex items-center gap-1 rounded-full border border-[#4f7a4a]/40 bg-[#4f7a4a]/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[#4f7a4a]", children: "\u2726 Verified" }) : /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center gap-1 rounded-full border border-dashed border-on-surface-weak px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-on-surface-weak", children: [
                "Unclaimed \xB7",
                " ",
                /* @__PURE__ */ jsx(Link, { href, className: "text-accent no-underline", children: "invite" })
              ] })
            ]
          }
        ),
        placement.blurb ? /* @__PURE__ */ jsx("p", { class: "text-sm leading-relaxed text-on-surface text-pretty", children: placement.blurb }) : null,
        placement.artistQuote ? /* @__PURE__ */ jsxs(
          "blockquote",
          {
            class: clsx(
              "text-sm italic leading-relaxed text-on-surface",
              isRight ? "border-r-2 border-accent pr-4" : "border-l-2 border-accent pl-4"
            ),
            children: [
              /* @__PURE__ */ jsxs("span", { class: "not-italic font-semibold text-accent", children: [
                "From the artist:",
                " "
              ] }),
              placement.artistQuote
            ]
          }
        ) : placement.artistPrompt ? /* @__PURE__ */ jsxs(
          "blockquote",
          {
            class: clsx(
              "text-sm italic leading-relaxed text-on-surface",
              isRight ? "border-r-2 border-accent pr-4" : "border-l-2 border-accent pl-4"
            ),
            children: [
              /* @__PURE__ */ jsxs("span", { class: "not-italic font-semibold text-on-surface-strong", children: [
                "For the artist:",
                " "
              ] }),
              placement.artistPrompt
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx(
          Link,
          {
            href,
            className: "text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent",
            children: "View on photobookers \u2192"
          }
        )
      ]
    }
  );
};
const FeaturedBookPlate = ({
  placement
}) => {
  const images = bookImages(placement.book);
  return /* @__PURE__ */ jsxs("article", { class: "grid grid-cols-1 items-center gap-6 border border-outline bg-surface-alt/50 p-5 md:grid-cols-[3fr_2fr] md:gap-8 md:p-8", children: [
    /* @__PURE__ */ jsx(BookCarousel, { images, ratio: "aspect-[4/3] md:aspect-[5/4]" }),
    /* @__PURE__ */ jsx(BookMeta, { placement })
  ] });
};
const BookCard = ({ placement }) => {
  const images = bookImages(placement.book);
  return /* @__PURE__ */ jsxs("article", { class: "flex h-full flex-col gap-4 border border-outline bg-surface-alt/50 p-5", children: [
    /* @__PURE__ */ jsx(BookCarousel, { images, ratio: "aspect-[4/5]" }),
    /* @__PURE__ */ jsx(BookMeta, { placement })
  ] });
};
const ContributorsAndShare = ({
  placements
}) => /* @__PURE__ */ jsxs(
  "section",
  {
    id: "artists",
    class: "scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8",
    children: [
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: "The artists", children: "The photographers in this issue" }),
      /* @__PURE__ */ jsx("p", { class: proseClass, children: "Every book in this issue belongs to a photographer on photobookers. Verified artists have claimed their profiles; the rest have an open invitation waiting \u2014 being featured here is the reason to accept it." }),
      /* @__PURE__ */ jsx("ul", { class: "grid grid-cols-2 gap-2 sm:grid-cols-3", children: placements.map((placement) => {
        const artist = placement.book?.artist;
        const verified = artist?.status === "verified";
        return /* @__PURE__ */ jsxs("li", { class: "flex flex-col gap-0.5 border border-outline bg-surface-alt/50 p-3", children: [
          /* @__PURE__ */ jsx("span", { class: "font-display text-base font-medium text-on-surface-strong", children: artist?.displayName ?? "\u2014" }),
          /* @__PURE__ */ jsx(
            "span",
            {
              class: clsx(
                "text-[0.6rem] font-semibold uppercase tracking-wider",
                verified ? "text-[#4f7a4a]" : "text-on-surface-weak"
              ),
              children: verified ? "\u2726 Verified" : "Invited"
            }
          )
        ] });
      }) }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          class: "flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-6",
          "x-data": "{ copied: false }",
          children: [
            /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Featured? Take it with you." }),
            /* @__PURE__ */ jsx("h3", { class: "font-display text-xl font-medium text-on-surface-strong", children: "Share the issue \u2014 or your page in it" }),
            /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface text-pretty", children: "Every featured artist gets a direct link to their book and a ready-made share card. One tap, no design work. This is how an issue travels." }),
            /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-3 pt-1", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  class: "border border-on-surface-strong px-4 py-2 text-sm font-semibold text-on-surface-strong transition-colors hover:border-accent hover:text-accent",
                  "x-on:click": "navigator.clipboard?.writeText(window.location.href); copied = true; setTimeout(() => copied = false, 1800)",
                  children: "Copy issue link"
                }
              ),
              /* @__PURE__ */ jsx("span", { "x-show": "copied", "x-cloak": true, class: "text-sm font-medium text-[#4f7a4a]", children: "Link copied \u2726" })
            ] })
          ]
        }
      )
    ]
  }
);
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
var MagazineIssuePage2_default = MagazineIssuePage2;
export {
  MagazineIssuePage2_default as default
};
