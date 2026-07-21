import { createRoute } from "hono-fsr";
import Alert from "../../../../../components/app/Alert";
import BookApprovalForm from "../../../../../features/dashboard/admin/books/forms/BookApprovalForm";
import { unapproveBook } from "../../../../../features/dashboard/admin/books/services";
import PublishToggleForm from "../../../../../features/dashboard/books/components/PublishToggleForm";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { paramValidator } from "../../../../../lib/validator";
import { bookIdSchema } from "../../../../../schemas";
import { getUser } from "../../../../../utils";

export const POST = createRoute(paramValidator(bookIdSchema), async (c) => {
  const user = await getUser(c);
  const { bookId } = c.req.valid("param");

  const [error, book] = await unapproveBook(bookId);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="Book returned to pending review." />
      <BookApprovalForm book={book} />
      <PublishToggleForm book={book} user={user} />
    </>,
  );
});
