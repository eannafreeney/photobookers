import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import PreviewButton from "../../../api/components/PreviewButton.js";
import Button from "../../../../components/app/Button.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import PublishToggleForm from "./PublishToggleForm.js";
import DeleteBookForm from "./BookDeleteForm.js";
import TableSearch from "../../../../components/app/TableSearch.js";
import Link from "../../../../components/app/Link.js";
const BooksOverviewMobile = ({
  books,
  user,
  title = "My Books"
}) => {
  const alpineAttrs = {
    "x-init": "true",
    "@books:updated.window": "$ajax('/dashboard', { target: 'books-table-body' })"
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: title }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/books/create", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New Book" }) }),
      /* @__PURE__ */ jsx(
        TableSearch,
        {
          isMobile: true,
          target: "books-table",
          action: "/dashboard",
          placeholder: "Filter books..."
        }
      )
    ] }),
    books?.length > 0 && /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-4", id: "books-table", ...alpineAttrs, children: books.map((book) => /* @__PURE__ */ jsx(BookTableRowMobile, { book, user }, book.id)) })
  ] });
};
var BooksOverviewMobile_default = BooksOverviewMobile;
const BookTableRowMobile = ({ book, user }) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return null;
  }
  const releaseDateFormatted = book.releaseDate ? book.releaseDate.toISOString().slice(0, 10).split("-").reverse().join("/") : "";
  return /* @__PURE__ */ jsx("li", { class: "rounded-radius border border-outline bg-surface-alt overflow-hidden", children: /* @__PURE__ */ jsxs("div", { class: "p-4 flex flex-col gap-3", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex gap-3", children: [
      /* @__PURE__ */ jsx("div", { class: "shrink-0", children: book.coverUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: book.coverUrl,
          alt: book.title,
          class: "h-14 w-11 object-cover rounded-sm"
        }
      ) : /* @__PURE__ */ jsx("a", { href: `/dashboard/books/${book.id}#book-images`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "warning", children: /* @__PURE__ */ jsx("span", { children: "Upload Cover" }) }) }) }),
      /* @__PURE__ */ jsxs("div", { class: "min-w-0 flex-1 flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: book.publicationStatus === "published" ? `/books/${book.slug}` : `/books/preview/${book.slug}`,
            children: /* @__PURE__ */ jsx("p", { class: "font-medium text-on-surface truncate", children: book.title })
          }
        ),
        book.artist && /* @__PURE__ */ jsx(
          "a",
          {
            href: `/creators/${book.artist.slug}`,
            class: "text-sm text-on-surface truncate hover:underline",
            children: book.artist.displayName
          }
        ),
        releaseDateFormatted ? /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface", children: releaseDateFormatted }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 border-t border-outline pt-3", children: [
      /* @__PURE__ */ jsx(PublishToggleForm, { book, user }),
      /* @__PURE__ */ jsx(PreviewButton, { book, user }),
      /* @__PURE__ */ jsx("a", { href: `/dashboard/books/${book.id}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", width: "sm", children: "Edit" }) }),
      /* @__PURE__ */ jsx(DeleteBookForm, { book, user })
    ] })
  ] }) });
};
export {
  BooksOverviewMobile_default as default
};
