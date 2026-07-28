import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile,
} from "../../../../../lib/validator";
import { storeIdSchema } from "../../../../../features/dashboard/admin/stores/schema";
import { StoreIdContext } from "../../../../../features/dashboard/admin/stores/types";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers";
import { uploadImage } from "../../../../../services/storage";
import { updateStoreCoverImage } from "../../../../../features/dashboard/images/services";
import { getUser } from "../../../../../utils";

export const POST = createRoute(
  paramValidator(storeIdSchema),
  async (c: StoreIdContext) => {
    // Stores are admin-managed; /dashboard only requires auth, so guard here.
    const user = await getUser(c);
    if (!user?.isAdmin) {
      return showErrorAlert(c, "You are not authorized to do this.", 403);
    }

    const storeId = c.req.valid("param").storeId;
    const body = await c.req.parseBody();

    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

    let coverUrl: string | null = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `stores/covers/${storeId}`,
        "cover",
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
  },
);
