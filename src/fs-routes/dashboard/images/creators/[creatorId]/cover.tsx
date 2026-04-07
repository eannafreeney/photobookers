import { createRoute } from "hono-fsr";
import { CreatorIdContext } from "../../../../../features/dashboard/creators/types";
import {
  paramValidator,
  validateImageFile,
} from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import { requireProfileCoverImageEditAccess } from "../../../../../middleware/imageGuards";
import { uploadImage } from "../../../../../services/storage";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { updateCreatorCoverImage } from "../../../../../features/dashboard/images/services";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  requireProfileCoverImageEditAccess,
  async (c: CreatorIdContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody();

    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);

    let coverUrl: string | null = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `creators/covers/${creatorId}`,
        "cover",
      );
      coverUrl = result.url;
    } catch (error) {
      return showErrorAlert(c, "Failed to upload image");
    }

    const [err, updatedCreator] = await updateCreatorCoverImage(
      coverUrl,
      creatorId,
    );
    if (err) return showErrorAlert(c, err.reason);

    return c.html(
      <>
        <Alert
          type="success"
          message={`${updatedCreator?.displayName ?? "Book"} Updated!`}
        />
        {dispatchEvents(["book:updated"])}
      </>,
    );
  },
);
