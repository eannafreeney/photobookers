import Alert from "../../../../components/app/Alert";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getUser } from "../../../../utils";
import UsersPageAdmin from "./pages/UsersPageAdmin";
import { Context } from "hono";
import {
  DeleteMultipleUsersContext,
  UserFormContext,
  UserIdContext,
} from "./types";
import { supabaseAdmin } from "../../../../lib/supabase";
import { createUserWithAuthId, deleteUserById } from "./services";
import NewUserCredentialsModal from "./modals/NewUserCredentialsModal";
import CreateUserFormAdmin from "./forms/CreateUserFormAdmin";
import { getCreatorById } from "../../creators/services";
import { assignUserAsCreatorOwnerAdmin } from "../claims/services";

const updaterUsersEvent = () => (
  <div id="server_events">
    <div x-init="$dispatch('users:updated')"></div>
  </div>
);

export const getUsersPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  return c.html(
    <UsersPageAdmin
      user={user}
      currentPath={currentPath}
      searchQuery={searchQuery}
      currentPage={currentPage}
    />,
  );
};

export const createNewUserAdmin = async (c: UserFormContext) => {
  const formData = c.req.valid("form");
  const { email, firstName, lastName, creatorId } = formData;
  const temporaryPassword = crypto.randomUUID();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { firstName, lastName },
    });

  let creator;
  if (creatorId) {
    creator = await getCreatorById(creatorId);
    if (!creator) return showErrorAlert(c, "Creator not found");
  }
  console.log("creator", creator);
  if (authError) {
    return showErrorAlert(c, authError.message);
  }
  const authUserId = authData.user?.id;
  if (!authUserId) {
    return showErrorAlert(c, "Failed to create user.");
  }

  try {
    const newUser = await createUserWithAuthId(authUserId, formData, {
      mustResetPassword: true,
    });
    if (!newUser) {
      return showErrorAlert(c, "Failed to create user");
    }
    if (creator) {
      await assignUserAsCreatorOwnerAdmin(authUserId, creator.id);
    }
  } catch (error) {
    console.error("Failed to create user and assign creator owner:", error);
    return showErrorAlert(c, "Failed to create user and assign creator owner");
  }

  return c.html(
    <>
      <CreateUserFormAdmin />
      <NewUserCredentialsModal
        email={email}
        temporaryPassword={temporaryPassword}
        creator={creator}
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
