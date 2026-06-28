import { createRoute } from "hono-fsr";
import { paginationRequestBaseUrl } from "../../../../lib/pagination";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { creatorIdSchema } from "../../../../schemas";
import { getUser } from "../../../../utils";
import CreatorImageForm from "../../../../features/dashboard/images/forms/CreatorCoverForm";
import {
  deleteCreatorByIdAdmin,
  getCreatorByIdAdmin,
  updateCreatorProfileAdmin,
} from "../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { creatorFormAdminSchema } from "../../../../features/dashboard/admin/creators/schemas";
import Alert from "../../../../components/app/Alert";
import CreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/AddCreatorFormAdmin";
import AdminCreatorsTableAndFilter from "../../../../features/dashboard/admin/creators/components/AdminCreatorsTableAndFilter";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";
import EditCreatorFormAdmin from "../../../../features/dashboard/admin/creators/forms/EditCreatorFormAdmin";
import FeatureGuard from "../../../../components/layouts/FeatureGuard";
import { getFormValues } from "../../../../features/dashboard/creators/utils";
import CreatorBookList from "../../../../features/dashboard/admin/creators/components/CreatorBookList";
import StubOutreachStatus from "../../../../features/dashboard/admin/creators/components/StubOutreachStatus";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const user = await getUser(c);
  const creatorId = c.req.valid("param").creatorId;
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const searchQuery = c.req.query("search");

  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");

  const formValues = getFormValues(creator);

  return c.html(
    <AppLayout
      title="Edit Creator Profile"
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            {
              label: `Admin Creators Overview`,
              href: "/dashboard/admin/creators",
            },
            {
              label: `Edit ${creator.displayName}`,
            },
          ]}
        />
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="md:w-1/3">
            <CreatorImageForm
              initialUrl={creator?.coverUrl ?? null}
              creator={creator}
            />
          </div>
          <div
            class="hidden md:block w-px shrink-0 bg-outline self-stretch"
            aria-hidden="true"
          />
          <hr class="my-4 md:hidden" />
          <div class="md:w-2/3">
            <EditCreatorFormAdmin
              formValues={formValues}
              creatorId={creator?.id}
              type={creator?.type}
            />
            <div class="mt-4">
              <StubOutreachStatus creator={creator} />
            </div>
          </div>
        </div>
        <CreatorBookList
          creatorId={creator.id}
          currentPath={currentPath}
          currentPage={currentPage}
          searchQuery={searchQuery}
        />
        <FeatureGuard flagName="messages">
          {/* <CreatorMessageList creatorId={creator.id} /> */}
        </FeatureGuard>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(creatorFormAdminSchema),
  paramValidator(creatorIdSchema),
  async (c) => {
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
  },
);

export const DELETE = createRoute(
  paramValidator(creatorIdSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const currentPage = Number(c.req.query("page") ?? 1);
    const creatorsPaginationBaseUrl = paginationRequestBaseUrl(c.req.url);
    const [error, deletedCreator] = await deleteCreatorByIdAdmin(creatorId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Creator deleted!" />
        <AdminCreatorsTableAndFilter
          searchQuery={undefined}
          currentPage={currentPage}
          currentPath={creatorsPaginationBaseUrl}
        />
      </>,
    );
  },
);
