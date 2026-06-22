import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../utils";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { FairFormAdmin } from "../../../../features/dashboard/admin/fairs/forms/FairFormAdmin";
import { formValidator } from "../../../../lib/validator";
import { fairFormAdminSchema } from "../../../../features/dashboard/admin/fairs/schema";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { createFairAdmin } from "../../../../features/dashboard/admin/fairs/services";
import Alert from "../../../../components/app/Alert";
import { FairFormContext } from "../../../../features/dashboard/admin/fairs/types";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Create Fair" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <FairFormAdmin />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(fairFormAdminSchema),
  async (c: FairFormContext) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    const fairData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      city: formData.city,
      country: formData.country,
      venue: formData.venue,
      website: formData.website || null,
      startDate: new Date(formData.start_date),
      endDate: new Date(formData.end_date),
      status: formData.status,
      listingTier: formData.listing_tier || "free",
      sortOrder: formData.sort_order || null,
    };

    const [error, newFair] = await createFairAdmin(fairData, user.id);

    if (error) return showErrorAlert(c, error.reason);

    if (!newFair) {
      return c.html(
        <Alert type="danger" message="Failed to create fair" />,
        422,
      );
    }

    await setFlash(c, "success", `${newFair.name} created!`);
    return c.redirect(`/dashboard/admin/fairs/${newFair.id}`, 303);
  },
);
