import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import PageHeader from "../../../../components/app/PageHeader.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Link from "../../../../components/app/Link.js";
import {
  issue01BookEntries,
  issue01BookPlacements,
  issue01EditorsLetter,
  issue01EssaySections,
  issue01Meta
} from "../../content/magazine/issue01OnTheSidewalk.js";
const proseClass = "text-base leading-relaxed text-on-surface text-pretty";
const sectionNavClass = "rounded-full border border-outline px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-strong transition-colors hover:border-accent hover:text-accent";
function buildBookLookup(books) {
  const entryBySlug = new Map(
    issue01BookEntries.map((entry) => [entry.slug, entry])
  );
  const bookBySlug = /* @__PURE__ */ new Map();
  for (const [index, entry] of issue01BookEntries.entries()) {
    bookBySlug.set(entry.slug, books[index] ?? null);
  }
  const placementsBySection = /* @__PURE__ */ new Map();
  issue01BookPlacements.forEach((placement, index) => {
    const entry = entryBySlug.get(placement.slug);
    if (!entry) return;
    const sectionMap = placementsBySection.get(placement.afterSectionId) ?? /* @__PURE__ */ new Map();
    const atParagraph = sectionMap.get(placement.afterParagraphIndex) ?? [];
    atParagraph.push({
      entry,
      book: bookBySlug.get(placement.slug) ?? null,
      number: index + 1
    });
    sectionMap.set(placement.afterParagraphIndex, atParagraph);
    placementsBySection.set(placement.afterSectionId, sectionMap);
  });
  return placementsBySection;
}
const MagazineIssue01Page = ({ books }) => {
  const placementsBySection = buildBookLookup(books);
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-3xl flex-col gap-10", children: [
    /* @__PURE__ */ jsx("div", { class: "mx-auto w-full max-w-sm border border-outline", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: issue01Meta.coverUrl,
        alt: `${issue01Meta.kicker}: ${issue01Meta.title} \u2014 magazine cover`,
        width: 800,
        height: 1200,
        class: "w-full object-cover"
      }
    ) }),
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        kicker: issue01Meta.kicker,
        title: issue01Meta.title,
        intro: issue01Meta.subtitle
      }
    ),
    /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface", children: [
      issue01Meta.publishedLabel,
      " \xB7 ",
      issue01Meta.readingMinutes,
      " min read"
    ] }),
    /* @__PURE__ */ jsxs(
      "nav",
      {
        "aria-label": "Issue sections",
        class: "flex flex-wrap gap-2 border-y border-outline py-4",
        children: [
          /* @__PURE__ */ jsx("a", { href: "#editors-letter", class: sectionNavClass, children: "Letter" }),
          issue01EssaySections.map((section) => /* @__PURE__ */ jsxs("a", { href: `#${section.id}`, class: sectionNavClass, children: [
            section.kicker ? `${section.kicker}. ` : "",
            section.title
          ] }))
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "section",
      {
        id: "editors-letter",
        class: "scroll-mt-24 flex flex-col gap-4 border-t border-outline pt-8",
        children: [
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", children: issue01EditorsLetter.title }),
          issue01EditorsLetter.paragraphs.map((paragraph) => /* @__PURE__ */ jsx("p", { class: proseClass, children: paragraph }))
        ]
      }
    ),
    /* @__PURE__ */ jsxs("section", { class: "flex flex-col gap-10 border-t border-outline pt-8", children: [
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: "Essay", children: "The pavement as editing table" }),
      issue01EssaySections.map((section) => {
        const sectionPlacements = placementsBySection.get(section.id);
        return /* @__PURE__ */ jsxs(
          "article",
          {
            id: section.id,
            class: "scroll-mt-24 flex flex-col gap-4 border-t border-outline pt-8 first:border-t-0 first:pt-0",
            children: [
              /* @__PURE__ */ jsxs("h3", { class: "font-display text-2xl font-medium text-on-surface-strong text-balance", children: [
                section.kicker ? /* @__PURE__ */ jsxs("span", { class: "text-accent not-italic", children: [
                  section.kicker,
                  ". "
                ] }) : null,
                section.title
              ] }),
              section.paragraphs.map((paragraph, paragraphIndex) => /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { class: proseClass, children: paragraph }),
                sectionPlacements?.get(paragraphIndex)?.map(({ entry, book, number }) => /* @__PURE__ */ jsx(
                  MagazineBookCard,
                  {
                    number,
                    entry,
                    book,
                    align: number % 2 === 1 ? "right" : "left"
                  },
                  entry.slug
                ))
              ] }))
            ]
          }
        );
      })
    ] })
  ] });
};
const MagazineBookCard = ({
  number,
  entry,
  book,
  align
}) => {
  const title = book?.title ?? entry.slug;
  const artistName = book?.artist?.displayName;
  const href = `/books/${entry.slug}`;
  const isRight = align === "right";
  return /* @__PURE__ */ jsx(
    "aside",
    {
      class: clsx(
        "my-6 w-full max-w-xs border border-outline bg-surface-alt/40 p-4",
        isRight ? "md:ml-auto" : "md:mr-auto"
      ),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          class: clsx(
            "flex flex-col gap-4",
            isRight ? "md:items-end md:text-right" : "md:items-start md:text-left"
          ),
          children: [
            book?.coverUrl ? /* @__PURE__ */ jsx(Link, { href, children: /* @__PURE__ */ jsx(
              "img",
              {
                src: book.coverUrl,
                alt: `Cover of ${title}`,
                loading: "lazy",
                class: "aspect-square w-32 border border-outline bg-surface-alt object-cover"
              }
            ) }) : /* @__PURE__ */ jsx("div", { class: "flex aspect-square w-32 items-center justify-center border border-outline bg-surface-alt text-xs text-on-surface", children: "No cover" }),
            /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs("p", { class: "kicker text-accent", children: [
                "Book ",
                number
              ] }),
              /* @__PURE__ */ jsx("h4", { class: "font-display text-xl font-medium text-on-surface-strong", children: /* @__PURE__ */ jsx(Link, { href, className: "hover:text-accent no-underline", children: title }) }),
              artistName ? /* @__PURE__ */ jsx("p", { class: "text-sm font-medium text-on-surface", children: book?.artist?.slug ? /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/creators/${book.artist.slug}`,
                  className: "hover:text-accent",
                  children: artistName
                }
              ) : artistName }) : null,
              /* @__PURE__ */ jsx("p", { class: "text-sm leading-relaxed text-on-surface text-pretty", children: entry.blurb }),
              entry.artistPrompt ? /* @__PURE__ */ jsxs(
                "blockquote",
                {
                  class: clsx(
                    "border-accent text-sm italic leading-relaxed text-on-surface",
                    isRight ? "border-r-2 pr-4" : "border-l-2 pl-4"
                  ),
                  children: [
                    /* @__PURE__ */ jsxs("span", { class: "not-italic font-medium text-on-surface-strong", children: [
                      "For the artist:",
                      " "
                    ] }),
                    entry.artistPrompt
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
            ] })
          ]
        }
      )
    }
  );
};
var MagazineIssue01Page_default = MagazineIssue01Page;
export {
  MagazineIssue01Page_default as default
};
