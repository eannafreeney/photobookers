import { Hono } from "hono";
import { getUser } from "../utils";
import { creatorFormSchema, creatorIdSchema } from "../schemas";
import { updateCreatorProfile } from "../services/creators";
import EditCreatorPage from "../pages/dashboard/EditCreatorPage";
import { formValidator, paramValidator } from "../lib/validator";
import Alert from "../components/app/Alert";
import { requireCreatorEditAccess } from "../middleware/creatorGuard";

export const creatorDashboardRoutes = new Hono();

// GET EDIT CREATOR PAGE
creatorDashboardRoutes.get(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  async (c) => {
    const creator = c.get("creator");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const page = Number(c.req.query("page") ?? 1);

    return c.html(
      <EditCreatorPage
        creator={creator}
        user={user}
        currentPath={currentPath}
        currentPage={page}
      />,
    );
  },
);

// POST EDIT CREATOR PAGE
creatorDashboardRoutes.post(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  async (c) => {
    const creator = c.get("creator");
    const formData = c.req.valid("form");

    const updatedCreator = await updateCreatorProfile(formData, creator.id);

    if (!updatedCreator) {
      return c.html(
        <Alert type="danger" message="Failed to update artist" />,
        422,
      );
    }

    return c.html(
      <Alert
        type="success"
        message={`${updatedCreator.displayName} Updated!`}
      />,
    );
  },
);
