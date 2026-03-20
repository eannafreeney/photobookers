import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import { showErrorAlert } from "../lib/alertHelpers";
import { User } from "../db/schema";
import { canEditBook, canEditCreator } from "../lib/permissions";
import { getBookById } from "../features/dashboard/books/services";
import { getCreatorById } from "../features/dashboard/creators/services";
import InfoPage from "../pages/InfoPage";

type ImageEnv = {
  Variables: {
    user: User;
  };
};

export const requireProfileCoverImageEditAccess = createMiddleware<ImageEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const creatorId = c.req.param("creatorId");

    if (!creatorId)
      return c.html(
        <InfoPage errorMessage="Creator ID is required" user={user} />,
        400,
      );

    const [error, creator] = await getCreatorById(creatorId);
    if (error || !creator) {
      return c.html(
        <InfoPage errorMessage="Creator not found" user={user} />,
        404,
      );
    }

    if (!canEditCreator(user, creator)) {
      return c.html(
        <InfoPage
          errorMessage="You are not authorized to edit the cover image of this creator"
          user={user}
        />,
        403,
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
      return c.html(
        <InfoPage errorMessage="Book ID is required" user={user} />,
        400,
      );
    }

    const [error, book] = await getBookById(bookId);
    if (error || !book) {
      return c.html(
        <InfoPage errorMessage="Book not found" user={user} />,
        404,
      );
    }

    if (!canEditBook(user, book)) {
      return c.html(
        <InfoPage
          errorMessage="You are not authorized to edit the cover image of this book"
          user={user}
        />,
        403,
      );
    }

    await next();
  },
);

export const requireImageDeleteAccess = createMiddleware<ImageEnv>(
  async (c, next) => {
    const user = await getUser(c);
    if (!user) {
      return c.html(
        <InfoPage errorMessage="User not found" user={user} />,
        404,
      );
    }
    await next();
  },
);
