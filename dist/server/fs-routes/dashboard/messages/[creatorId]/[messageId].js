import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import {
  deleteMessageById,
  getMessageById,
  postBelongsToCreator,
  updateMessageById
} from "../../../../features/dashboard/messages/services.js";
import { requireCreatorEditAccess } from "../../../../middleware/creatorGuard.js";
import { messageParamSchema } from "../../../../schemas/index.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import { createMessageFormSchema } from "../../../../features/dashboard/messages/schema.js";
import { removeInvalidImages, uploadImage } from "../../../../services/storage.js";
import Alert from "../../../../components/app/Alert.js";
import Modal from "../../../../components/app/Modal.js";
import MessageForm from "../../../../features/dashboard/messages/forms/MessageForm.js";
import MessagesTable from "../../../../features/dashboard/messages/components/MessagesTable.js";
import { getIsMobile } from "../../../../lib/device.js";
const GET = createRoute(
  paramValidator(messageParamSchema),
  requireCreatorEditAccess,
  async (c) => {
    const { creatorId, messageId } = c.req.valid("param");
    const [err, message] = await getMessageById(messageId);
    if (err || !message || !await postBelongsToCreator(message.userId, creatorId)) {
      return c.html(
        /* @__PURE__ */ jsx(Modal, { title: "Edit post", children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Post not found." }) })
      );
    }
    return c.html(
      /* @__PURE__ */ jsx(Modal, { title: "Edit post", maxWidth: "max-w-2xl", children: /* @__PURE__ */ jsx(
        MessageForm,
        {
          creatorId,
          messageId,
          initialBody: message.body,
          initialImageUrl: message.imageUrl
        }
      ) })
    );
  }
);
const PATCH = createRoute(
  paramValidator(messageParamSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  async (c) => {
    const { creatorId, messageId } = c.req.valid("param");
    const body = await c.req.parseBody({ all: true });
    const [existingErr, existing] = await getMessageById(messageId);
    if (existingErr || !existing || !await postBelongsToCreator(existing.userId, creatorId)) {
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
    let imageUrl = void 0;
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
        imageUrl = uploaded.url;
      } catch (error) {
        console.error("message image upload failed", error);
        return showErrorAlert(c, "Failed to upload image");
      }
    }
    const [updateErr] = await updateMessageById(
      messageId,
      {
        body: messageBody,
        ...imageUrl !== void 0 ? { imageUrl } : {}
      },
      existing.userId
    );
    if (updateErr) return showErrorAlert(c, updateErr.reason);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post updated." }),
        /* @__PURE__ */ jsx(MessageForm, { creatorId, messageId }),
        /* @__PURE__ */ jsx(MessagesTable, { creatorId, isMobile }),
        /* @__PURE__ */ jsx("div", { id: "modal-root" })
      ] })
    );
  }
);
const DELETE = createRoute(
  paramValidator(messageParamSchema),
  requireCreatorEditAccess,
  async (c) => {
    const { creatorId, messageId } = c.req.valid("param");
    const [existingErr, existing] = await getMessageById(messageId);
    if (existingErr || !existing || !await postBelongsToCreator(existing.userId, creatorId)) {
      return showErrorAlert(c, "Post not found");
    }
    const [error] = await deleteMessageById(messageId, existing.userId);
    if (error) return showErrorAlert(c, error.reason);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "Post deleted." }),
        /* @__PURE__ */ jsx(MessagesTable, { creatorId, isMobile })
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  PATCH
};
