import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator";
import {
  deleteMessageById,
  getMessageById,
  getMessagesByCreator,
  updateMessageById,
} from "../../../../features/dashboard/messages/services";
import { requireCreatorEditAccess } from "../../../../middleware/creatorGuard";
import { messageParamSchema } from "../../../../schemas";
import { UpdateMessageFormContext } from "../../../../features/dashboard/messages/types";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { createMessageFormSchema } from "../../../../features/dashboard/messages/schema";
import { removeInvalidImages, uploadImage } from "../../../../services/storage";
import Alert from "../../../../components/app/Alert";
import Modal from "../../../../components/app/Modal";
import MessageForm from "../../../../features/dashboard/messages/forms/MessageForm";
import { MessagesTableBody } from "../../../../features/dashboard/messages/components/MessagesTable";
import { dispatchEvents } from "../../../../lib/disatchEvents";

export const GET = createRoute(
  paramValidator(messageParamSchema),
  requireCreatorEditAccess,
  async (c) => {
    const { creatorId, messageId } = c.req.valid("param");

    const [err, message] = await getMessageById(messageId);
    if (err || !message || message.creatorId !== creatorId) {
      return c.html(
        <Modal title="Edit post">
          <p class="text-sm text-on-surface">Post not found.</p>
        </Modal>,
      );
    }

    return c.html(
      <Modal title="Edit post" maxWidth="max-w-2xl">
        <MessageForm
          creatorId={creatorId}
          messageId={messageId}
          initialBody={message.body}
          initialImageUrl={message.imageUrl}
        />
      </Modal>,
    );
  },
);

export const PATCH = createRoute(
  paramValidator(messageParamSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  async (c: UpdateMessageFormContext) => {
    const { creatorId, messageId } = c.req.valid("param");
    const body = await c.req.parseBody({ all: true });

    const [existingErr, existing] = await getMessageById(messageId);
    if (existingErr || !existing || existing.creatorId !== creatorId) {
      return showErrorAlert(c, "Post not found");
    }

    const messageBody = String(body.body ?? "").trim();
    if (!messageBody) {
      return showErrorAlert(c, "Message is required");
    }

    const rawImage = body.image;
    if (Array.isArray(rawImage)) {
      return showErrorAlert(c, "Only one image is allowed per message");
    }

    let imageUrl: string | undefined = undefined;

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
        imageUrl = uploaded.url;
      } catch (error) {
        console.error("message image upload failed", error);
        return showErrorAlert(c, "Failed to upload image");
      }
    }

    const [updateErr] = await updateMessageById(messageId, {
      body: messageBody,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    });
    if (updateErr) return showErrorAlert(c, updateErr.reason);

    const [, result] = await getMessagesByCreator(creatorId);
    const messages = result?.messages ?? [];

    return c.html(
      <>
        <Alert type="success" message="Post updated." />
        {dispatchEvents(["messages:updated"])}
        <MessagesTableBody creatorId={creatorId} messages={messages} />
        <div id="modal-root"></div>
      </>,
    );
  },
);

export const DELETE = createRoute(
  paramValidator(messageParamSchema),
  requireCreatorEditAccess,
  async (c) => {
    const { creatorId, messageId } = c.req.valid("param");

    const [existingErr, existing] = await getMessageById(messageId);
    if (existingErr || !existing || existing.creatorId !== creatorId) {
      return showErrorAlert(c, "Post not found");
    }

    const [error] = await deleteMessageById(messageId);
    if (error) return showErrorAlert(c, error.reason);

    const [, result] = await getMessagesByCreator(creatorId);
    const messages = result?.messages ?? [];

    return c.html(
      <>
        <Alert type="success" message="Post deleted." />
        {dispatchEvents(["messages:updated"])}
        <MessagesTableBody creatorId={creatorId} messages={messages} />
      </>,
    );
  },
);
