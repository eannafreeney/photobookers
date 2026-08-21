import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatCountry } from "../../../lib/utils.js";
import FollowButton from "../../api/components/FollowButton.js";
import SectionHeader from "../../../components/app/SectionHeader.js";
import { bookPath } from "../spotlightUrls.js";
const LABEL = {
  artist: "Artist of the Week",
  publisher: "Publisher of the Week"
};
const PORTRAIT_PX = 288;
const CreatorOfTheWeekSpotlight = ({ spotlight, user }) => {
  const { creator, role, link } = spotlight;
  const portrait = spotlight.featuredImageUrl ?? creator.coverUrl ?? "";
  const covers = spotlight.coverStack.slice(0, 4);
  const blurb = spotlight.spotlightBlurb?.trim() || creator.tagline?.trim();
  const portraitClass = covers.length ? "size-32 sm:size-44 md:size-56" : "size-40 sm:size-56 md:size-72";
  return /* @__PURE__ */ jsxs("section", { class: "flex flex-col", "aria-label": LABEL[role], children: [
    /* @__PURE__ */ jsx(SectionHeader, { kicker: LABEL[role] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-5", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-start gap-5", children: [
        portrait ? /* @__PURE__ */ jsx("a", { href: link, class: "shrink-0", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: portrait,
            alt: creator.displayName,
            width: PORTRAIT_PX,
            height: PORTRAIT_PX,
            class: `${portraitClass} object-cover`,
            loading: "lazy",
            decoding: "async"
          }
        ) }) : null,
        /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 flex-1 flex-col gap-2", children: [
          /* @__PURE__ */ jsx("h3", { class: "font-display text-2xl font-medium leading-tight text-on-surface-strong text-balance", children: /* @__PURE__ */ jsx("a", { href: link, children: creator.displayName }) }),
          creator.country?.trim() ? /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface-weak", children: [
            "Based in ",
            formatCountry(creator.country.trim())
          ] }) : null,
          blurb ? /* @__PURE__ */ jsx("p", { class: "text-pretty text-sm leading-relaxed text-on-surface line-clamp-5", children: blurb }) : null,
          /* @__PURE__ */ jsxs("div", { class: "mt-1 flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { class: "w-32", children: /* @__PURE__ */ jsx(FollowButton, { creator, user, variant: "hero" }) }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: link,
                class: "kicker group inline-flex items-center text-on-surface-weak transition-colors hover:text-on-surface-strong",
                children: [
                  "View feature",
                  /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-4 group-hover:opacity-100", children: "\xA0\u2192" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      covers.length > 0 ? /* @__PURE__ */ jsx(
        "ul",
        {
          class: "flex items-end gap-3",
          "aria-label": `Books from ${creator.displayName}`,
          children: covers.map((book) => /* @__PURE__ */ jsx("li", { class: "list-none", children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: bookPath(book.slug),
              title: book.title,
              class: "group/cover flex flex-col gap-1",
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: book.coverUrl,
                    alt: book.title,
                    class: "h-20 w-auto object-contain object-bottom sm:h-24",
                    loading: "lazy",
                    decoding: "async"
                  }
                ),
                /* @__PURE__ */ jsx("span", { class: "line-clamp-2 h-8 max-w-28 text-[11px] leading-4 text-on-surface-weak opacity-0 transition-opacity duration-200 group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100", children: book.title })
              ]
            }
          ) }, book.slug))
        }
      ) : null
    ] })
  ] });
};
var CreatorOfTheWeekSpotlight_default = CreatorOfTheWeekSpotlight;
export {
  CreatorOfTheWeekSpotlight_default as default
};
