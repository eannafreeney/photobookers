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
import {
  createAuthUser,
  createUserWithAuthId,
  deleteUserById,
} from "./services";
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

  return c.html(
    <>
      <CreateUserFormAdmin />
      <NewUserCredentialsModal
        email={email}
        temporaryPassword={temporaryPassword}
        creator={creator ?? undefined}
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
