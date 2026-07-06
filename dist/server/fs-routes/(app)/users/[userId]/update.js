import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AuthModal from "../../../../components/app/AuthModal.js";
import { getUser } from "../../../../utils.js";
import { userIdSchema } from "../../../../schemas/index.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { userUpdateFormSchema } from "../../../../features/app/schema.js";
import UserCoverForm from "../../../../features/app/forms/UserCoverForm.js";
import Modal from "../../../../components/app/Modal.js";
const GET = createRoute(
  formValidator(userUpdateFormSchema),
  paramValidator(userIdSchema),
  async (c) => {
    const user = await getUser(c);
    const msg = c.req.valid("form").msg;
    if (!user) {
      return c.html(
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(AuthModal, { action: "to complete this action." }),
          /* @__PURE__ */ jsx("div", { id: "modal-root" })
        ] })
      );
    }
    const title = msg ? msg : "Add a Profile Image";
    return c.html(
      /* @__PURE__ */ jsx(Modal, { title, children: /* @__PURE__ */ jsx(UserCoverForm, { initialUrl: user.profileImageUrl, user }) })
    );
  }
);
export {
  GET
};
