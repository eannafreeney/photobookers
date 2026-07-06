import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import {
  paramValidator,
  validateImageFile
} from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { requireProfileCoverImageEditAccess } from "../../../../../middleware/imageGuards.js";
import { uploadImage } from "../../../../../services/storage.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import { updateCreatorCoverImage } from "../../../../../features/dashboard/images/services.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
const POST = createRoute(
  paramValidator(creatorIdSchema),
  requireProfileCoverImageEditAccess,
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody();
    const validatedFile = validateImageFile(body.cover);
    if (!validatedFile.success) return showErrorAlert(c, validatedFile.error);
    let coverUrl = null;
    try {
      const result = await uploadImage(
        validatedFile.file,
        `creators/covers/${creatorId}`,
        "cover"
      );
      coverUrl = result.url;
    } catch (error) {
      return showErrorAlert(c, "Failed to upload image");
    }
    const [err, updatedCreator] = await updateCreatorCoverImage(
      coverUrl,
      creatorId
    );
    if (err) return showErrorAlert(c, err.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: `${updatedCreator?.displayName ?? "Book"} Updated!`
          }
        ),
        dispatchEvents(["book:updated"])
      ] })
    );
  }
);
export {
  POST
};
