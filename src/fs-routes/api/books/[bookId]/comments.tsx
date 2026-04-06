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
import { createCommentCreatedNotification } from "../../../../features/dashboard/admin/notifications/utils";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";

export const updateComments = () => "comments:updated";

export const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c: GetCommentModalContext) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);

    console.log("comments GET", user);

    return c.html(<CommentModal bookId={bookId} user={user} />);
  },
);

export const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(addCommentFormSchema),
  async (c: AddCommentFormContext) => {
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
  },
);
