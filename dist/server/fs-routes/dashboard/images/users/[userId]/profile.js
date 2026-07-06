import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile
} from "../../../../../lib/validator.js";
import { uploadImage } from "../../../../../services/storage.js";
import {
  showErrorAlert,
  showSuccessAlert
} from "../../../../../lib/alertHelpers.js";
import { updateUserProfileImageDB } from "../../../../../features/dashboard/images/services.js";
import { userIdSchema } from "../../../../../schemas/index.js";
const POST = createRoute(
  paramValidator(userIdSchema),
  async (c) => {
    const userId = c.req.valid("param").userId;
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.userImageProfile);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);
    let profileImageUrl = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `users/profile-images/${userId}`,
        "cover"
      );
      profileImageUrl = result.url;
    } catch (error) {
      console.log(error, "error in upload cover image");
      return showErrorAlert(c, "Failed to upload profile image");
    }
    const [err] = await updateUserProfileImageDB(userId, profileImageUrl);
    if (err) return showErrorAlert(c, err.reason);
    return showSuccessAlert(c, "Profile Image Updated");
  }
);
export {
  POST
};
