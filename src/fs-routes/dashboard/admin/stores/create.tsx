import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../utils";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import StoreFormAdmin from "../../../../features/dashboard/admin/stores/forms/StoreFormAdmin";
import { formValidator } from "../../../../lib/validator";
import { storeFormAdminSchema } from "../../../../features/dashboard/admin/stores/schema";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { createStoreAdmin } from "../../../../features/dashboard/admin/stores/services";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates";
import Alert from "../../../../components/app/Alert";
import { StoreFormContext } from "../../../../features/dashboard/admin/stores/types";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Create Store" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <StoreFormAdmin />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(storeFormAdminSchema),
  async (c: StoreFormContext) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    const storeData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      website: formData.website || null,
      latitude: parseOptionalCoordinate(formData.latitude),
      longitude: parseOptionalCoordinate(formData.longitude),
      status: formData.status,
      sortOrder: formData.sort_order || null,
    };

    const [error, newStore] = await createStoreAdmin(storeData, user.id);

    if (error) return showErrorAlert(c, error.reason);

    if (!newStore) {
      return c.html(
        <Alert type="danger" message="Failed to create store" />,
        422,
      );
    }

    await setFlash(c, "success", `${newStore.name} created!`);
    return c.redirect(`/dashboard/admin/stores/${newStore.id}`, 303);
  },
);
