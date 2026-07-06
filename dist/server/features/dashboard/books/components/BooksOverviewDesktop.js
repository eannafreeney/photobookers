import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import TableSearch from "../../../../components/app/TableSearch.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Button from "../../../../components/app/Button.js";
import Link from "../../../../components/app/Link.js";
import PreviewButton from "../../../api/components/PreviewButton.js";
import PublishToggleForm from "./PublishToggleForm.js";
import DeleteBookForm from "./BookDeleteForm.js";
import { getBookFunnelCounts } from "../../../book-analytics/funnel.js";
import Card from "../../../../components/app/Card.js";
import Table from "../../../../components/app/Table.js";
import { canEditBook } from "../../../../lib/permissions.js";
import { InfiniteScroll } from "../../../../components/app/InfiniteScroll.js";
import BookApprovalStatusPill from "../../admin/books/components/BookApprovalStatusPill.js";
import { dragHandleIcon } from "../../../../lib/icons.js";
const reorderHandleAttrs = {
  draggable: true,
  "@dragstart": "onReorderDragStart($event, $el.closest('tr'))",
  "@dragend": "onReorderDragEnd()"
};
const reorderRowAttrs = {
  "@dragenter.prevent": "onReorderDragEnter($el)",
  "@dragover.prevent": true,
  "@drop.prevent": true
};
const BooksOverviewDesktop = async ({
  books,
  user,
  currentPath,
  page,
  totalPages,
  reorderEnabled = false
}) => {
  const targetId = "books-table-body";
  const funnelCounts = await getBookFunnelCounts(books.map((book) => book.id));
  const showArtistColumn = user.creator?.type !== "artist";
  const showPublisherColumn = user.creator?.type !== "publisher";
  const tbodyAttrs = reorderEnabled ? {
    "@books:updated.window": "$ajax('/dashboard', { target: 'books-table-body' })"
  } : {
    "x-init": "true",
    "@books:updated.window": "$ajax('/dashboard', { target: 'books-table-body' })"
  };
  const tableWrapperAttrs = reorderEnabled ? {
    "x-data": `booksTableReorder(${JSON.stringify(books.map((book) => book.id))})`
  } : {};
  const emptyFunnel = {
    views: 0,
    favorites: 0,
    outboundClicks: 0
  };
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Books" }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(
        TableSearch,
        {
          target: "books-table",
          action: "/dashboard",
          placeholder: "Filter books..."
        }
      ),
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Link, { href: "/dashboard/books/import", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: "Import CSV" }) }),
        /* @__PURE__ */ jsx(Link, { href: "/dashboard/books/new", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New Book" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ...tableWrapperAttrs, children: /* @__PURE__ */ jsxs(Table, { id: "books-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        reorderEnabled ? /* @__PURE__ */ jsx(Table.HeadRow, { children: /* @__PURE__ */ jsx("span", { class: "sr-only", children: "Reorder" }) }) : null,
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
        showArtistColumn ? /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }) : null,
        showPublisherColumn ? /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }) : null,
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Views" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Favs" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Outbound clicks" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Approval" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publish" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...tbodyAttrs, children: books.map((book) => /* @__PURE__ */ jsx(
        BookTableRow,
        {
          book,
          user,
          funnel: funnelCounts.get(book.id) ?? emptyFunnel,
          reorderEnabled,
          showArtistColumn,
          showPublisherColumn
        }
      )) })
    ] }) }),
    !reorderEnabled && totalPages > 1 ? /* @__PURE__ */ jsx(
      InfiniteScroll,
      {
        baseUrl: currentPath,
        page,
        totalPages,
        targetId
      }
    ) : null
  ] });
};
var BooksOverviewDesktop_default = BooksOverviewDesktop;
const BookTableRow = ({
  book,
  user,
  funnel,
  reorderEnabled,
  showArtistColumn,
  showPublisherColumn
}) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  return /* @__PURE__ */ jsxs(
    "tr",
    {
      ...{ "data-book-id": book.id },
      ...reorderEnabled ? reorderRowAttrs : {},
      children: [
        reorderEnabled ? /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
          "div",
          {
            class: "flex items-center justify-center text-on-surface/50 cursor-grab active:cursor-grabbing",
            "aria-label": "Drag to reorder",
            ...reorderHandleAttrs,
            children: dragHandleIcon()
          }
        ) }) : null,
        /* @__PURE__ */ jsx(Table.BodyRow, { children: book.coverUrl ? /* @__PURE__ */ jsx("img", { src: book.coverUrl ?? "", alt: book.title, class: "w-auto h-12" }) : /* @__PURE__ */ jsx("a", { href: `/dashboard/books/${book.id}#book-images`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "warning", children: /* @__PURE__ */ jsx("span", { children: "Upload Cover" }) }) }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
          Link,
          {
            href: book.publicationStatus === "published" ? `/books/${book.slug}` : `/books/preview/${book.slug}`,
            children: book.title
          }
        ) }),
        showArtistColumn ? /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${book.artist?.slug}`, children: book.artist?.displayName }) }) : null,
        showPublisherColumn ? /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${book.publisher?.slug}`, children: book.publisher?.displayName ?? "" }) }) : null,
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Card.Text, { children: funnel.views }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Card.Text, { children: funnel.favorites }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Card.Text, { children: funnel.outboundClicks }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
          BookApprovalStatusPill,
          {
            approvalStatus: book.approvalStatus ?? "pending"
          }
        ) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(PublishToggleForm, { book, user }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(PreviewButton, { book, user }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("a", { href: `/dashboard/books/${book.id}`, children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            color: "inverse",
            disabled: !canEditBook(user, book),
            children: /* @__PURE__ */ jsx("span", { children: "Edit" })
          }
        ) }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(DeleteBookForm, { book, user }) })
      ]
    }
  );
};
export {
  BooksOverviewDesktop_default as default
};
