// src/middleware/bookGuard.ts
import { createMiddleware } from "hono/factory";
import { getBookById, getBookBySlug } from "../services/books";
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
import ErrorPage from "../pages/error/errorPage";

type BookEnv = {
  Variables: {
    book: Book;
  };
};

type BookFromSlug = NonNullable<
  Awaited<ReturnType<typeof getBookBySlug>>
>["book"];

type BookPreviewEnv = { Variables: { book: BookFromSlug } };

const notYetVerifiedErrorMessage =
  "Your creator profile is pending verification. You can upload and edit books, but publishing is only available after your profile is approved.";

export const requireBookEditAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    if (!bookId) {
      return c.html(<ErrorPage errorMessage="Book ID is required" />, 400);
    }

    const book = await getBookById(bookId);
    if (!book) {
      return c.html(<ErrorPage errorMessage="Book not found" />, 404);
    }

    if (!canEditBook(user, book)) {
      const isClaimedProfileNotVerified =
        user?.creator &&
        user.creator.status !== "verified" &&
        user.creator.createdByUserId !== user.id;

      if (isClaimedProfileNotVerified) {
        return c.html(
          <ErrorPage errorMessage={notYetVerifiedErrorMessage} />,
          403,
        );
      }
      return c.html(
        <ErrorPage errorMessage="You are not authorized to edit this book" />,
        403,
      );
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
      return showErrorAlert(c, "Book ID is required");
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

export const requireBookPreviewAccess = createMiddleware<BookPreviewEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookSlug = c.req.param("slug");

    if (!bookSlug) {
      return c.html(<ErrorPage errorMessage="Book slug is required" />, 400);
    }

    const result = await getBookBySlug(bookSlug, "draft");
    if (!result?.book) {
      return c.html(<ErrorPage errorMessage="Book not found" />, 404);
    }

    const { book } = result;
    if (!book) {
      return c.html(<ErrorPage errorMessage="Book not found" />, 404);
    }

    if (!canPreviewBook(user, book)) {
      return c.html(
        <ErrorPage errorMessage="You are not authorized to preview this book" />,
        403,
      );
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);
