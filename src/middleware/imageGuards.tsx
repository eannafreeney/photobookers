import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import { showErrorAlert } from "../lib/alertHelpers";
import { User } from "../db/schema";
import { getBookById } from "../services/books";
import { canEditBook, canEditCreator } from "../lib/permissions";
import { getCreatorById } from "../services/creators";

type ImageEnv = {
  Variables: {
    user: User;
  };
};

export const requireProfileCoverImageEditAccess = createMiddleware<ImageEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const creatorId = c.req.param("creatorId");

    if (!creatorId) {
      return showErrorAlert(c, "Creator ID is required");
    }

    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }

    if (!canEditCreator(user, creator)) {
      return showErrorAlert(
        c,
        "You are not authorized to edit the cover image of this creator",
      );
    }

    await next();
  },
);

export const requireBookImageEditAccess = createMiddleware<ImageEnv>(
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
      return showErrorAlert(
        c,
        "You are not authorized to edit the cover image of this book",
      );
    }

    await next();
  },
);

export const requireImageDeleteAccess = createMiddleware<ImageEnv>(
  async (c, next) => {
    const user = await getUser(c);
    if (!user) {
      return showErrorAlert(c, "User not found");
    }
    await next();
  },
);
