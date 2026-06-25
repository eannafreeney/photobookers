import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../lib/validator";
import { newUserFormAdminSchema } from "../../../../features/dashboard/admin/users/schema";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import {
  createAuthUser,
  createUserWithAuthId,
  sendUserLoginInstructionsEmail,
} from "../../../../features/dashboard/admin/users/services";
import { getCreatorById } from "../../../../features/dashboard/creators/services";
import { assignUserAsCreatorOwnerAdmin } from "../../../../features/dashboard/admin/claims/services";
import CreateUserFormAdmin from "../../../../features/dashboard/admin/users/forms/CreateUserFormAdmin";
import { dispatchEvents } from "../../../../lib/disatchEvents";

export const POST = createRoute(
  formValidator(newUserFormAdminSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const { email, creatorId } = formData;

    const temporaryPassword = crypto.randomUUID();

    const [createAuthError, authData] = await createAuthUser(
      temporaryPassword,
      formData,
    );

    if (createAuthError) return showErrorAlert(c, "Failed to create auth user");

    const authUserId = authData.data.user.id;

    let creator: Awaited<ReturnType<typeof getCreatorById>>[1] | null = null;

    if (creatorId) {
      const [error, foundCreator] = await getCreatorById(creatorId);
      if (error || !foundCreator) return showErrorAlert(c, "Creator not found");
      creator = foundCreator;
    }

    const [createUserError, newUser] = await createUserWithAuthId(
      authUserId,
      formData,
      {
        mustResetPassword: true,
      },
    );

    if (createUserError || !newUser)
      return showErrorAlert(c, "Failed to create user");

    if (creator) {
      const [assignError] = await assignUserAsCreatorOwnerAdmin(
        authUserId,
        creator.id,
      );
      if (assignError)
        return showErrorAlert(c, "Failed to assign user as creator owner");
    }

    const [emailError] = await sendUserLoginInstructionsEmail(email, {
      firstName: formData.firstName,
      creatorDisplayName: creator?.displayName ?? null,
      purpose: "account_created",
    });
    if (emailError) {
      return showErrorAlert(
        c,
        "User created but failed to send login email. Please reset their password to resend instructions.",
      );
    }

    return c.html(
      <>
        <CreateUserFormAdmin />
        <Alert
          type="success"
          message={`Account created. Login instructions sent to ${email}.`}
        />
        {dispatchEvents(["users:updated"])}
      </>,
    );
  },
);
