import Alert from "../../../../components/app/Alert";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import {
  createNewUser,
  deleteUserById,
  getUserById,
} from "../../../../services/users";
import { getUser } from "../../../../utils";
import UsersPageAdmin from "./pages/UsersPageAdmin";
import { Context } from "hono";
import { MagicLinkFormContext, UserFormContext, UserIdContext } from "./types";
import Modal from "../../../../components/app/Modal";
import Button from "../../../../components/app/Button";
import CopyCellCol from "../../../../components/admin/CopyCellCol";
import { supabaseAdmin } from "../../../../lib/supabase";
import { generateMagicLinkEmail } from "./emails";
import MagicLinkModal from "./modals/MagicLinkModal";

export const getUsersPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(<UsersPageAdmin user={user} currentPath={currentPath} />);
};

export const createNewUserAdmin = async (c: UserFormContext) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const formData = c.req.valid("form");
  const newUser = await createNewUser(formData);
  if (!newUser) return showErrorAlert(c, "Failed to create user");

  return c.html(
    <>
      <Alert type="success" message="User created!" />
      <UsersPageAdmin user={user} currentPath={currentPath} />
    </>,
  );
};

export const deleteUserAdmin = async (c: UserIdContext) => {
  const userId = c.req.valid("param").userId;
  const deletedUser = await deleteUserById(userId);
  if (!deletedUser) return showErrorAlert(c, "Failed to delete user");
  return c.html(
    <>
      <Alert type="success" message="User deleted!" />
      <div id="server_events">
        <div x-init="$dispatch('users:updated')"></div>
      </div>
    </>,
  );
};

export const generateMagicLinkAdmin = async (c: UserIdContext) => {
  const userId = c.req.valid("param").userId;
  const user = await getUserById(userId);
  const email = user?.email as string;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${process.env.SITE_URL ?? "http://localhost:5173"}/auth/force-reset-password`,
    },
  });

  const actionLink = data?.properties?.action_link;

  return c.html(
    <MagicLinkModal
      userId={userId}
      errorMessage={error?.message ?? null}
      actionLink={actionLink ?? null}
      user={user}
    />,
  );
};

export const sendMagicLinkAdmin = async (c: MagicLinkFormContext) => {
  const userId = c.req.valid("param").userId;
  const actionLink = c.req.valid("form").actionLink;
  const user = await getUserById(userId);
  if (!user) return showErrorAlert(c, "User not found");

  const emailHTML = await generateMagicLinkEmail(user, actionLink);
  const { error } = await supabaseAdmin.functions.invoke("send-email", {
    body: {
      to: user.email,
      subject: "Photobookers - Magic Link",
      html: emailHTML,
    },
    headers: {
      "x-function-secret": process.env.FUNCTION_SECRET ?? "",
    },
  });

  if (error) {
    console.error("Failed to send magic link:", error);
    return showErrorAlert(c, "Failed to send magic link");
  }

  return c.html(
    <>
      <Alert type="success" message="Magic link sent!" />
      <div id="server_events">
        <div x-init="$dispatch('dialog:close')"></div>
      </div>
    </>,
  );
};
