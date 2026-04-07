import { createRoute } from "hono-fsr";
import AuthModal from "../../../../components/app/AuthModal";
import { getUser } from "../../../../utils";
import { userIdSchema } from "../../../../schemas";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { userUpdateFormSchema } from "../../../../features/app/schema";
import { UserUpdateModalContext } from "../../../../features/app/types";
import UserCoverForm from "../../../../features/app/forms/UserCoverForm";
import Modal from "../../../../components/app/Modal";

export const GET = createRoute(
  formValidator(userUpdateFormSchema),
  paramValidator(userIdSchema),
  async (c: UserUpdateModalContext) => {
    const user = await getUser(c);
    const msg = c.req.valid("form").msg;

    if (!user) {
      return c.html(
        <>
          <AuthModal action="to complete this action." />
          <div id="modal-root"></div>
        </>,
      );
    }

    const title = msg ? msg : "Add a Profile Image";

    return c.html(
      <Modal title={title}>
        <UserCoverForm initialUrl={user.profileImageUrl} user={user} />
      </Modal>,
    );
  },
);
