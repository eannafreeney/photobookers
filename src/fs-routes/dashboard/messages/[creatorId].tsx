import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { formValidator, paramValidator } from "../../../lib/validator";
import { getUser, setFlash } from "../../../utils";
import {
  createMessage,
  getMessagesByCreator,
} from "../../../features/dashboard/messages/services";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { creatorIdSchema } from "../../../schemas";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import { MessageFormContext } from "../../../features/dashboard/messages/types";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import { createMessageFormSchema } from "../../../features/dashboard/messages/schema";
import { removeInvalidImages, uploadImage } from "../../../services/storage";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  async (c: MessageFormContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const body = await c.req.parseBody({ all: true });

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

    if (rawImage) {
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

    console.log("imageUrls", imageUrls);
    const message = await createMessage(creatorId, {
      body: messageBody,
      imageUrls,
    });

    if (!message) return showErrorAlert(c, "Failed to create message");

    return showSuccessAlert(c, "Message posted! Your followers will see it.");
  },
);
