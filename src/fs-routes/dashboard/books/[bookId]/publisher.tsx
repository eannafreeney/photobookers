import { createRoute } from "hono-fsr";
import { bookFormSchema } from "../../../../features/dashboard/books/schema";
import { BookFormWithBookContext } from "../../../../features/dashboard/books/types";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { requireBookEditAccess } from "../../../../middleware/bookGuard";
import { bookIdSchema } from "../../../../schemas";
import {
  buildUpdateBookData,
  updateBook,
} from "../../../../features/dashboard/books/services";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";

export const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  async (c: BookFormWithBookContext) => {
    const formData = c.req.valid("form");
    const book = c.get("book");

    const bookData = buildUpdateBookData(formData);
    const updatedBook = await updateBook(bookData, book.id);

    if (!updatedBook) {
      return showErrorAlert(c, "Failed to update book");
    }

    return showSuccessAlert(c, `${updatedBook.title} updated!`);
  },
);
