import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile,
} from "../../../../../lib/validator";
import { bookIdSchema } from "../../../../../schemas";
import { BookIdContext } from "../../../../../features/dashboard/books/types";
import { requireBookImageEditAccess } from "../../../../../middleware/imageGuards";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { uploadImage } from "../../../../../services/storage";
import { updateBookCoverImage } from "../../../../../features/dashboard/images/services";
import { showSuccessAlert } from "../../../../../lib/alertHelpers";

export const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookImageEditAccess,
  async (c: BookIdContext) => {
    const bookId = c.req.valid("param").bookId;
    const body = await c.req.parseBody();

    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

    let coverUrl: string | null = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `books/covers/${bookId}`,
        "cover",
      );
      coverUrl = result.url;
    } catch (error) {
      console.log(error, "error in upload cover image");
      return showErrorAlert(c, "Failed to upload cover image");
    }
    const [err, updatedBook] = await updateBookCoverImage(bookId, coverUrl);
    if (err) return showErrorAlert(c, err.reason);

    if (!updatedBook) return showErrorAlert(c, "Failed to update book cover");

    return showSuccessAlert(c, "Cover Image Updated");
  },
);
