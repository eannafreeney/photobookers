import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../../schemas/index.js";
import { updateCreatorEmailFormSchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { getCreatorEmailById } from "../../../../../../features/dashboard/creators/services.js";
import { updateCreatorEmailOrError } from "../../../../../../features/dashboard/admin/planner/emailFlow.js";
import EditCreatorEmailModal from "../../../../../../features/dashboard/admin/planner/modals/EditCreatorEmailModal.js";
import CreatorEmailBadge from "../../../../../../features/dashboard/admin/planner/components/CreatorEmailBadge.js";
import Modal from "../../../../../../components/app/Modal.js";
import Alert from "../../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorEmailById(creatorId);
  if (error || !creator) return showErrorAlert(c, "Creator not found");
  return c.html(
    /* @__PURE__ */ jsx(Modal, { title: `${creator.displayName} \u2014 email`, children: /* @__PURE__ */ jsx(
      EditCreatorEmailModal,
      {
        creatorId: creator.id,
        displayName: creator.displayName,
        email: creator.email
      }
    ) })
  );
});
const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(updateCreatorEmailFormSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const { email } = c.req.valid("form");
    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email
    });
    if (response || !creator) return response;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: `Email saved for ${creator.displayName}`
          }
        ),
        /* @__PURE__ */ jsx(
          CreatorEmailBadge,
          {
            creatorId: creator.id,
            email: creator.email,
            name: creator.displayName
          }
        ),
        dispatchEvents(["planner:updated"]),
        /* @__PURE__ */ jsx("div", { id: "modal-root" })
      ] })
    );
  }
);
export {
  GET,
  POST
};
