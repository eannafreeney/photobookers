import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Table from "../../../../components/app/Table.js";
import Link from "../../../../components/app/Link.js";
import ListNavigation from "../../../app/components/ListNavigation.js";
import WindowTable from "./WindowTable.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
const TopBooksByClickTable = async ({
  currentPath,
  pageParam,
  books,
  totalPages,
  page,
  targetId = "analytics-top-books"
}) => {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Top books by outbound clicks" }),
    /* @__PURE__ */ jsxs(WindowTable, { children: [
      /* @__PURE__ */ jsxs(Table, { id: "analytics-top-books", children: [
        /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Outbound clicks" })
        ] }) }),
        /* @__PURE__ */ jsx(Table.Body, { children: books.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: "No outbound clicks yet." }) }) : books.map((book) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.BodyRow, { children: book.coverUrl ? /* @__PURE__ */ jsx(
            "img",
            {
              src: book.coverUrl,
              alt: book.title,
              class: "h-12 w-auto"
            }
          ) : null }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/books/${book.slug}`, target: "_blank", children: book.title }) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: book.artistName ?? "" }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: book.publisherName ?? "" }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: book.clickCount })
        ] }, book.id)) })
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
          navId: `pagination-books-table`
        }
      )
    ] })
  ] });
};
var TopBooksByClickTable_default = TopBooksByClickTable;
export {
  TopBooksByClickTable_default as default
};
