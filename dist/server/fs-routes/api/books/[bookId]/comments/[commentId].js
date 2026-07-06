import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import {
  addCommentFormSchema,
  editCommentParamSchema
} from "../../../../../features/api/schema.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { getUser } from "../../../../../utils.js";
import {
  deleteBookCommentById,
  getBookCommentById,
  getBookPermissionData
} from "../../../../../features/api/services.js";
import EditCommentModal from "../../../../../features/api/modals/EditCommentModal.js";
import { requireCommentOwner } from "../../../../../middleware/commentGuard.js";
import { updateCommentById } from "../../../../../features/app/services.js";
import Alert from "../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
import { createCommentUpdatedNotification } from "../../../../../domain/notifications/utils.js";
import { updateComments } from "../comments.js";
const GET = createRoute(
  paramValidator(editCommentParamSchema),
  async (c) => {
    const user = await getUser(c);
    const commentId = c.req.valid("param").commentId;
    const bookId = c.req.valid("param").bookId;
    const [err, comment] = await getBookCommentById(commentId);
    if (err || !comment)
      return showErrorAlert(c, err?.reason ?? "Comment not found");
    return c.html(
      /* @__PURE__ */ jsx(EditCommentModal, { commentId, bookId, user })
    );
  }
);
const PATCH = createRoute(
  paramValidator(editCommentParamSchema),
  formValidator(addCommentFormSchema),
  requireCommentOwner,
  async (c) => {
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
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Comment updated successfully" }),
        dispatchEvents([updateComments()]),
        /* @__PURE__ */ jsx("div", { id: "modal-root" })
      ] })
    );
  }
);
const DELETE = createRoute(
  paramValidator(editCommentParamSchema),
  requireCommentOwner,
  async (c) => {
    const comment = c.get("comment");
    const [err] = await deleteBookCommentById(comment.id);
    if (err) return showErrorAlert(c, err.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Comment deleted successfully" }),
        dispatchEvents([updateComments()])
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  PATCH
};
