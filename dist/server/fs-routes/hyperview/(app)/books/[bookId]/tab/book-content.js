import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import { paramValidator } from "../../../../../../lib/validator.js";
import BookPage from "../../../../../../features/hyperview/components/BookPage.js";
import { getBookById } from "../../../../../../features/dashboard/books/services.js";
import { bookIdSchema } from "../../../../../../schemas/index.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags.js";
import { getUser } from "../../../../../../utils.js";
function galleryUrlsFromBook(book) {
  const fromRows = (book.images ?? []).map((row) => row.imageUrl);
  return [book.coverUrl, ...fromRows].filter(
    (url) => Boolean(url)
  );
}
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, book] = await getBookById(bookId);
  if (error || !book) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Book not found." }) }),
      404
    );
  }
  const galleryImages = galleryUrlsFromBook(book);
  const favoritesByBookId = await favoriteFlagsForBooks(user, [book]);
  return hv(
    /* @__PURE__ */ jsx(
      BookPage,
      {
        galleryImages,
        book,
        baseUrl,
        isFavorited: favoritesByBookId[book.id] ?? false
      }
    )
  );
});
export {
  GET
};
