import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import BookCard from "../../../components/app/BookCard.js";
import GridPanel from "../../../components/app/GridPanel.js";
import SectionTitle from "../../../components/app/SectionTitle.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getRelatedBooks } from "../services.js";
const RelatedBooks = async ({ book, user }) => {
  const [error, result] = await getRelatedBooks(book.id, {
    artistId: book.artistId,
    publisherId: book.publisherId,
    tags: book.tags ?? []
  });
  if (error) {
    return /* @__PURE__ */ jsx(InfoPage, { errorMessage: error?.reason, user: user ?? null });
  }
  const { books } = result;
  if (!books)
    return /* @__PURE__ */ jsx(InfoPage, { errorMessage: "No related books found", user: user ?? null });
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { className: "mb-2", children: "You might also like" }),
    /* @__PURE__ */ jsx(GridPanel, { children: books.map((b) => /* @__PURE__ */ jsx(BookCard, { book: b, user })) })
  ] });
};
var RelatedBooks_default = RelatedBooks;
export {
  RelatedBooks_default as default
};
