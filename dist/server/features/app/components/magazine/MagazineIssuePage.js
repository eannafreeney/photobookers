import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import PageHeader from "../../../../components/app/PageHeader.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Link from "../../../../components/app/Link.js";
const proseClass = "text-lg leading-relaxed text-balance text-on-surface text-pretty font-display";
const MagazineIssuePage = ({ issue }) => {
  const placements = issue.placements.filter((p) => p.book);
  const bookCount = placements.length;
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-3xl flex-col gap-10", children: [
    issue.bannerUrl ? /* @__PURE__ */ jsx("figure", { class: "flex flex-col gap-2", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: issue.bannerUrl,
        alt: `${issue.kicker ?? "Issue"}: ${issue.title}`,
        width: 1600,
        height: 560,
        class: "h-56 w-full border border-outline object-cover md:h-80"
      }
    ) }) : null,
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
        class: "scroll-mt-24 mx-auto flex max-w-xl flex-col gap-4 border-t border-outline pt-8",
        children: [
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0 mt-0", kicker: "Editor's letter", children: "Editor's letter" }),
          issue.editorsLetter.map((paragraph) => /* @__PURE__ */ jsx("p", { class: proseClass, children: paragraph })),
          /* @__PURE__ */ jsx("p", { class: "font-display text-lg italic text-on-surface-weak", children: "\u2014 The editors, Photobookers" })
        ]
      }
    ) : null,
    placements.length > 0 ? /* @__PURE__ */ jsx("section", { class: "flex flex-col border-t border-outline pt-8", children: placements.map((placement) => /* @__PURE__ */ jsx(
      MagazineBookPlate,
      {
        placement,
        align: placement.number % 2 === 1 ? "left" : "right"
      },
      placement.bookId
    )) }) : null,
    /* @__PURE__ */ jsx(ContributorsAndShare, { placements })
  ] });
};
const MagazineBookPlate = ({
  placement,
  align
}) => {
  const { book, number } = placement;
  const title = book?.title ?? "Untitled";
  const artist = book?.artist;
  const isVerified = artist?.status === "verified";
  const href = book ? `/books/${book.slug}` : "#";
  const isRight = align === "right";
  const image = placement.selectedImageUrl ?? book?.coverUrl ?? null;
  return /* @__PURE__ */ jsx(
    "aside",
    {
      class: clsx(
        "my-8 w-full border border-outline bg-surface-alt/50 p-5 md:w-4/5",
        isRight ? "md:ml-auto" : "md:mr-auto"
      ),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          class: clsx(
            "flex flex-col gap-5 sm:flex-row sm:items-stretch",
            isRight && "sm:flex-row-reverse sm:text-right"
          ),
          children: [
            image ? /* @__PURE__ */ jsx(
              Link,
              {
                href,
                className: "block w-full shrink-0 overflow-hidden border border-outline bg-surface no-underline sm:w-2/5",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: image,
                    alt: `Cover of ${title}`,
                    loading: "lazy",
                    class: "h-full min-h-64 w-full object-cover"
                  }
                )
              }
            ) : /* @__PURE__ */ jsx("div", { class: "flex min-h-64 w-full shrink-0 items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak sm:w-2/5", children: "No cover" }),
            /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 flex-col justify-center gap-2", children: [
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
              /* @__PURE__ */ jsx("h3", { class: "font-display text-xl font-medium text-on-surface-strong text-balance", children: /* @__PURE__ */ jsx(Link, { href, className: "hover:text-accent no-underline", children: title }) }),
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
            ] })
          ]
        }
      )
    }
  );
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
var MagazineIssuePage_default = MagazineIssuePage;
export {
  MagazineIssuePage_default as default
};
