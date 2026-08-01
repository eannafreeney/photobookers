import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import PageHeader from "../../../../components/app/PageHeader.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Link from "../../../../components/app/Link.js";
import VerifiedCreator from "../../../../components/app/VerifiedCreator.js";
import Button from "../../../../components/app/Button.js";
const proseClass = "text-lg leading-relaxed text-balance text-on-surface text-pretty font-display";
const getInteriorBookImages = (book) => {
  const raw = [...book?.images?.map((image) => image.imageUrl) ?? []].filter(
    Boolean
  );
  return Array.from(new Set(raw));
};
const MagazineIssuePage3 = ({ issue }) => {
  const placements = issue.placements.filter((p) => p.book);
  const bookCount = placements.length;
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-2xl flex-col gap-10", children: [
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
    ].filter(Boolean).join(" \xB7 ") }),
    issue.editorsLetter.length > 0 ? /* @__PURE__ */ jsxs(
      "section",
      {
        id: "editors-letter",
        class: "scroll-mt-24 flex max-w-xl flex-col gap-4 border-t border-outline pt-8",
        children: [
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", children: "Editor's letter" }),
          issue.editorsLetter.map((paragraph) => /* @__PURE__ */ jsx("p", { class: proseClass, children: paragraph })),
          /* @__PURE__ */ jsx("p", { class: "font-display text-lg italic text-on-surface-weak", children: "\u2014 Eanna de Fr\xE9ine, Photobookers Editor" })
        ]
      }
    ) : null,
    /* @__PURE__ */ jsx(ShareButton, {}),
    placements.length > 0 ? /* @__PURE__ */ jsx("section", { class: "flex flex-col gap-12 border-t border-outline pt-10", children: placements.map((placement) => /* @__PURE__ */ jsx(BookEntry, { placement }, placement.bookId)) }) : null,
    /* @__PURE__ */ jsx(Contributors, { placements })
  ] });
};
const BookEntry = ({ placement }) => {
  const { book, number } = placement;
  const title = book?.title ?? "Untitled";
  const artist = book?.artist;
  const href = book ? `/books/${book.slug}` : "#";
  const anchorId = book ? `book-${book.slug}` : `book-${number}`;
  const image = placement.selectedImageUrl ?? getInteriorBookImages(book)[0] ?? book?.coverUrl ?? null;
  return /* @__PURE__ */ jsxs("article", { id: anchorId, class: "scroll-mt-24 flex flex-col gap-5", children: [
    /* @__PURE__ */ jsx(BookImage, { src: image, alt: title }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { class: "h-px w-6 bg-accent" }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: `#${anchorId}`,
            class: "kicker text-accent no-underline hover:underline",
            children: [
              "Book ",
              number
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("h3", { class: "font-display text-2xl font-medium text-on-surface-strong text-balance", children: /* @__PURE__ */ jsx(Link, { href, className: "hover:text-accent no-underline", children: title }) }),
      /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center gap-2", children: /* @__PURE__ */ jsx(
        Link,
        {
          href: `/creators/${artist?.slug}`,
          className: "text-sm font-semibold text-on-surface-strong hover:text-accent no-underline",
          children: artist?.displayName
        }
      ) }),
      placement.blurb ? /* @__PURE__ */ jsx("p", { class: "text-base leading-relaxed text-on-surface text-pretty", children: placement.blurb }) : null,
      placement.artistPrompt && placement.artistQuote ? /* @__PURE__ */ jsxs("blockquote", { class: "border-l-2 border-accent pl-4 text-sm italic leading-relaxed text-on-surface", children: [
        /* @__PURE__ */ jsx("div", { class: "not-italic font-semibold text-on-surface-strong", children: `Question: ${placement.artistPrompt}` }),
        /* @__PURE__ */ jsx("div", { class: "not-italic font-semibold text-accent", children: `Answer: ${placement.artistQuote}` })
      ] }) : null,
      /* @__PURE__ */ jsx(
        Link,
        {
          href,
          className: "text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent",
          children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", size: "sm", width: "fit", children: "View on photobookers \u2192" })
        }
      )
    ] })
  ] });
};
const BookImage = ({ src, alt }) => {
  if (!src) {
    return /* @__PURE__ */ jsx("div", { class: "flex aspect-4/3 w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak", children: "No image" });
  }
  return /* @__PURE__ */ jsx("div", { class: "w-full overflow-hidden border border-outline bg-surface", children: /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt,
      loading: "lazy",
      class: "aspect-4/3 w-full object-cover"
    }
  ) });
};
const issueArtists = (placements) => {
  const byId = /* @__PURE__ */ new Map();
  for (const placement of placements) {
    const artist = placement.book?.artist;
    if (!artist) continue;
    const existing = byId.get(artist.id);
    if (existing) {
      existing.bookCount += 1;
    } else {
      byId.set(artist.id, { artist, bookCount: 1 });
    }
  }
  return Array.from(byId.values());
};
const Contributors = ({
  placements
}) => {
  const artists = issueArtists(placements);
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id: "artists",
      class: "scroll-mt-24 flex flex-col gap-6 border-t border-outline pt-8",
      children: [
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: "The artists", children: "The photographers in this issue" }),
        /* @__PURE__ */ jsx("ul", { class: "grid grid-cols-1 gap-px overflow-hidden border border-outline bg-outline sm:grid-cols-2", children: artists.map(({ artist, bookCount }) => {
          const verified = artist.status === "verified";
          const location = [artist.city, artist.country].filter(Boolean).join(", ");
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/creators/${artist.slug}`,
              class: "group flex items-center gap-4 bg-surface p-4 transition-colors hover:bg-surface-alt",
              children: [
                /* @__PURE__ */ jsx("div", { class: "relative size-14 shrink-0 overflow-hidden border border-outline bg-surface-alt", children: artist.coverUrl ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: artist.coverUrl,
                    alt: artist.displayName ?? "",
                    loading: "lazy",
                    class: "size-full object-cover"
                  }
                ) : null }),
                /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 flex-col gap-0.5", children: [
                  /* @__PURE__ */ jsxs("span", { class: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("span", { class: "truncate font-display text-base font-medium text-on-surface-strong group-hover:text-accent", children: artist.displayName ?? "\u2014" }),
                    verified ? /* @__PURE__ */ jsx(VerifiedCreator, { creatorStatus: "verified", size: "xs" }) : null
                  ] }),
                  /* @__PURE__ */ jsx("span", { class: "truncate text-sm text-on-surface-weak", children: location || (bookCount > 1 ? `${bookCount} books` : "Featured artist") })
                ] }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    "aria-hidden": "true",
                    class: "ml-auto shrink-0 text-on-surface-weak transition-colors group-hover:text-accent",
                    children: arrowRightIcon
                  }
                )
              ]
            }
          ) });
        }) })
      ]
    }
  );
};
const ShareButton = () => /* @__PURE__ */ jsx("div", { "x-data": "{ copied: false }", class: "pt-2", children: /* @__PURE__ */ jsxs(
  "button",
  {
    type: "button",
    "x-on:click": "\n            const url = window.location.href;\n            if (navigator.share) { navigator.share({ url }).catch(() => {}); }\n            else { navigator.clipboard?.writeText(url); copied = true; setTimeout(() => copied = false, 1800); }\n          ",
    children: [
      shareIcon,
      /* @__PURE__ */ jsx("span", { "x-text": "copied ? 'Link copied \u2726' : 'Share this issue'", children: "Share this issue" })
    ]
  }
) });
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
const shareIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: "size-4",
    "aria-hidden": "true",
    children: [
      /* @__PURE__ */ jsx("circle", { cx: "18", cy: "5", r: "3" }),
      /* @__PURE__ */ jsx("circle", { cx: "6", cy: "12", r: "3" }),
      /* @__PURE__ */ jsx("circle", { cx: "18", cy: "19", r: "3" }),
      /* @__PURE__ */ jsx("path", { d: "M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" })
    ]
  }
);
var MagazineIssuePage3_default = MagazineIssuePage3;
export {
  MagazineIssuePage3_default as default
};
