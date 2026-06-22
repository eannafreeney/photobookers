import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile,
} from "../../../../../lib/validator";
import { fairIdSchema } from "../../../../../features/dashboard/admin/fairs/schema";
import { FairIdContext } from "../../../../../features/dashboard/admin/fairs/types";
import { showErrorAlert, showSuccessAlert } from "../../../../../lib/alertHelpers";
import { uploadImage } from "../../../../../services/storage";
import { updateFairBannerImage } from "../../../../../features/dashboard/images/services";

export const POST = createRoute(
  paramValidator(fairIdSchema),
  async (c: FairIdContext) => {
    const fairId = c.req.valid("param").fairId;
    const body = await c.req.parseBody();

    const validatedFile = validateImageFile(body.banner);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

    let bannerUrl: string | null = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `fairs/banners/${fairId}`,
        "cover",
      );
      bannerUrl = result.url;
    } catch (error) {
      console.log(error, "error in upload fair banner image");
      return showErrorAlert(c, "Failed to upload banner image");
    }
    
    const [err, updatedFair] = await updateFairBannerImage(fairId, bannerUrl);
    if (err) return showErrorAlert(c, err.reason);

    if (!updatedFair) return showErrorAlert(c, "Failed to update fair banner");

    return showSuccessAlert(c, "Banner Image Updated");
  },
);
