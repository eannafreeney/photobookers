import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator.js";
import { bookIdSchema } from "../../../../schemas/index.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { requireBookEditAccess } from "../../../../middleware/bookGuard.js";
import { resubmitBook } from "../../../../features/dashboard/books/services.js";
import Alert from "../../../../components/app/Alert.js";
import { getUser } from "../../../../utils.js";
import { notifyAdminBookPendingReview } from "../../../../features/dashboard/admin/notifications/services.js";
const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookEditAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    const [error, updatedBook] = await resubmitBook(bookId);
    if (error) return showErrorAlert(c, error.reason);
    if (updatedBook?.approvalStatus === "pending") {
      await notifyAdminBookPendingReview({
        bookId: updatedBook.id,
        title: updatedBook.title,
        actorUserId: user.id,
        isResubmit: true
      });
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Book resubmitted for review." }),
        /* @__PURE__ */ jsx("div", { id: "book-resubmit" })
      ] })
    );
  }
);
export {
  POST
};
