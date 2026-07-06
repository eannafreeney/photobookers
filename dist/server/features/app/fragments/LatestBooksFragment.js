import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getLatestBooks } from "../services.js";
import BooksGrid from "../components/BooksGrid.js";
import Button from "../../../components/app/Button.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import ViewAllLink from "../components/ViewAllLink.js";
const LatestBooksFragment = async ({
  user,
  currentPage,
  currentPath
}) => {
  const [error, result] = await getLatestBooks(currentPage, 10);
  if (error) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { id: "latest-books-fragment", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3", children: [
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", kicker: "New Arrivals", children: "Latest Books" }),
      /* @__PURE__ */ jsx(ViewAllLink, { href: "/books" })
    ] }),
    /* @__PURE__ */ jsx(
      BooksGrid,
      {
        user,
        currentPath,
        result,
        isPaginated: false
      }
    ),
    /* @__PURE__ */ jsx("div", { class: "flex justify-center mt-8", children: /* @__PURE__ */ jsx("a", { href: "/books", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "xl", children: "View All Books \u2192" }) }) })
  ] });
};
var LatestBooksFragment_default = LatestBooksFragment;
export {
  LatestBooksFragment_default as default
};
