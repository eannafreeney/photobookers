// src/middleware/bookGuard.ts
import { createMiddleware } from "hono/factory";
import { getBookById } from "../services/books";
import {
  canDeleteBook,
  canEditBook,
  canPreviewBook,
  canPublishBook,
  canUnpublishBook,
} from "../lib/permissions";
import { getUser } from "../utils";
import Alert from "../components/app/Alert";
import { Book } from "../db/schema";
import { showErrorAlert } from "../lib/alertHelpers";

type BookEnv = {
  Variables: {
    book: Book;
  };
};

const notYetVerifiedErrorMessage =
  "Your creator profile is pending verification. You can upload and edit books, but publishing is only available after your profile is approved.";

export const requireBookEditAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    if (!bookId) {
      return showErrorAlert(c, "Book ID is required");
    }

    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    if (!canEditBook(user, book)) {
      const isClaimedProfileNotVerified =
        user?.creator &&
        user.creator.status !== "verified" &&
        user.creator.createdByUserId !== user.id;

      if (isClaimedProfileNotVerified) {
        return showErrorAlert(c, notYetVerifiedErrorMessage);
      }
      return showErrorAlert(c, "You are not authorized to edit this book");
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);

export const requireBookDeleteAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    if (!bookId) {
      return c.html(<Alert type="danger" message="Book ID is required" />, 400);
    }

    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    if (!canDeleteBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return showErrorAlert(c, notYetVerifiedErrorMessage);
      }
      return showErrorAlert(c, "You are not authorized to delete this book");
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);

export const requireBookPublishAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    if (!bookId) {
      return showErrorAlert(c, "Book ID is required");
    }

    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    if (!canPublishBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return showErrorAlert(c, notYetVerifiedErrorMessage);
      }
      return showErrorAlert(c, "Please add a cover image before publishing");
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);

export const requireBookUnpublishAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    if (!bookId) {
      return showErrorAlert(c, "Book ID is required");
    }

    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    if (!canUnpublishBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return showErrorAlert(c, notYetVerifiedErrorMessage);
      }
      return showErrorAlert(c, "You are not authorized to unpublish this book");
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);

export const requireBookPreviewAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    if (!bookId) {
      return showErrorAlert(c, "Book ID is required");
    }

    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    if (!canPreviewBook(user, book)) {
      return showErrorAlert(c, "You are not authorized to preview this book");
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);
