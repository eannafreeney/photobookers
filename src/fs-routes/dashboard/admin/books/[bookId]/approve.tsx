import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { bookIdSchema } from "../../../../../schemas";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { approveBook } from "../../../../../features/dashboard/admin/books/services";

import BookApprovalStatusPill from "../../../../../features/dashboard/admin/books/components/BookApprovalStatusPill";
import Alert from "../../../../../components/app/Alert";

export const POST = createRoute(paramValidator(bookIdSchema), async (c) => {
  const { bookId } = c.req.valid("param");

  const [error, book] = await approveBook(bookId);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="Book approved!" />
      <BookApprovalStatusPill
        approvalStatus={book.approvalStatus ?? "approved"}
      />
    </>,
  );
});
