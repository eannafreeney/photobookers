import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SaveToListButton from "../../api/components/SaveToListButton.js";
import Button from "../../../components/app/Button.js";
import { formatDateWithoutYear } from "../../../utils.js";
import { botdIndexPath, botdPath } from "../spotlightUrls.js";
import { heroLcpImageSources } from "../../../lib/imageUrl.js";
const heroImage = (entry) => entry.featuredImageUrl ?? entry.book.coverUrl ?? entry.book.images?.[0]?.imageUrl ?? "";
const BookOfTheDayAnchor = ({
  today,
  yesterday,
  twoDaysAgo,
  threeDaysAgo,
  user
}) => {
  const book = today.book;
  const link = botdPath(today.date);
  const image = heroImage(today);
  const sources = image ? heroLcpImageSources(image) : null;
  const previousDays = [yesterday, twoDaysAgo, threeDaysAgo].filter(
    (entry) => Boolean(entry)
  );
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row gap-6 pb-8 items-center justify-center md:gap-12 md:py-14", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: link,
          class: "flex h-[340px] justify-center md:h-[440px] md:justify-end",
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src: sources?.src ?? image,
              srcset: sources?.srcSet,
              sizes: sources?.sizes,
              alt: book.title,
              width: 600,
              height: 800,
              fetchpriority: "high",
              class: "h-full w-auto max-w-full object-contain shadow-sm"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-3 text-center md:items-start md:text-left", children: [
        /* @__PURE__ */ jsxs("span", { class: "kicker text-accent", children: [
          "Book of the Day \xB7 ",
          formatDateWithoutYear(today.date)
        ] }),
        /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance md:text-5xl", children: /* @__PURE__ */ jsx("a", { href: link, children: book.title }) }),
        book.artist ? /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface md:text-base", children: [
          "by",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `/creators/${book.artist.slug}`,
              class: "underline decoration-accent underline-offset-4 hover:text-accent transition-colors",
              children: book.artist.displayName
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxs("div", { class: "mt-1 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("a", { href: link, class: "group", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "lg", children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center", children: [
            "today's pick",
            /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-6 group-hover:opacity-100", children: "\xA0\u2192" })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { class: "w-32", children: /* @__PURE__ */ jsx(SaveToListButton, { book, user, variant: "button" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center justify-between gap-6 border-t border-outline py-3", children: [
      /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center gap-6", children: previousDays.length > 0 && previousDays.map((day) => /* @__PURE__ */ jsxs(
        "a",
        {
          href: botdPath(day.date),
          class: "group flex min-w-0 items-center gap-3",
          children: [
            /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak shrink-0", children: formatDateWithoutYear(day.date) }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: heroImage(day),
                alt: "",
                class: "h-10 w-8 shrink-0 object-cover",
                loading: "lazy"
              }
            ),
            /* @__PURE__ */ jsx("span", { class: "min-w-0 truncate text-sm text-on-surface-strong group-hover:underline decoration-accent underline-offset-4", children: day.book.title })
          ]
        }
      )) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
        "a",
        {
          href: botdIndexPath(),
          class: "kicker text-on-surface-weak transition-colors hover:text-on-surface-strong",
          children: "Browse every pick \u2192"
        }
      ) })
    ] })
  ] });
};
var BookOfTheDayAnchor_default = BookOfTheDayAnchor;
export {
  BookOfTheDayAnchor_default as default
};
