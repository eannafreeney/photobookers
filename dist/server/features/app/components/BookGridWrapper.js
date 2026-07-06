import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import BooksGrid from "./BooksGrid.js";
import { getBooksByCreatorId } from "../../dashboard/admin/creators/services.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import ViewAllLink from "./ViewAllLink.js";
const BookGridWrapper = async ({
  isMobile,
  creator,
  bookSlug,
  currentPage,
  currentPath,
  user
}) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  const [booksError, booksData] = await getBooksByCreatorId(
    creator.id,
    currentPage
  );
  if (booksError || !booksData) return /* @__PURE__ */ jsx(Fragment, {});
  const result = {
    ...booksData,
    books: booksData.books.filter((b) => b.slug !== bookSlug)
  };
  if (result.books.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(SectionTitle, { children: [
      "Other Books by ",
      creator?.displayName
    ] }),
    /* @__PURE__ */ jsx(ViewAllLink, { href: `/creators/${creator?.slug}` }),
    /* @__PURE__ */ jsx(
      BooksGrid,
      {
        user,
        currentPath,
        result,
        isMobile
      }
    )
  ] });
};
var BookGridWrapper_default = BookGridWrapper;
export {
  BookGridWrapper_default as default
};
