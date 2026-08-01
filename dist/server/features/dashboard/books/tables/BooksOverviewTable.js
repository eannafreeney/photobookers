import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop.js";
import BooksOverviewMobile from "../components/BooksOverviewMobile.js";
const BooksOverviewTable = async ({
  books,
  creator,
  user,
  isMobile,
  currentPath,
  page,
  totalPages,
  reorderEnabled = false
}) => {
  if (!user || !creator) return /* @__PURE__ */ jsx(Fragment, {});
  if (isMobile) {
    return /* @__PURE__ */ jsx(
      BooksOverviewMobile,
      {
        books,
        user,
        currentPath,
        page,
        totalPages
      }
    );
  }
  return /* @__PURE__ */ jsx(
    BooksOverviewDesktop,
    {
      books,
      user,
      currentPath,
      page,
      totalPages,
      reorderEnabled
    }
  );
};
export {
  BooksOverviewTable
};
