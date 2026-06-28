import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator";
import { createMessage } from "../../../features/dashboard/messages/services";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { creatorIdSchema } from "../../../schemas";
import { MessageFormContext } from "../../../features/dashboard/messages/types";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import { createMessageFormSchema } from "../../../features/dashboard/messages/schema";
import { removeInvalidImages, uploadImage } from "../../../services/storage";
import Alert from "../../../components/app/Alert";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import CreatorMessages from "../../../features/app/components/CreatorMessages";
import { getUser } from "../../../utils";
import { createMessageCreatedNotification } from "../../../domain/notifications/utils";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  async (c: MessageFormContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody({ all: true });
    const user = await getUser(c);

    const creator = user.creator;
    if (!creator) return showErrorAlert(c, "Creator not found");

    const messageBody = String(body.body ?? "").trim();
    if (!messageBody) {
      return showErrorAlert(c, "Message is required");
    }

    // Accept only one file field: "image"
    const rawImage = body.image;
    if (Array.isArray(rawImage)) {
      return showErrorAlert(c, "Only one image is allowed per message");
    }

    let imageUrls: string[] | undefined = undefined;

    if (rawImage instanceof File && rawImage.size > 0) {
      const valid = removeInvalidImages(rawImage);
      if (!valid) {
        return showErrorAlert(c, "Please upload a valid image file");
      }

      try {
        const uploaded = await uploadImage(
          rawImage as File,
          `creators/${creatorId}/messages`,
          "gallery",
        );
        imageUrls = [uploaded.url];
      } catch (error) {
        console.error("message image upload failed", error);
        return showErrorAlert(c, "Failed to upload image");
      }
    }

    const [err, message] = await createMessage(creatorId, {
      body: messageBody,
      imageUrls,
    });
    if (err) return showErrorAlert(c, err.reason);

    createMessageCreatedNotification(user, creator, message);

    if (!message) return showErrorAlert(c, "Failed to create message");

    // return showSuccessAlert(c, "Message posted! Your followers will see it.");
    return c.html(
      <>
        <Alert
          type="success"
          message="Message posted! Your followers will see it."
        />
        <MessageForm creatorId={creatorId} />
        <CreatorMessages creatorSlug={creator.slug} user={user} />
      </>,
    );
  },
);
