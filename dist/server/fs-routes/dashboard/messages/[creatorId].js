import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator.js";
import { createMessage } from "../../../features/dashboard/messages/services.js";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard.js";
import { creatorIdSchema } from "../../../schemas/index.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import { createMessageFormSchema } from "../../../features/dashboard/messages/schema.js";
import { removeInvalidImages, uploadImage } from "../../../services/storage.js";
import Alert from "../../../components/app/Alert.js";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm.js";
import CreatorMessages from "../../../features/app/components/CreatorMessages.js";
import { getUser } from "../../../utils.js";
import { createMessageCreatedNotification } from "../../../domain/notifications/utils.js";
const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody({ all: true });
    const user = await getUser(c);
    const creator = user.creator;
    if (!creator) return showErrorAlert(c, "Creator not found");
    const messageBody = String(body.body ?? "").trim();
    if (!messageBody) {
      return showErrorAlert(c, "Message is required");
    }
    const rawImage = body.image;
    if (Array.isArray(rawImage)) {
      return showErrorAlert(c, "Only one image is allowed per message");
    }
    let imageUrls = void 0;
    if (rawImage instanceof File && rawImage.size > 0) {
      const valid = removeInvalidImages(rawImage);
      if (!valid) {
        return showErrorAlert(c, "Please upload a valid image file");
      }
      try {
        const uploaded = await uploadImage(
          rawImage,
          `creators/${creatorId}/messages`,
          "gallery"
        );
        imageUrls = [uploaded.url];
      } catch (error) {
        console.error("message image upload failed", error);
        return showErrorAlert(c, "Failed to upload image");
      }
    }
    const [err, message] = await createMessage(creatorId, {
      body: messageBody,
      imageUrls
    });
    if (err) return showErrorAlert(c, err.reason);
    createMessageCreatedNotification(user, creator, message);
    if (!message) return showErrorAlert(c, "Failed to create message");
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: "Post published! Your followers will be emailed about it."
          }
        ),
        /* @__PURE__ */ jsx(MessageForm, { creatorId }),
        /* @__PURE__ */ jsx(CreatorMessages, { creatorSlug: creator.slug, user })
      ] })
    );
  }
);
export {
  POST
};
