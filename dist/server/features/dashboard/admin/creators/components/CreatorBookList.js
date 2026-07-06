import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Card from "../../../../../components/app/Card.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { useUser } from "../../../../../contexts/UserContext.js";
import { deleteIcon, dragHandleIcon } from "../../../../../lib/icons.js";
import { canEditBook } from "../../../../../lib/permissions.js";
import PreviewButton from "../../../../api/components/PreviewButton.js";
import {
  formatClickRate,
  getBookFunnelCounts,
  getCreatorCatalogueFunnelTotalsAdmin
} from "../../../../book-analytics/funnel.js";
import ListNavigation from "../../../../app/components/ListNavigation.js";
import PublishToggleForm from "../../../books/components/PublishToggleForm.js";
import { getBooksByCreatorId } from "../services.js";
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
const CreatorBookList = async ({
  creatorId,
  currentPath,
  currentPage,
  searchQuery
}) => {
  const user = useUser();
  if (!user) return /* @__PURE__ */ jsx("div", { children: "Error: User not found" });
  const isSearching = Boolean(searchQuery?.trim());
  const pageLimit = isSearching ? 30 : 1e4;
  const reorderEnabled = !isSearching;
  const [error, result] = await getBooksByCreatorId(
    creatorId,
    currentPage,
    searchQuery,
    pageLimit
  );
  if (error) return /* @__PURE__ */ jsxs("div", { children: [
    "Error: ",
    error.reason
  ] });
  const targetId = "creator-books-table-body";
  const { books, totalPages, page, creator } = result;
  const [funnelCounts, catalogueTotals] = await Promise.all([
    getBookFunnelCounts(books.map((book) => book.id)),
    getCreatorCatalogueFunnelTotalsAdmin(creatorId)
  ]);
  const emptyFunnel = {
    views: 0,
    favorites: 0,
    outboundClicks: 0
  };
  const clickRateLabel = formatClickRate(
    catalogueTotals.views,
    catalogueTotals.outboundClicks
  );
  const tableWrapperAttrs = reorderEnabled ? {
    "x-data": `booksTableReorder(${JSON.stringify(books.map((book) => book.id))}, ${JSON.stringify(creatorId)})`
  } : {};
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Books" }),
    /* @__PURE__ */ jsxs("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: [
      /* @__PURE__ */ jsx("span", { class: "font-semibold text-on-surface-strong", children: "All time:" }),
      " ",
      catalogueTotals.views.toLocaleString(),
      " views \xB7",
      " ",
      catalogueTotals.favorites.toLocaleString(),
      " favorited \xB7",
      " ",
      catalogueTotals.outboundClicks.toLocaleString(),
      " outbound clicks",
      clickRateLabel ? ` (${clickRateLabel} click rate)` : null,
      " for",
      " ",
      creator.displayName,
      "'s catalogue"
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(
        TableSearch,
        {
          target: "creator-books-table",
          action: `/dashboard/admin/creators/${creatorId}`,
          placeholder: "Filter books..."
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/admin/books/create", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New Book" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { ...tableWrapperAttrs, children: /* @__PURE__ */ jsxs(Table, { id: "creator-books-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        reorderEnabled ? /* @__PURE__ */ jsx(Table.HeadRow, { children: /* @__PURE__ */ jsx("span", { class: "sr-only", children: "Reorder" }) }) : null,
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Views" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Favorited" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Outbound clicks" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Release Date" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publish" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: reorderEnabled ? void 0 : "append", children: books.map((book) => /* @__PURE__ */ jsx(
        BookTableRow,
        {
          book,
          user,
          funnel: funnelCounts.get(book.id) ?? emptyFunnel,
          reorderEnabled
        }
      )) })
    ] }) }),
    !reorderEnabled && totalPages > 1 ? /* @__PURE__ */ jsx(
      ListNavigation,
      {
        isInfiniteScroll: true,
        currentPath,
        page,
        totalPages,
        targetId
      }
    ) : null
  ] });
};
var CreatorBookList_default = CreatorBookList;
const BookTableRow = ({
  book,
  user,
  funnel,
  reorderEnabled
}) => {
  if (!book || !book.id || !book.slug || !book.title) {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsxs("tr", { ...{ "data-book-id": book.id }, ...reorderEnabled ? reorderRowAttrs : {}, children: [
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
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${book.artist?.slug}`, children: book.artist?.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${book.publisher?.slug}`, children: book.publisher?.displayName ?? "" }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Card.Text, { children: funnel.views }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Card.Text, { children: funnel.favorites }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Card.Text, { children: funnel.outboundClicks }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: book.releaseDate ? book.releaseDate.toISOString().slice(0, 10).split("-").reverse().join("/") : "" }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(PublishToggleForm, { book, user }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(PreviewButton, { book, user }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/books/${book.id}`, children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "outline",
        color: "inverse",
        disabled: !canEditBook(user, book),
        children: /* @__PURE__ */ jsx("span", { children: "Edit" })
      }
    ) }) }),
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
  CreatorBookList_default as default
};
