import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import {
  addCommentFormSchema,
  editCommentParamSchema,
} from "../../../../../features/api/schema";
import {
  DeleteCommentGuardedContext,
  GetEditCommentModalContext,
  UpdateCommentGuardedContext,
} from "../../../../../features/api/types";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getUser } from "../../../../../utils";
import {
  deleteBookCommentById,
  getBookCommentById,
  getBookPermissionData,
} from "../../../../../features/api/services";
import EditCommentModal from "../../../../../features/api/modals/EditCommentModal";
import { requireCommentOwner } from "../../../../../middleware/commentGuard";
import { updateCommentById } from "../../../../../features/app/services";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";
import { createCommentUpdatedNotification } from "../../../../../features/dashboard/admin/notifications/utils";
import { updateComments } from "../comments";

export const GET = createRoute(
  paramValidator(editCommentParamSchema),
  async (c: GetEditCommentModalContext) => {
    const user = await getUser(c);
    const commentId = c.req.valid("param").commentId;
    const bookId = c.req.valid("param").bookId;

    const [err, comment] = await getBookCommentById(commentId);
    if (err || !comment)
      return showErrorAlert(c, err?.reason ?? "Comment not found");

    return c.html(
      <EditCommentModal commentId={commentId} bookId={bookId} user={user} />,
    );
  },
);

export const PATCH = createRoute(
  paramValidator(editCommentParamSchema),
  formValidator(addCommentFormSchema),
  requireCommentOwner,
  async (c: UpdateCommentGuardedContext) => {
    console.log("PATCH", c.req.valid("form"));
    const comment = c.get("comment");
    const body = c.req.valid("form").body;
    const user = await getUser(c);

    const [err, updatedComment] = await updateCommentById(comment.id, body);
    if (err || !updatedComment) {
      return showErrorAlert(c, err?.reason ?? "Failed to update comment");
    }

    const [bookErr, book] = await getBookPermissionData(comment.bookId);
    if (bookErr || !book)
      return showErrorAlert(c, bookErr?.reason ?? "Book not found");

    if (!user) return showErrorAlert(c, "User not found");

    await createCommentUpdatedNotification(user, book);
    return c.html(
      <>
        <Alert type="success" message="Comment updated successfully" />
        {dispatchEvents([updateComments()])}
        <div id="modal-root"></div>
      </>,
    );
  },
);

export const DELETE = createRoute(
  paramValidator(editCommentParamSchema),
  requireCommentOwner,
  async (c: DeleteCommentGuardedContext) => {
    const comment = c.get("comment");

    const [err] = await deleteBookCommentById(comment.id);
    if (err) return showErrorAlert(c, err.reason);

    return c.html(
      <>
        <Alert type="success" message="Comment deleted successfully" />
        {dispatchEvents([updateComments()])}
      </>,
    );
  },
);
