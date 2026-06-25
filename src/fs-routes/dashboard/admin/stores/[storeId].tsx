import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { storeIdSchema } from "../../../../features/dashboard/admin/stores/schema";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { getFlash, getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../../pages/InfoPage";
import {
  deleteStoreByIdAdmin,
  getStoreByIdAdmin,
  updateStoreAdmin,
} from "../../../../features/dashboard/admin/stores/services";
import StoreFormAdmin from "../../../../features/dashboard/admin/stores/forms/StoreFormAdmin";
import { storeFormAdminSchema } from "../../../../features/dashboard/admin/stores/schema";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import {
  StoreFormWithIdContext,
  StoreIdContext,
} from "../../../../features/dashboard/admin/stores/types";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import StoreApprovalForm from "../../../../features/dashboard/admin/stores/forms/StoreApprovalForm";
import StoreCoverForm from "../../../../features/dashboard/admin/stores/forms/StoreCoverForm";
import { parseOptionalCoordinate } from "../../../../features/dashboard/admin/stores/coordinates";
import { routeParam } from "../../../../lib/routeParam";

export const GET = createRoute(
  paramValidator(storeIdSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const storeId = routeParam(c, "storeId");
    const flash = await getFlash(c);
    const currentPath = c.req.path;

    const [error, store] = await getStoreByIdAdmin(storeId);
    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const formValues = {
      name: store.name,
      slug: store.slug,
      description: store.description,
      address: store.address,
      city: store.city,
      country: store.country,
      website: store.website,
      latitude: store.latitude,
      longitude: store.longitude,
      status: store.status,
      sort_order: store.sortOrder,
    };

    return c.html(
      <AppLayout
        title={`Edit Store: ${store.name}`}
        user={user}
        flash={flash}
        currentPath={currentPath}
      >
        <Page>
          <Breadcrumbs
            items={[
              {
                label: "Admin Stores Overview",
                href: "/dashboard/admin/stores",
              },
              {
                label: `Edit "${store.name}"`,
              },
            ]}
          />
          <div class="flex justify-end mb-4">
            <StoreApprovalForm store={store} />
          </div>
          <StoreFormAdmin storeId={store.id} formValues={formValues} />
          <hr class="my-8" />
          <StoreCoverForm store={store} />
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  formValidator(storeFormAdminSchema),
  paramValidator(storeIdSchema),
  async (c: StoreFormWithIdContext) => {
    const formData = c.req.valid("form");
    const storeId = c.req.valid("param").storeId;

    const updates = {
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

    const [error, updatedStore] = await updateStoreAdmin(storeId, updates);
    if (error) return showErrorAlert(c, error.reason);

    return showSuccessAlert(c, `${updatedStore.name} updated!`);
  },
);

export const DELETE = createRoute(
  paramValidator(storeIdSchema),
  async (c: StoreIdContext) => {
    const storeId = c.req.valid("param").storeId;

    const [error, deletedStore] = await deleteStoreByIdAdmin(storeId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message={`${deletedStore.name} deleted!`} />
        {dispatchEvents(["stores:updated"])}
      </>,
    );
  },
);
