import Alert from "../../../../components/app/Alert";
import EditCreatorPageAdmin from "./Pages/EditCreatorPageAdmin";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getUser } from "../../../../utils";
import CreatorFormAdmin from "./forms/AddCreatorFormAdmin";
import AssignOwnerModal from "./modals/AssignOwnerModal";
import AdminCreatorsOverviewPage from "./Pages/AdminCreatorsOverviewPage";
import {
  createStubCreatorProfileAdmin,
  deleteCreatorByIdAdmin,
  getAllUserProfilesAdmin,
  getCreatorByIdAdmin,
  markWelcomeEmailSentAdmin,
  removeCreatorOwnerAdminDB,
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
import AdminCreatorsTableAndFilter from "./components/AdminCreatorsTableAndFilter";
import { assignUserAsCreatorOwnerAdmin } from "../claims/services";
import AssignOwnerModalContent from "./components/AssignOwnerModalContent";
import { generateWelcomeEmail } from "./emails";
import { sendEmail } from "../../../../lib/sendEmail";
import SendWelcomeEmailButton from "./components/SendWelcomeEmailButton";
import { dispatchEvents } from "../../../../lib/disatchEvents";

export const getCreatorsOverviewPage = async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  return c.html(
    <AdminCreatorsOverviewPage
      user={user}
      searchQuery={searchQuery}
      currentPage={currentPage}
      currentPath={currentPath}
    />,
  );
};

export const getCreatorsTableFilter = async (c: Context) => {
  const rawType = c.req.query("type");
  const type =
    rawType === "artist" || rawType === "publisher" ? rawType : undefined;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const searchQuery = c.req.query("search");

  return c.html(
    <AdminCreatorsTableAndFilter
      type={type}
      currentPage={currentPage}
      searchQuery={searchQuery}
      currentPath={currentPath}
    />,
  );
};

export const getEditCreatorPageAdmin = async (
  c: EditCreatorPageAdminContext,
) => {
  const user = await getUser(c);
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");

  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");

  return c.html(
    <EditCreatorPageAdmin
      user={user}
      creator={creator}
      currentPath={currentPath}
      currentPage={currentPage}
      searchQuery={searchQuery}
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
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const displayName = formData.displayName;
  const website = formData.website;
  const type = formData.type;
  const email = formData.email;

  const [error, newCreator] = await createStubCreatorProfileAdmin(
    displayName,
    user.id,
    type,
    website,
    email,
  );

  if (error || !newCreator) {
    return showErrorAlert(
      c,
      "Failed to create stub creator profile. Please try again.",
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Creator created!" />
      <AdminCreatorsTableAndFilter
        searchQuery={undefined}
        currentPage={currentPage}
        currentPath={currentPath}
      />
      <CreatorFormAdmin />
    </>,
  );
};

export const deleteCreatorAdmin = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;
  const deletedCreator = await deleteCreatorByIdAdmin(creatorId);
  if (!deletedCreator) {
    return showErrorAlert(c, "Failed to delete creator");
  }
  return c.html(
    <>
      <Alert type="success" message="Creator deleted!" />
      <AdminCreatorsTableAndFilter
        searchQuery={undefined}
        currentPage={currentPage}
        currentPath={currentPath}
      />
    </>,
  );
};

export const getAssignOwnerModal = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");

  return c.html(
    <AssignOwnerModal
      creatorName={creator?.displayName ?? "this creator"}
      creatorId={creatorId}
    />,
  );
};

export const getAssignOwnerModalContent = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const users = await getAllUserProfilesAdmin();
  return c.html(
    <AssignOwnerModalContent users={users} creatorId={creatorId} />,
  );
};

export const assignOwnerAdmin = async (c: AssignOwnerContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const userId = c.req.valid("form").userId;

  try {
    await assignUserAsCreatorOwnerAdmin(userId, creatorId);
  } catch (err) {
    console.error("Manual assign failed:", err);
    return showErrorAlert(c, "Failed to assign creator. Please try again.");
  }

  return showSuccessAlert(c, "Creator assigned!");
};

export const sendWelcomeEmailAdmin = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  if (!creator.email) return showErrorAlert(c, "Creator has no email");

  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "User not found");

  const temporaryPassword = crypto.randomUUID();

  const loginLink = `${process.env.SITE_URL}/auth/login?email=${encodeURIComponent(creator.email)}&password=${encodeURIComponent(temporaryPassword)}`;

  // send welcome email to creator
  const emailHTML = generateWelcomeEmail(creator, loginLink);

  if (!creator.email) return showErrorAlert(c, "Creator has no email");

  await sendEmail(
    creator?.email,
    `Hi ${creator.displayName}! Invitation to Photobookers`,
    emailHTML,
  );

  const [markError, markResult] = await markWelcomeEmailSentAdmin(creatorId);
  if (markError || !markResult)
    return showErrorAlert(c, "Failed to mark welcome email sent");

  return c.html(
    <>
      <Alert type="success" message="Welcome email sent!" />
      <SendWelcomeEmailButton creator={creator} />
    </>,
  );
};

export const removeCreatorOwnerAdmin = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await removeCreatorOwnerAdminDB(creatorId);
  if (error || !creator)
    return showErrorAlert(c, "Failed to remove creator owner");

  return c.html(
    <>
      <Alert type="success" message="Creator owner removed!" />
      {dispatchEvents(["creators:updated"])}
    </>,
  );
};
