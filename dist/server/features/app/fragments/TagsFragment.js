import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../components/app/SectionTitle.js";
import { capitalize } from "../../../utils.js";
import BooksGrid from "../components/BooksGrid.js";
import { getBooksByTag } from "../services.js";
const TagsFragment = async ({ user, currentPage, currentPath, tag }) => {
  const [error, result] = await getBooksByTag(tag, currentPage);
  if (error || !result?.books.length) {
    return /* @__PURE__ */ jsx("div", { id: "tag-books-fragment", children: /* @__PURE__ */ jsx("div", { class: "flex justify-center items-center min-h-screen", children: "No books found for this tag" }) });
  }
  return /* @__PURE__ */ jsxs("div", { id: "tag-books-fragment", children: [
    /* @__PURE__ */ jsx("div", { class: "flex items-center justify-between", children: /* @__PURE__ */ jsx(SectionTitle, { children: `# ${capitalize(tag)}` }) }),
    /* @__PURE__ */ jsx(BooksGrid, { user, currentPath, result })
  ] });
};
var TagsFragment_default = TagsFragment;
export {
  TagsFragment_default as default
};
