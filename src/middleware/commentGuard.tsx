import { createMiddleware } from "hono/factory";
import { getUser } from "../utils";
import AuthModal from "../components/app/AuthModal";
import { showErrorAlert } from "../lib/alertHelpers";
import { getBookCommentById } from "../features/api/services";
import { BookComment } from "../db/schema";

type CommentGuardEnv = {
  Variables: {
    comment: BookComment;
  };
};

export const requireCommentOwner = createMiddleware<CommentGuardEnv>(
  async (c, next) => {
    const user = await getUser(c);
    const userId = user?.id;
    if (!userId)
      return c.html(<AuthModal action="to manage this comment." />, 401);

    const commentId = c.req.param("commentId");
    const bookId = c.req.param("bookId");

    if (!commentId || !bookId) {
      return showErrorAlert(c, "Comment ID and book ID are required");
    }

    const [err, comment] = await getBookCommentById(commentId);
    if (err || !comment)
      return showErrorAlert(c, err?.reason ?? "Comment not found");

    if (bookId && comment.bookId !== bookId) {
      return showErrorAlert(c, "Comment does not belong to this book.");
    }

    if (!user.isAdmin && comment.userId !== userId) {
      return showErrorAlert(
        c,
        "You do not have permission to modify this comment.",
      );
    }

    c.set("comment", comment);
    await next();
  },
);
