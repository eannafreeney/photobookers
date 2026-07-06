import { createRoute } from "hono-fsr";
import { bookFormSchema } from "../../../../features/dashboard/books/schema.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { requireBookEditAccess } from "../../../../middleware/bookGuard.js";
import { bookIdSchema } from "../../../../schemas/index.js";
import {
  buildUpdateBookData,
  updateBook
} from "../../../../features/dashboard/books/services.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  async (c) => {
    const formData = c.req.valid("form");
    const book = c.get("book");
    const bookData = buildUpdateBookData(formData);
    const [error, updatedBook] = await updateBook(bookData, book.id);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, `${updatedBook?.title ?? "Book"} updated!`);
  }
);
export {
  POST
};
