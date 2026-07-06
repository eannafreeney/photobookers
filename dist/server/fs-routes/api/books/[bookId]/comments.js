import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { bookIdSchema } from "../../../../schemas/index.js";
import { getUser } from "../../../../utils.js";
import CommentModal from "../../../../features/api/modals/CommentModal.js";
import { addCommentFormSchema } from "../../../../features/api/schema.js";
import AuthModal from "../../../../components/app/AuthModal.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import {
  getBookPermissionData,
  insertBookComment
} from "../../../../features/api/services.js";
import { createCommentCreatedNotification } from "../../../../domain/notifications/utils.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { getIsHyperview } from "../../../../features/hyperview/lib.js";
import { hyperview } from "../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { getBookComments } from "../../../../features/app/services.js";
import BookCommentsPanel from "../../../../features/hyperview/components/BookCommentsPanel.js";
const updateComments = () => "comments:updated";
const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    return c.html(/* @__PURE__ */ jsx(CommentModal, { bookId, user }));
  }
);
const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(addCommentFormSchema),
  async (c) => {
    const isHyperview = getIsHyperview(c);
    return isHyperview ? postCommentHyperview(c) : postCommentWeb(c);
  }
);
const postCommentHyperview = async (c) => {
  const bookId = c.req.valid("param").bookId;
  const form = c.req.valid("form");
  const user = await getUser(c);
  const userId = user?.id;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const renderPanel = async (error) => {
    const [commentsErr, comments] = await getBookComments(bookId);
    if (commentsErr || !comments) {
      return hv(
        /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx("text", { style: "comments-placeholder", children: "Could not load comments." }) })
      );
    }
    return hv(
      /* @__PURE__ */ jsx(
        BookCommentsPanel,
        {
          bookId,
          baseUrl,
          user,
          comments,
          error
        }
      )
    );
  };
  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to comment on this book.")}`;
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx("behavior", { trigger: "load", action: "new", verb: "get", href: modalHref }) }),
      401
    );
  }
  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);
  if (!hasProfilePic) {
    return renderPanel("Please add a profile picture before commenting.");
  }
  const [err] = await insertBookComment(bookId, userId, form.body);
  if (err) return renderPanel(err.reason ?? "Failed to add comment");
  const [bookErr, book] = await getBookPermissionData(bookId);
  if (!bookErr && book) {
    await createCommentCreatedNotification(user, book);
  }
  return renderPanel();
};
const postCommentWeb = async (c) => {
  const user = await getUser(c);
  const userId = user?.id;
  if (!userId)
    return c.html(/* @__PURE__ */ jsx(AuthModal, { action: "to comment on this book." }), 401);
  const bookId = c.req.valid("param").bookId;
  const form = c.req.valid("form");
  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);
  if (!hasProfilePic) {
    return showErrorAlert(
      c,
      "Please add a profile picture before commenting."
    );
  }
  const [err, comment] = await insertBookComment(bookId, userId, form.body);
  if (err || !comment)
    return showErrorAlert(c, err?.reason ?? "Failed to add comment");
  const [bookErr, book] = await getBookPermissionData(bookId);
  if (bookErr || !book)
    return showErrorAlert(c, bookErr?.reason ?? "Book not found");
  await createCommentCreatedNotification(user, book);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Comment added successfully" }),
      dispatchEvents([updateComments()]),
      /* @__PURE__ */ jsx("div", { id: "modal-root" })
    ] })
  );
};
export {
  GET,
  POST,
  updateComments
};
