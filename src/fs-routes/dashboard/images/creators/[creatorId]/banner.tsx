import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile,
} from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import { requireProfileCoverImageEditAccess } from "../../../../../middleware/imageGuards";
import { CreatorIdContext } from "../../../../../features/dashboard/creators/types";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { uploadImage } from "../../../../../services/storage";
import { updateCreatorBannerImage } from "../../../../../features/dashboard/images/services";
import Alert from "../../../../../components/app/Alert";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  requireProfileCoverImageEditAccess, // same permission — owner can edit
  async (c: CreatorIdContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody();

    const validatedFile = validateImageFile(body.banner);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

    const result = await uploadImage(
      validatedFile.file,
      `creators/banners/${creatorId}`,
      "gallery", // wider images — use gallery not cover
    );

    const [err, updatedCreator] = await updateCreatorBannerImage(
      result.url,
      creatorId,
    );
    if (err) return showErrorAlert(c, err.reason);

    return c.html(
      <Alert
        type="success"
        message={`${updatedCreator?.displayName ?? "Creator"} banner updated!`}
      />,
    );
  },
);
