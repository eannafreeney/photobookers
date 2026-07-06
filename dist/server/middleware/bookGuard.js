import { jsx } from "hono/jsx/jsx-runtime";
import { createMiddleware } from "hono/factory";
import {
  canDeleteBook,
  canEditBook,
  canPreviewBook,
  canPublishBook,
  canUnpublishBook
} from "../lib/permissions.js";
import { getUser } from "../utils.js";
import { showErrorAlert } from "../lib/alertHelpers.js";
import ErrorPage from "../pages/error/errorPage.js";
import { getBookBySlug } from "../features/app/services.js";
import { getBookById } from "../features/dashboard/books/services.js";
import InfoPage from "../pages/InfoPage.js";
const notYetVerifiedErrorMessage = "Your creator profile is pending verification. You can upload and edit books, but publishing is only available after your profile is approved.";
const requireBookEditAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");
    if (!bookId) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book ID is required", user }),
        400
      );
    }
    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!canEditBook(user, book)) {
      return c.html(
        /* @__PURE__ */ jsx(
          ErrorPage,
          {
            errorMessage: "You are not authorized to edit this book",
            user
          }
        ),
        403
      );
    }
    c.set("book", book);
    await next();
  }
);
const requireBookDeleteAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");
    if (!bookId) {
      return showErrorAlert(c, "Book ID is required");
    }
    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!canDeleteBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return c.html(
          /* @__PURE__ */ jsx(InfoPage, { errorMessage: notYetVerifiedErrorMessage, user }),
          403
        );
      }
      return c.html(
        /* @__PURE__ */ jsx(
          ErrorPage,
          {
            errorMessage: "You are not authorized to delete this book",
            user
          }
        ),
        403
      );
    }
    c.set("book", book);
    await next();
  }
);
const requireBookPublishIntentAccess = async (c, next) => {
  const form = await c.req.parseBody();
  const intent = form.intent;
  if (intent === "publish") {
    return requireBookPublishAccess(c, next);
  }
  if (intent === "unpublish") {
    return requireBookUnpublishAccess(c, next);
  }
  return showErrorAlert(c, "Invalid publish action", 400);
};
const requireBookPublishAccess = createMiddleware(async (c, next) => {
  const user = await getUser(c);
  const bookId = c.req.param("bookId");
  if (!bookId) {
    return showErrorAlert(c, "Book ID is required");
  }
  const [err, book] = await getBookById(bookId);
  if (err || !book) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found", user }), 404);
  }
  if (!canPublishBook(user, book)) {
    if (user?.creator?.status !== "verified") {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: notYetVerifiedErrorMessage, user }),
        403
      );
    }
    if (book.approvalStatus !== "approved") {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: "This book is pending approval and cannot be published yet.",
            user
          }
        ),
        403
      );
    }
    return c.html(
      /* @__PURE__ */ jsx(
        ErrorPage,
        {
          errorMessage: "You are not authorized to publish this book",
          user
        }
      ),
      403
    );
  }
  c.set("book", book);
  await next();
});
const requireBookUnpublishAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");
    if (!bookId) {
      return showErrorAlert(c, "Book ID is required");
    }
    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!book) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!canUnpublishBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return c.html(
          /* @__PURE__ */ jsx(InfoPage, { errorMessage: notYetVerifiedErrorMessage, user }),
          403
        );
      }
      return c.html(
        /* @__PURE__ */ jsx(
          ErrorPage,
          {
            errorMessage: "You are not authorized to unpublish this book",
            user
          }
        ),
        403
      );
    }
    c.set("book", book);
    await next();
  }
);
const requireBookPreviewAccess = createMiddleware(
  async (c, next) => {
    const user = await getUser(c);
    const bookSlug = c.req.param("slug");
    if (!bookSlug) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book slug is required", user }),
        400
      );
    }
    const [err, result] = await getBookBySlug(bookSlug, "draft");
    if (err || !result?.book) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!result?.book) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    const { book } = result;
    if (!book) {
      return c.html(
        /* @__PURE__ */ jsx(ErrorPage, { errorMessage: "Book not found", user }),
        404
      );
    }
    if (!canPreviewBook(user, book)) {
      return c.html(
        /* @__PURE__ */ jsx(
          ErrorPage,
          {
            errorMessage: "You are not authorized to preview this book",
            user
          }
        ),
        403
      );
    }
    c.set("book", book);
    await next();
  }
);
export {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPreviewAccess,
  requireBookPublishIntentAccess
};
