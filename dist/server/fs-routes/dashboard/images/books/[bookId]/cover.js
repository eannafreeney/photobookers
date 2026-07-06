import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile
} from "../../../../../lib/validator.js";
import { bookIdSchema } from "../../../../../schemas/index.js";
import { requireBookImageEditAccess } from "../../../../../middleware/imageGuards.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { uploadImage } from "../../../../../services/storage.js";
import { updateBookCoverImage } from "../../../../../features/dashboard/images/services.js";
import { showSuccessAlert } from "../../../../../lib/alertHelpers.js";
const POST = createRoute(
  paramValidator(bookIdSchema),
  requireBookImageEditAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);
    let coverUrl = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `books/covers/${bookId}`,
        "cover"
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
  }
);
export {
  POST
};
