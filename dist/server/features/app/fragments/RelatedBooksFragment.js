import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import RelatedBooks from "../components/RelatedBooks.js";
const RelatedBooksFragment = ({ book, user }) => {
  if (!book) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { id: "related-books-fragment", children: /* @__PURE__ */ jsx(RelatedBooks, { book, user }) });
};
var RelatedBooksFragment_default = RelatedBooksFragment;
export {
  RelatedBooksFragment_default as default
};
