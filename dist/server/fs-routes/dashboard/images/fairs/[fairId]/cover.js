import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile
} from "../../../../../lib/validator.js";
import { fairIdSchema } from "../../../../../features/dashboard/admin/fairs/schema.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers.js";
import { uploadImage } from "../../../../../services/storage.js";
import { updateFairCoverImage } from "../../../../../features/dashboard/images/services.js";
const POST = createRoute(
  paramValidator(fairIdSchema),
  async (c) => {
    const fairId = c.req.valid("param").fairId;
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);
    let coverUrl = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `fairs/covers/${fairId}`,
        "cover"
      );
      coverUrl = result.url;
    } catch (error) {
      console.log(error, "error in upload fair cover image");
      return showErrorAlert(c, "Failed to upload cover image");
    }
    const [err, updatedFair] = await updateFairCoverImage(fairId, coverUrl);
    if (err) return showErrorAlert(c, err.reason);
    if (!updatedFair) return showErrorAlert(c, "Failed to update fair cover");
    return showSuccessAlert(c, "Cover Image Updated");
  }
);
export {
  POST
};
