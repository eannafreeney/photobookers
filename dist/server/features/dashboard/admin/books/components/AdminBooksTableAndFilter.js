import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Card from "../../../../../components/app/Card.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import Link from "../../../../../components/app/Link.js";
import Table from "../../../../../components/app/Table.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon, editIcon } from "../../../../../lib/icons.js";
import { formatDate } from "../../../../../utils.js";
import PreviewButton from "../../../../api/components/PreviewButton.js";
import {
  getBookFunnelCounts
} from "../../../../book-analytics/funnel.js";
import PublishToggleForm from "../../../books/components/PublishToggleForm.js";
import BookStatusForm from "../forms/BookStatusForm.js";
import { getAllBooksAdmin } from "../services.js";
import BookApprovalStatusPill from "./BookApprovalStatusPill.js";
const AdminBooksTableAndFilter = async ({
  status = void 0,
  currentPage,
  searchQuery,
  currentPath,
  user
}) => {
  const [error, result] = await getAllBooksAdmin(
    currentPage,
    searchQuery,
    status
  );
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const { books, totalPages, page } = result;
  const funnelCounts = await getBookFunnelCounts(books.map((book) => book.id));
  const emptyFunnel = {
    views: 0,
    favorites: 0,
    outboundClicks: 0
  };
  const targetId = "books-table-body";
  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@books:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/books', { target: 'books-table-container' })`
  };
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "books-table-container",
      class: "flex flex-col gap-4",
      "x-ref": "paginationContent",
      children: [
        /* @__PURE__ */ jsx(BookStatusForm, { status }),
        /* @__PURE__ */ jsxs(Table, { id: "books-table", children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Release Date" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Views" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Favorited" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Outbound clicks" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publish" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...tableBodyAttrs, xMerge: "append", children: books.map((book) => /* @__PURE__ */ jsx(
            BooksTableRow,
            {
              book,
              user,
              funnel: funnelCounts.get(book.id) ?? emptyFunnel
            },
            book.id
          )) })
        ] }),
        /* @__PURE__ */ jsx(
          InfiniteScroll,
          {
            baseUrl: currentPath,
            page,
            totalPages,
            targetId
          }
        )
      ]
    }
  ) });
};
var AdminBooksTableAndFilter_default = AdminBooksTableAndFilter;
const BooksTableRow = ({ book, user, funnel }) => {
  if (!user) return /* @__PURE__ */ jsx(Fragment, {});
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: book.coverUrl ? /* @__PURE__ */ jsx("img", { src: book.coverUrl ?? "", alt: book.title, class: "w-auto h-12" }) : /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/books/${book.id}#book-images`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "warning", children: /* @__PURE__ */ jsx("span", { children: "Upload Cover" }) }) }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      Link,
      {
        href: book.publicationStatus === "published" ? `/books/${book.slug}` : `/books/preview/${book.slug}`,
        target: "_blank",
        children: book.title
      }
    ) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${book.artist?.slug}`, children: book.artist?.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${book.publisher?.slug}`, children: book.publisher?.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: book.releaseDate ? formatDate(book.releaseDate) : "" }),
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
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/books/${book.id}`, target: "_blank", children: /* @__PURE__ */ jsx("button", { class: "cursor-pointer", children: editIcon() }) }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      FormDelete,
      {
        action: `/dashboard/admin/books/${book.id}`,
        ...alpineAttrs,
        children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
      }
    ) })
  ] });
};
export {
  AdminBooksTableAndFilter_default as default
};
