import { jsx } from "hono/jsx/jsx-runtime";
import { createMiddleware } from "hono/factory";
import { getUser } from "../utils.js";
import { canEditBook, canEditCreator } from "../lib/permissions.js";
import { getBookById } from "../features/dashboard/books/services.js";
import { getCreatorById } from "../features/dashboard/creators/services.js";
import InfoPage from "../pages/InfoPage.js";
const requireProfileCoverImageEditAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const creatorId = c.req.param("creatorId");
    if (!creatorId)
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator ID is required", user }),
        400
      );
    const [error, creator] = await getCreatorById(creatorId);
    if (error || !creator) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }),
        404
      );
    }
    if (!canEditCreator(user, creator)) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: "You are not authorized to edit the cover image of this creator",
            user
          }
        ),
        403
      );
    }
    await next();
  }
);
const requireBookImageEditAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");
    if (!bookId) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book ID is required", user }),
        400
      );
    }
    const [error, book] = await getBookById(bookId);
    if (error || !book) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!canEditBook(user, book)) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: "You are not authorized to edit the cover image of this book",
            user
          }
        ),
        403
      );
    }
    await next();
  }
);
const requireImageDeleteAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    if (!user) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "User not found", user }),
        404
      );
    }
    await next();
  }
);
export {
  requireBookImageEditAccess,
  requireImageDeleteAccess,
  requireProfileCoverImageEditAccess
};
