import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../lib/validator.js";
import { newUserFormAdminSchema } from "../../../../features/dashboard/admin/users/schema.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import {
  createAuthUser,
  createUserWithAuthId,
  sendUserLoginInstructionsEmail
} from "../../../../features/dashboard/admin/users/services.js";
import { getCreatorById } from "../../../../features/dashboard/creators/services.js";
import { assignUserAsCreatorOwnerAdmin } from "../../../../features/dashboard/admin/claims/services.js";
import CreateUserFormAdmin from "../../../../features/dashboard/admin/users/forms/CreateUserFormAdmin.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
const POST = createRoute(
  formValidator(newUserFormAdminSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const { email, creatorId } = formData;
    const temporaryPassword = crypto.randomUUID();
    const [createAuthError, authData] = await createAuthUser(
      temporaryPassword,
      formData
    );
    if (createAuthError) return showErrorAlert(c, "Failed to create auth user");
    const authUserId = authData.data.user.id;
    let creator = null;
    if (creatorId) {
      const [error, foundCreator] = await getCreatorById(creatorId);
      if (error || !foundCreator) return showErrorAlert(c, "Creator not found");
      creator = foundCreator;
    }
    const [createUserError, newUser] = await createUserWithAuthId(
      authUserId,
      formData,
      {
        mustResetPassword: true
      }
    );
    if (createUserError || !newUser)
      return showErrorAlert(c, "Failed to create user");
    if (creator) {
      const [assignError] = await assignUserAsCreatorOwnerAdmin(
        authUserId,
        creator.id
      );
      if (assignError)
        return showErrorAlert(c, "Failed to assign user as creator owner");
    }
    const [emailError] = await sendUserLoginInstructionsEmail(email, {
      firstName: formData.firstName,
      creatorDisplayName: creator?.displayName ?? null,
      purpose: "account_created"
    });
    if (emailError) {
      return showErrorAlert(
        c,
        "User created but failed to send login email. Please reset their password to resend instructions."
      );
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CreateUserFormAdmin, {}),
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: `Account created. Login instructions sent to ${email}.`
          }
        ),
        dispatchEvents(["users:updated"])
      ] })
    );
  }
);
export {
  POST
};
