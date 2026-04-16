import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import { requireBookEditAccess } from "../../../../middleware/bookGuard";
import { BookIdContext } from "../../../../features/dashboard/books/types";
import { resubmitBook } from "../../../../features/dashboard/books/services";
import Alert from "../../../../components/app/Alert";

export const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookEditAccess,
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;
    const [error] = await resubmitBook(bookId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Book resubmitted for review." />
        <div id="book-resubmit"></div>
      </>,
    );
  },
);
