import { Context, Hono } from "hono";
import Alert from "../components/app/Alert";
import { getUser } from "../utils";
import {
  approveClaim,
  generateClaimApprovalEmail,
  generateClaimRejectionEmail,
  rejectClaim,
} from "../services/claims";
import { createStubCreatorProfile, getCreatorById } from "../services/creators";
import { supabaseAdmin } from "../lib/supabase";
import ClaimsTable from "../components/admin/ClaimsTable";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";
import CreatorFormAdmin from "../components/admin/CreatorFormAdmin";
import {
  bookIdSchema,
  creatorFormAdminSchema,
  creatorIdSchema,
} from "../schemas";
import { formValidator, paramValidator } from "../lib/validator";
import { CreatorsTable } from "../components/admin/CreatorsTable";
import {
  deleteBookByIdAdmin,
  deleteCreatorByIdAdmin,
  getClaimById,
} from "../services/admin";
import { requireAdminAccess } from "../middleware/adminGuard";
import BooksTable from "../components/admin/BooksTable";
import NavTabs from "../components/admin/NavTabs";
import SectionTitle from "../components/app/SectionTitle";
import { deleteBookById, getBookById } from "../services/books";

export const adminDashboardRoutes = new Hono();

export const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
) => c.html(<Alert type="danger" message={errorMessage} />, 422);

adminDashboardRoutes.get("/", requireAdminAccess, async (c) => {
  return c.redirect("/dashboard/admin/books");
});

adminDashboardRoutes.get("/books", requireAdminAccess, async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");

  return c.html(
    <AppLayout title="Books" user={user}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/books" />
        <BooksTable searchQuery={searchQuery} />
      </Page>
    </AppLayout>,
  );
});

adminDashboardRoutes.get("/claims", requireAdminAccess, async (c) => {
  const user = await getUser(c);
  return c.html(
    <AppLayout title="Admin Dashboard" user={user}>
      <NavTabs currentPath="/dashboard/admin/books" />
      <SectionTitle>Claims Pending Admin Review</SectionTitle>
      <ClaimsTable />
    </AppLayout>,
  );
});

adminDashboardRoutes.get("/creators", requireAdminAccess, async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  return c.html(
    <AppLayout title="New Creator" user={user}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/creators" />
        <SectionTitle>Creators</SectionTitle>
        <CreatorFormAdmin />
        <CreatorsTable searchQuery={searchQuery} />
      </Page>
    </AppLayout>,
  );
});

adminDashboardRoutes.post(
  "/claims/:claimId/approve",
  requireAdminAccess,
  async (c) => {
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
  },
);

adminDashboardRoutes.post(
  "/claims/:claimId/reject",
  requireAdminAccess,
  async (c) => {
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
  },
);

adminDashboardRoutes.post(
  "/creators/new",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const displayName = formData.displayName;
    const website = formData.website;
    const type = formData.type;

    try {
      await createStubCreatorProfile(displayName, user.id, type, website);
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
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/creators/delete/:creatorId",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }
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
  },
);

adminDashboardRoutes.post(
  "/books/delete/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }
    const deletedBook = await deleteBookByIdAdmin(bookId);
    if (!deletedBook) {
      return showErrorAlert(c, "Failed to delete book");
    }
    return c.html(
      <>
        <Alert type="success" message={`${deletedBook.title} deleted!`} />
        <BooksTable searchQuery={undefined} />
      </>,
    );
  },
);
