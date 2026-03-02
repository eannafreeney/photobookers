import Alert from "../../../../components/app/Alert";
import EditCreatorPageAdmin from "./Pages/EditCreatorPageAdmin";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getUser } from "../../../../utils";
import CreatorFormAdmin from "./components/CreatorFormAdmin";
import { CreatorsTable } from "./components/CreatorsTable";
import AssignOwnerForm from "./forms/AssignOwnerForm";
import AssignOwnerModal from "./modals/AssignOwnerModal";
import CreatorsOverviewPageAdmin from "./Pages/CreatorsOverviewPageAdmin";
import {
  createStubCreatorProfileAdmin,
  deleteCreatorByIdAdmin,
  findUserByEmailAdmin,
  getAllUserProfilesAdmin,
  getCreatorByIdAdmin,
  updateCreatorProfileAdmin,
} from "./services";
import {
  AssignOwnerContext,
  CreateCreatorAdminContext,
  CreatorIdContext,
  EditCreatorPageAdminContext,
  UpdateCreatorAdminContext,
} from "./types";
import { showSuccessAlert } from "../../../../lib/alertHelpers";
import { Context } from "hono";
import { assignCreatorToUserAdmin } from "../claims/services";

export const getCreatorsPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  return c.html(
    <CreatorsOverviewPageAdmin user={user} searchQuery={searchQuery} />,
  );
};

export const getEditCreatorPageAdmin = async (
  c: EditCreatorPageAdminContext,
) => {
  const user = await getUser(c);
  const creatorId = c.req.valid("param").creatorId;
  const creator = await getCreatorByIdAdmin(creatorId);
  if (!creator) {
    return showErrorAlert(c, "Creator not found");
  }
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  return c.html(
    <EditCreatorPageAdmin
      user={user}
      creator={creator}
      currentPath={currentPath}
      currentPage={currentPage}
    />,
  );
};

export const updateCreatorAdmin = async (c: UpdateCreatorAdminContext) => {
  const formData = c.req.valid("form");
  const creatorId = c.req.valid("param").creatorId;

  const updatedCreator = await updateCreatorProfileAdmin(formData, creatorId);
  if (!updatedCreator) {
    return showErrorAlert(c, "Failed to update creator");
  }
  return c.html(
    <>
      <Alert type="success" message="Creator updated!" />
      <CreatorFormAdmin />
    </>,
  );
};

export const createCreatorAdmin = async (c: CreateCreatorAdminContext) => {
  const user = await getUser(c);
  const formData = c.req.valid("form");
  const displayName = formData.displayName;
  const website = formData.website;
  const type = formData.type;

  try {
    await createStubCreatorProfileAdmin(displayName, user.id, type, website);
  } catch (error) {
    return showErrorAlert(
      c,
      "Failed to create stub creator profile. Please try again.",
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Creator created!" />
      <CreatorsTable searchQuery={undefined} />
      <CreatorFormAdmin />
    </>,
  );
};

export const deleteCreatorAdmin = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const deletedCreator = await deleteCreatorByIdAdmin(creatorId);
  if (!deletedCreator) {
    return showErrorAlert(c, "Failed to delete creator");
  }
  return c.html(
    <>
      <Alert type="success" message="Creator deleted!" />
      <CreatorsTable searchQuery={undefined} />
    </>,
  );
};

export const getAssignOwnerModal = async (c: Context) => {
  return c.html(<AssignOwnerModal />);
};

export const getAssignOwnerModalContent = async (c: Context) => {
  const users = await getAllUserProfilesAdmin();
  return c.html(
    <div id="assign-owner-content" class="h-64">
      <AssignOwnerForm users={users} />
    </div>,
  );
};

export const assignOwnerAdmin = async (c: AssignOwnerContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const { email, website } = c.req.valid("form");

  const user = await findUserByEmailAdmin(email);
  if (!user) return showErrorAlert(c, "No user found with that email");

  const websiteUrl = website?.trim() || null;

  try {
    await assignCreatorToUserAdmin(user.id, creatorId, websiteUrl);
  } catch (err) {
    console.error("Manual assign failed:", err);
    return showErrorAlert(c, "Failed to assign creator. Please try again.");
  }

  return showSuccessAlert(c, "Creator assigned!");
};
