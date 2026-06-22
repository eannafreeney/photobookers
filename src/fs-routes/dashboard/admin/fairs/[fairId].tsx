import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { fairIdSchema } from "../../../../features/dashboard/admin/fairs/schema";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { getFlash, getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../../pages/InfoPage";
import {
  deleteFairByIdAdmin,
  getFairByIdAdmin,
  updateFairAdmin,
} from "../../../../features/dashboard/admin/fairs/services";
import FairFormAdmin from "../../../../features/dashboard/admin/fairs/forms/FairFormAdmin";
import { fairFormAdminSchema } from "../../../../features/dashboard/admin/fairs/schema";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import { FairFormWithIdContext, FairIdContext } from "../../../../features/dashboard/admin/fairs/types";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import FairApprovalForm from "../../../../features/dashboard/admin/fairs/forms/FairApprovalForm";
import AttendeeManagerForm from "../../../../features/dashboard/admin/fairs/forms/AttendeeManagerForm";

export const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const fairId = c.req.param("fairId");
    const flash = await getFlash(c);
    const currentPath = c.req.path;

    const [error, fair] = await getFairByIdAdmin(fairId);
    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const formValues = {
      name: fair.name,
      slug: fair.slug,
      description: fair.description,
      city: fair.city,
      country: fair.country,
      venue: fair.venue,
      website: fair.website,
      start_date: new Date(fair.startDate).toISOString().split("T")[0],
      end_date: new Date(fair.endDate).toISOString().split("T")[0],
      status: fair.status,
      listing_tier: fair.listingTier,
      sort_order: fair.sortOrder,
    };

    return c.html(
      <AppLayout
        title={`Edit Fair: ${fair.name}`}
        user={user}
        flash={flash}
        currentPath={currentPath}
      >
        <Page>
          <Breadcrumbs
            items={[
              { label: "Admin Fairs Overview", href: "/dashboard/admin/fairs" },
              {
                label: `Edit "${fair.name}"`,
              },
            ]}
          />
          <div class="flex justify-end mb-4">
            <FairApprovalForm fair={fair} />
          </div>
          <FairFormAdmin fairId={fair.id} formValues={formValues} />
          <hr class="my-8" />
          <AttendeeManagerForm fair={fair} attendees={fair.attendees} />
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  formValidator(fairFormAdminSchema),
  paramValidator(fairIdSchema),
  async (c: FairFormWithIdContext) => {
    const formData = c.req.valid("form");
    const fairId = c.req.valid("param").fairId;

    const updates = {
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

    const [error, updatedFair] = await updateFairAdmin(fairId, updates);
    if (error) return showErrorAlert(c, error.reason);

    return showSuccessAlert(c, `${updatedFair.name} updated!`);
  },
);

export const DELETE = createRoute(
  paramValidator(fairIdSchema),
  async (c: FairIdContext) => {
    const fairId = c.req.valid("param").fairId;

    const [error, deletedFair] = await deleteFairByIdAdmin(fairId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message={`${deletedFair.name} deleted!`} />
        {dispatchEvents(["fairs:updated"])}
      </>,
    );
  },
);
