import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile
} from "../../../../../lib/validator.js";
import { storeIdSchema } from "../../../../../features/dashboard/admin/stores/schema.js";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers.js";
import { uploadImage } from "../../../../../services/storage.js";
import { updateStoreCoverImage } from "../../../../../features/dashboard/images/services.js";
const POST = createRoute(
  paramValidator(storeIdSchema),
  async (c) => {
    const storeId = c.req.valid("param").storeId;
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);
    let coverUrl = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `stores/covers/${storeId}`,
        "cover"
      );
      coverUrl = result.url;
    } catch (error) {
      console.log(error, "error in upload store cover image");
      return showErrorAlert(c, "Failed to upload cover image");
    }
    const [err, updatedStore] = await updateStoreCoverImage(storeId, coverUrl);
    if (err) return showErrorAlert(c, err.reason);
    if (!updatedStore) return showErrorAlert(c, "Failed to update store cover");
    return showSuccessAlert(c, "Cover Image Updated");
  }
);
export {
  POST
};
