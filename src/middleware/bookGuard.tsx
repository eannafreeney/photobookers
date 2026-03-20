// src/middleware/bookGuard.ts
import { createMiddleware } from "hono/factory";
import {
  canDeleteBook,
  canEditBook,
  canPreviewBook,
  canPublishBook,
  canUnpublishBook,
} from "../lib/permissions";
import { getUser } from "../utils";
import { Book } from "../db/schema";
import { showErrorAlert } from "../lib/alertHelpers";
import ErrorPage from "../pages/error/errorPage";
import { getBookBySlug } from "../features/app/services";
import { getBookById } from "../features/dashboard/books/services";
import InfoPage from "../pages/InfoPage";

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
      return c.html(
        <ErrorPage errorMessage="Book ID is required" user={user} />,
        400,
      );
    }

    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        <ErrorPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    if (!canEditBook(user, book)) {
      return c.html(
        <ErrorPage
          errorMessage="You are not authorized to edit this book"
          user={user}
        />,
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

    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        <InfoPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    if (!canDeleteBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return c.html(
          <InfoPage errorMessage={notYetVerifiedErrorMessage} user={user} />,
          403,
        );
      }
      return c.html(
        <ErrorPage
          errorMessage="You are not authorized to delete this book"
          user={user}
        />,
        403,
      );
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

    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        <InfoPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    if (!canPublishBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return c.html(
          <InfoPage errorMessage={notYetVerifiedErrorMessage} user={user} />,
          403,
        );
      }
      return c.html(
        <ErrorPage
          errorMessage="You are not authorized to publish this book"
          user={user}
        />,
        403,
      );
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

    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(
        <InfoPage errorMessage="Book not found" user={user} />,
        404,
      );
    }
    if (!book) {
      return c.html(
        <ErrorPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    if (!canUnpublishBook(user, book)) {
      if (user?.creator?.status !== "verified") {
        return c.html(
          <InfoPage errorMessage={notYetVerifiedErrorMessage} user={user} />,
          403,
        );
      }
      return c.html(
        <ErrorPage
          errorMessage="You are not authorized to unpublish this book"
          user={user}
        />,
        403,
      );
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
      return c.html(
        <ErrorPage errorMessage="Book slug is required" user={user} />,
        400,
      );
    }

    const result = await getBookBySlug(bookSlug, "draft");
    if (!result?.book) {
      return c.html(
        <ErrorPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    const { book } = result;
    if (!book) {
      return c.html(
        <ErrorPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    if (!canPreviewBook(user, book)) {
      return c.html(
        <ErrorPage
          errorMessage="You are not authorized to preview this book"
          user={user}
        />,
        403,
      );
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  },
);
