// src/middleware/bookGuard.ts
import { createMiddleware } from "hono/factory";
import { getBookById } from "../services/books";
import { canEditBook } from "../lib/permissions";
import { getUser } from "../utils";
import Alert from "../components/app/Alert";
import { Book } from "../db/schema";

type BookEnv = {
  Variables: {
    book: Book;
  };
};

export const requireBookEditAccess = createMiddleware<BookEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");

    const book = await getBookById(bookId);
    if (!book) {
      return c.html(<Alert type="danger" message="Book not found" />, 404);
    }

    if (!canEditBook(user, book)) {
      return c.html(<Alert type="danger" message="Unauthorized" />, 403);
    }

    // Attach book to context so route doesn't need to fetch again
    c.set("book", book);
    await next();
  }
);
