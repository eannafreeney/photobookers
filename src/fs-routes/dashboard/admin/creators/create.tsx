import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../lib/validator";
import { creatorFormAdminSchema } from "../../../../features/dashboard/admin/creators/schemas";
import { getUser } from "../../../../utils";
import { createStubCreatorProfileAdmin } from "../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import AdminCreatorsTableAndFilter from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter";
import CreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/AddCreatorFormAdmin";

export const POST = createRoute(
  formValidator(creatorFormAdminSchema),
  async (c) => {
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
  },
);
