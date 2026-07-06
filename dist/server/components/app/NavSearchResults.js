import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import VerifiedCreator from "./VerifiedCreator.js";
import Avatar from "./Avatar.js";
import { formatDate } from "../../utils.js";
import { tagBooksUrl } from "../../lib/tags.js";
const NavSearchResults = ({
  creators,
  books,
  fairs,
  isMobile = false,
  searchQuery,
  variant = "dropdown"
}) => {
  const hasResults = creators.length > 0 || books.length > 0 || fairs.length > 0;
  const fullResultsHref = searchQuery?.trim() ? `/search/results?search=${encodeURIComponent(searchQuery.trim())}` : null;
  const tagResultsHref = searchQuery?.trim() ? tagBooksUrl(searchQuery.trim()) : null;
  const isPage = variant === "page";
  const containerId = isPage ? void 0 : isMobile ? "search-results-mobile" : "search-results";
  const containerClass = isPage ? "rounded-radius border border-outline bg-surface-alt" : "fixed inset-0 z-50 h-screen w-screen md:absolute md:inset-auto top-18 md:top-11 md:h-auto md:w-fit md:min-w-64 lg:min-w-96 md:rounded-radius overflow-hidden rounded-radius border shadow-sm border-outline bg-surface-alt";
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: containerId,
      class: containerClass,
      "x-data": isPage ? void 0 : "{ isOpen: true }",
      "x-show": isPage ? void 0 : "isOpen",
      children: /* @__PURE__ */ jsxs("div", { class: isPage ? "p-4 md:p-6" : "max-h-[calc(100vh-4rem)] overflow-y-auto p-4", children: [
        !hasResults && !isPage ? /* @__PURE__ */ jsx("div", { class: "p-8 text-center", children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "No results found" }) }) : /* @__PURE__ */ jsxs(
          "div",
          {
            class: isPage ? "grid grid-cols-1 gap-4 lg:h-[calc(100vh-18rem)] lg:grid-cols-3 lg:overflow-hidden" : "flex flex-col gap-4",
            children: [
              (isPage || creators.length > 0) && /* @__PURE__ */ jsx(
                ResultsSection,
                {
                  isPage,
                  title: "Creators",
                  hasResults: creators.length > 0,
                  children: creators.map((creator) => /* @__PURE__ */ jsx(CreatorResultItem, { creator }, creator.id))
                }
              ),
              (isPage || books.length > 0) && /* @__PURE__ */ jsx(
                ResultsSection,
                {
                  isPage,
                  title: "Books",
                  hasResults: books.length > 0,
                  children: books.map((book) => /* @__PURE__ */ jsx(BookResultItem, { book }, book.id))
                }
              ),
              (isPage || fairs.length > 0) && /* @__PURE__ */ jsx(
                ResultsSection,
                {
                  isPage,
                  title: "Fairs",
                  hasResults: fairs.length > 0,
                  children: fairs.map((fair) => /* @__PURE__ */ jsx(FairResultItem, { fair }, fair.id))
                }
              )
            ]
          }
        ),
        !isPage && (fullResultsHref || tagResultsHref) ? /* @__PURE__ */ jsxs("div", { class: "mt-4 flex flex-col gap-2 border-t border-outline pt-4", children: [
          fullResultsHref ? /* @__PURE__ */ jsxs(CtaLinkButton, { href: fullResultsHref, children: [
            'View all results for "',
            searchQuery?.trim(),
            '"'
          ] }) : null,
          tagResultsHref ? /* @__PURE__ */ jsxs(CtaLinkButton, { href: tagResultsHref, children: [
            'View all books tagged with "',
            searchQuery?.trim(),
            '"'
          ] }) : null
        ] }) : null
      ] })
    }
  );
};
const ResultsSection = ({
  title,
  isPage,
  hasResults,
  children
}) => {
  if (isPage) {
    return /* @__PURE__ */ jsxs("section", { class: "flex flex-col rounded-radius border border-outline bg-surface p-4 lg:h-full lg:min-h-0 lg:overflow-hidden", children: [
      /* @__PURE__ */ jsx("h2", { class: "pb-3 text-xs font-semibold uppercase text-on-surface", children: title }),
      hasResults ? /* @__PURE__ */ jsx("ul", { class: "flex flex-1 flex-col gap-4 lg:min-h-0 lg:overflow-y-auto", children }) : /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface-muted", children: "No results found" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("div", { class: "pt-2 pb-1 text-xs font-semibold uppercase text-on-surface", children: title }),
    /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-4", children })
  ] });
};
const CtaLinkButton = ({
  href,
  children
}) => /* @__PURE__ */ jsx(
  "a",
  {
    href,
    class: "w-full whitespace-nowrap rounded-radius px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.16em] transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 active:opacity-100 active:outline-offset-0 cursor-pointer bg-primary text-on-primary",
    children
  }
);
const CreatorResultItem = ({ creator }) => {
  return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: `/creators/${creator.slug}`,
      class: "flex items-center gap-3 rounded-radius transition-colors",
      children: [
        /* @__PURE__ */ jsxs("div", { class: "relative", children: [
          /* @__PURE__ */ jsx(
            Avatar,
            {
              src: creator.coverUrl ?? "",
              alt: creator.displayName ?? "",
              size: "md"
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "absolute -top-1 -right-1", children: /* @__PURE__ */ jsx(
            VerifiedCreator,
            {
              creatorStatus: creator.status ?? "stub",
              size: "xs"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { class: "font-semibold text-on-surface truncate", children: creator.displayName }),
          /* @__PURE__ */ jsx("div", { class: "text-xs uppercase font-semibold text-on-surface", children: creator.type })
        ] })
      ]
    }
  ) });
};
const BookResultItem = ({ book }) => {
  return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: `/books/${book.slug}`,
      class: "flex items-center gap-3 rounded-radius transition-colors",
      "aria-label": `View ${book.title} by ${book.artist?.displayName ?? "Unknown artist"}`,
      children: [
        /* @__PURE__ */ jsx("div", { class: "shrink-0", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: book.coverUrl ?? "",
            alt: `${book.title} cover`,
            class: "w-12 h-12 object-cover rounded-sm",
            loading: "lazy"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { class: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { class: "font-semibold text-on-surface truncate", children: book.title }),
          book.artist && /* @__PURE__ */ jsxs("div", { class: "text-xs text-on-surface truncate", children: [
            book.artist.displayName,
            " ",
            book.publisher?.displayName && `- ${book.publisher?.displayName}`
          ] })
        ] })
      ]
    }
  ) });
};
const FairResultItem = ({ fair }) => {
  return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: `/fairs/${fair.slug}`,
      class: "flex items-center gap-3 rounded-radius transition-colors",
      "aria-label": `View ${fair.name}`,
      children: [
        /* @__PURE__ */ jsx("div", { class: "shrink-0", children: fair.coverUrl ? /* @__PURE__ */ jsx(
          "img",
          {
            src: fair.coverUrl,
            alt: `${fair.name} cover`,
            class: "w-12 h-12 object-cover rounded-sm",
            loading: "lazy"
          }
        ) : /* @__PURE__ */ jsx("div", { class: "w-12 h-12 bg-surface-alt rounded-sm flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { class: "text-xs text-on-surface-weak", children: "Fair" }) }) }),
        /* @__PURE__ */ jsxs("div", { class: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { class: "font-semibold text-on-surface truncate", children: fair.name }),
          /* @__PURE__ */ jsxs("div", { class: "text-xs text-on-surface truncate", children: [
            formatDate(fair.startDate),
            " - ",
            formatDate(fair.endDate)
          ] }),
          (fair.city || fair.country) && /* @__PURE__ */ jsx("div", { class: "text-xs text-on-surface-weak truncate", children: fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country })
        ] })
      ]
    }
  ) });
};
var NavSearchResults_default = NavSearchResults;
const closeIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: "1.5",
    stroke: "currentColor",
    class: "size-6",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M6 18 18 6M6 6l12 12"
      }
    )
  }
);
export {
  NavSearchResults_default as default
};
