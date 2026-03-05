import Alert from "../../../../components/app/Alert";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import { getUser } from "../../../../utils";
import UsersPageAdmin from "./pages/UsersPageAdmin";
import { Context } from "hono";
import {
  DeleteMultipleUsersContext,
  MagicLinkFormContext,
  UserFormContext,
  UserIdContext,
} from "./types";
import { supabaseAdmin } from "../../../../lib/supabase";
import { generateMagicLinkEmail } from "./emails";
import MagicLinkModal from "./modals/MagicLinkModal";
import { createUserWithAuthId, deleteUserById, getUserById } from "./services";
import NewUserCredentialsModal from "./modals/NewUserCredentialsModal";
import CreateUserFormAdmin from "./forms/CreateUserFormAdmin";

const updaterUsersEvent = () => (
  <div id="server_events">
    <div x-init="$dispatch('users:updated')"></div>
  </div>
);

export const getUsersPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(<UsersPageAdmin user={user} currentPath={currentPath} />);
};

export const createNewUserAdmin = async (c: UserFormContext) => {
  const formData = c.req.valid("form");
  const { email, firstName, lastName } = formData;
  const temporaryPassword = crypto.randomUUID();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { firstName, lastName },
    });

  if (authError) {
    return showErrorAlert(c, authError.message);
  }
  const authUserId = authData.user?.id;
  if (!authUserId) {
    return showErrorAlert(c, "Failed to create user.");
  }

  const newUser = await createUserWithAuthId(authUserId, formData, {
    mustResetPassword: true,
  });
  if (!newUser) {
    return showErrorAlert(c, "Failed to create user");
  }
  return c.html(
    <>
      <CreateUserFormAdmin />
      <NewUserCredentialsModal
        email={email}
        temporaryPassword={temporaryPassword}
      />
      {updaterUsersEvent()}
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
      {updaterUsersEvent()}
    </>,
  );
};

export const deleteMultipleUsersAdmin = async (
  c: DeleteMultipleUsersContext,
) => {
  const { ids } = c.req.valid("form");
  const results = await Promise.all(ids.map((id) => deleteUserById(id)));
  const deleted = results.filter(Boolean).length;
  return c.html(
    <>
      <Alert type="success" message={`${deleted} user(s) deleted.`} />
      {updaterUsersEvent()}
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
