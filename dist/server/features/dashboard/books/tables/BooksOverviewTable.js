import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop.js";
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
    return /* @__PURE__ */ jsx("span", { children: "Please use a desktop browser to view this page." });
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
