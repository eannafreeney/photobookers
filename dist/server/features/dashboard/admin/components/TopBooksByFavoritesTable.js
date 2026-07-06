import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../components/app/Link.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Table from "../../../../components/app/Table.js";
import ListNavigation from "../../../app/components/ListNavigation.js";
import WindowTable from "./WindowTable.js";
const TopBooksByFavoritesTable = async ({
  currentPath,
  pageParam,
  books,
  totalPages,
  page,
  targetId,
  navId
}) => {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Top books by favorites" }),
    /* @__PURE__ */ jsxs(WindowTable, { children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Favorites" })
        ] }) }),
        /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: books.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: "No favorites yet." }) }) : books.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.coverUrl ? /* @__PURE__ */ jsx(
            "img",
            {
              src: row.coverUrl,
              alt: row.title,
              class: "h-12 w-auto"
            }
          ) : null }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/books/${row.slug}`, target: "_blank", children: row.title }) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.artistName ?? "" }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.publisherName ?? "" }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.favoriteCount })
        ] }, row.bookId)) })
      ] }),
      /* @__PURE__ */ jsx(
        ListNavigation,
        {
          isInfiniteScroll: true,
          currentPath,
          page,
          totalPages,
          targetId,
          pageParam,
          navId
        }
      )
    ] })
  ] });
};
var TopBooksByFavoritesTable_default = TopBooksByFavoritesTable;
export {
  TopBooksByFavoritesTable_default as default
};
