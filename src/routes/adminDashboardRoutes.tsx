import { Context, Hono } from "hono";
import Alert from "../components/app/Alert";
import { getUser } from "../utils";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import {
  approveClaim,
  generateClaimApprovalEmail,
  generateClaimRejectionEmail,
  getClaimById,
  rejectClaim,
} from "../services/claims";
import { createStubCreatorProfile, getCreatorById } from "../services/creators";
import { supabaseAdmin } from "../lib/supabase";
import ClaimsTable from "../components/admin/ClaimsTable";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";
import CreatorFormAdmin from "../components/admin/CreatorFormAdmin";
import { creatorFormAdminSchema } from "../schemas";
import { formValidator } from "../lib/validator";
import { CreatorsTable } from "../components/admin/CreatorsTable";

export const adminDashboardRoutes = new Hono();

export const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
) => c.html(<Alert type="danger" message={errorMessage} />, 422);

adminDashboardRoutes.get("/", async (c) => {
  const user = await getUser(c);
  return c.html(<AdminDashboard user={user} />);
});

adminDashboardRoutes.post("/claims/:claimId/approve", async (c) => {
  const claimId = c.req.param("claimId");
  const claim = await getClaimById(claimId);
  if (!claim) {
    return showErrorAlert(c, "Claim not found");
  }
  const user = await getUser(c);
  const creator = await getCreatorById(claim.creatorId);
  if (!user || !creator) {
    return showErrorAlert(c, "User or creator not found");
  }

  await approveClaim(claimId);
  const emailHTML = await generateClaimApprovalEmail(user, creator);

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: user?.email,
        subject: `Your Claim for ${creator.displayName} has been approved`,
        html: emailHTML,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      return showErrorAlert(
        c,
        "Failed to send approval email. Please try again.",
      );
    }
  } catch (error) {
    console.error("Email error:", error);
    return showErrorAlert(
      c,
      "Failed to send approval email. Please try again.",
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Claim approved!" />
      <ClaimsTable />
    </>,
  );
});

adminDashboardRoutes.post("/claims/:claimId/reject", async (c) => {
  const claimId = c.req.param("claimId");
  const claim = await getClaimById(claimId);
  if (!claim) {
    return showErrorAlert(c, "Claim not found");
  }
  const user = await getUser(c);
  const creator = await getCreatorById(claim.creatorId);
  if (!user || !creator) {
    return showErrorAlert(c, "User or creator not found");
  }

  await rejectClaim(claimId);
  const emailHTML = await generateClaimRejectionEmail(user, creator);

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: user?.email,
        subject: `Your Claim for ${creator.displayName} has been rejected`,
        html: emailHTML,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      return showErrorAlert(
        c,
        "Failed to send rejection email. Please try again.",
      );
    }
  } catch (error) {
    console.error("Email error:", error);
    return showErrorAlert(
      c,
      "Failed to send rejection email. Please try again.",
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Claim rejected!" />
      <ClaimsTable />
    </>,
  );
});

adminDashboardRoutes.get("/creators", async (c) => {
  const user = await getUser(c);
  return c.html(
    <AppLayout title="New Creator" user={user}>
      <Page>
        <CreatorFormAdmin />
        <CreatorsTable />
      </Page>
    </AppLayout>,
  );
});

adminDashboardRoutes.post(
  "/creators/new",
  formValidator(creatorFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const displayName = formData.displayName;
    const website = formData.website;
    const type = formData.type;

    let newCreator;
    try {
      newCreator = await createStubCreatorProfile(
        displayName,
        user.id,
        type,
        website,
      );
    } catch (error) {
      return showErrorAlert(
        c,
        "Failed to create stub creator profile. Please try again.",
      );
    }

    return c.html(<Alert type="success" message="Creator created!" />);
  },
);

adminDashboardRoutes.post("/creators/delete/:creatorId", async (c) => {
  console.log("delete creator");
  return c.html(<Alert type="success" message="Creator deleted!" />);
});
