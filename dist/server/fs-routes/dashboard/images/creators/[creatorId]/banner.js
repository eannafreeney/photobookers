import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile
} from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { requireProfileCoverImageEditAccess } from "../../../../../middleware/imageGuards.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { uploadImage } from "../../../../../services/storage.js";
import { updateCreatorBannerImage } from "../../../../../features/dashboard/images/services.js";
import Alert from "../../../../../components/app/Alert.js";
const POST = createRoute(
  paramValidator(creatorIdSchema),
  requireProfileCoverImageEditAccess,
  // same permission — owner can edit
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.banner);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);
    const result = await uploadImage(
      validatedFile.file,
      `creators/banners/${creatorId}`,
      "gallery"
      // wider images — use gallery not cover
    );
    const [err, updatedCreator] = await updateCreatorBannerImage(
      result.url,
      creatorId
    );
    if (err) return showErrorAlert(c, err.reason);
    return c.html(
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `${updatedCreator?.displayName ?? "Creator"} banner updated!`
        }
      )
    );
  }
);
export {
  POST
};
