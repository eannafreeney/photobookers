import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import {
  AddCommentFormContext,
  GetCommentModalContext,
} from "../../../../features/api/types";
import { getUser } from "../../../../utils";
import CommentModal from "../../../../features/api/modals/CommentModal";
import { addCommentFormSchema } from "../../../../features/api/schema";
import AuthModal from "../../../../components/app/AuthModal";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import {
  getBookPermissionData,
  insertBookComment,
} from "../../../../features/api/services";
import { createCommentCreatedNotification } from "../../../../domain/notifications/utils";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { getIsHyperview } from "../../../../features/hyperview/lib";
import { hyperview } from "../../../../lib/hxml";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getBookComments } from "../../../../features/app/services";
import BookCommentsPanel from "../../../../features/hyperview/components/BookCommentsPanel";

export const updateComments = () => "comments:updated";

export const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c: GetCommentModalContext) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);

    return c.html(<CommentModal bookId={bookId} user={user} />);
  },
);

export const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(addCommentFormSchema),
  async (c: AddCommentFormContext) => {
    const isHyperview = getIsHyperview(c);
    return isHyperview ? postCommentHyperview(c) : postCommentWeb(c);
  },
);

const postCommentHyperview = async (c: AddCommentFormContext) => {
  const bookId = c.req.valid("param").bookId;
  const form = c.req.valid("form");
  const user = await getUser(c);
  const userId = user?.id;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  const renderPanel = async (error?: string | null) => {
    const [commentsErr, comments] = await getBookComments(bookId);
    if (commentsErr || !comments) {
      return hv(
        <view xmlns="https://hyperview.org/hyperview">
          <text style="comments-placeholder">Could not load comments.</text>
        </view>,
      );
    }

    return hv(
      <BookCommentsPanel
        bookId={bookId}
        baseUrl={baseUrl}
        user={user}
        comments={comments}
        error={error}
      />,
    );
  };

  if (!userId) {
    const modalHref = `${baseUrl}/hyperview/auth-modal?action=${encodeURIComponent("to comment on this book.")}`;
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <behavior trigger="load" action="new" verb="get" href={modalHref} />
      </view>,
      401,
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

const postCommentWeb = async (c: AddCommentFormContext) => {
  const user = await getUser(c);
  const userId = user?.id;
  if (!userId)
    return c.html(<AuthModal action="to comment on this book." />, 401);

  const bookId = c.req.valid("param").bookId;
  const form = c.req.valid("form");

  const hasProfilePic = !!(user?.creator?.coverUrl || user?.profileImageUrl);

  if (!hasProfilePic) {
    return showErrorAlert(
      c,
      "Please add a profile picture before commenting.",
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
    <>
      <Alert type="success" message="Comment added successfully" />
      {dispatchEvents([updateComments()])}
      <div id="modal-root"></div>
    </>,
  );
};
