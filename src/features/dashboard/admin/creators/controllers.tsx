import Alert from "../../../../components/app/Alert";
import EditCreatorPageAdmin from "./Pages/EditCreatorPageAdmin";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { getUser } from "../../../../utils";
import CreatorFormAdmin from "./forms/AddCreatorFormAdmin";
import AssignOwnerModal from "./modals/AssignOwnerModal";
import AdminCreatorsOverviewPage from "./Pages/AdminCreatorsOverviewPage";
import {
  createCreatorInterviewInviteAdmin,
  createStubCreatorProfileAdmin,
  deleteCreatorByIdAdmin,
  getAllUserProfilesAdmin,
  getCreatorByIdAdmin,
  getCreatorRecipientEmailAdmin,
  markInterviewEmailSentAdmin,
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
import { generateInterviewInviteEmail, generateWelcomeEmail } from "./emails";
import { sendEmail } from "../../../../lib/sendEmail";
import SendWelcomeEmailButton from "./components/SendWelcomeEmailButton";
import OwnerCell from "./components/OwnerCell";
import { nanoid } from "nanoid";
import SendInterviewButton from "./components/SendInterviewButton";

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

  const [markError, updatedCreator] =
    await markWelcomeEmailSentAdmin(creatorId);
  if (markError) return showErrorAlert(c, "Failed to mark welcome email sent");

  return c.html(
    <>
      <Alert type="success" message="Welcome email sent!" />
      <SendWelcomeEmailButton creator={updatedCreator} />
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
      <Alert
        type="success"
        message={`user removed as owner of creator: ${creator.displayName}`}
      />
      <OwnerCell ownerUserId={null} creatorId={creatorId} />
    </>,
  );
};

export const sendInterviewAdmin = async (c: CreatorIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const [err, resolved] = await getCreatorRecipientEmailAdmin(creatorId);
  if (err) return showErrorAlert(c, "Creator not found");
  const { creator, recipientEmail } = resolved;

  if (creator.status !== "verified") {
    return showErrorAlert(c, "Interview can only be sent to verified creators");
  }
  if (!recipientEmail) return showErrorAlert(c, "No recipient email found");

  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "User not found");

  const inviteToken = nanoid(32);
  const [createError] = await createCreatorInterviewInviteAdmin({
    creatorId,
    recipientEmail,
    invitedByUserId: user.id,
    inviteToken,
    interviewType: "introduction",
    bookId: null,
  });
  if (createError) return showErrorAlert(c, createError.reason);

  const interviewLink = `${process.env.SITE_URL}/interviews/${inviteToken}`;
  const html = generateInterviewInviteEmail({
    creatorName: creator.displayName,
    interviewLink,
  });

  const [emailError] = await sendEmail(
    recipientEmail,
    `Interview invitation for ${creator.displayName}`,
    html,
  );
  if (emailError) return showErrorAlert(c, emailError.reason);

  const [creatorErr, updatedCreator] =
    await markInterviewEmailSentAdmin(creatorId);
  if (creatorErr || !updatedCreator)
    return showErrorAlert(c, "Failed to update creator");

  return c.html(
    <>
      <Alert type="success" message="Interview invite sent!" />
      <SendInterviewButton creator={updatedCreator} />
    </>,
  );
};
