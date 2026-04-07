import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator";
import { creatorIdSchema } from "../../../schemas";
import { Context } from "hono";
import { getUser } from "../../../utils";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { creatorFormSchema } from "../../../features/dashboard/creators/schema";
import AppLayout from "../../../components/layouts/AppLayout";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import Page from "../../../components/layouts/Page";
import CreatorForm from "../../../features/dashboard/creators/forms/EditCreatorForm";
import CreatorImageForm from "../../../features/dashboard/images/forms/CreatorCoverForm";
import { getFormValues } from "../../../features/dashboard/creators/utils";
import { CreatorFormWithIdContext } from "../../../features/dashboard/creators/types";
import { updateCreatorProfileAdmin } from "../../../features/dashboard/admin/creators/services";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";

export const GET = createRoute(
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  async (c: Context) => {
    const creator = c.get("creator");
    const user = await getUser(c);
    const currentPath = c.req.path;

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
                label: `Dashboard`,
                href: "/dashboard/books",
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
                user={user}
              />
            </div>
            <div class="hidden md:block w-px shrink-0 bg-outline self-stretch" />
            <hr class="my-4 md:hidden" />
            <div class="md:w-2/3">
              <CreatorForm
                formValues={formValues}
                creator={creator}
                type={creator?.type}
                user={user}
              />
            </div>
          </div>
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  async (c: CreatorFormWithIdContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const formData = c.req.valid("form");

    const updatedCreator = await updateCreatorProfileAdmin(formData, creatorId);
    if (!updatedCreator) return showErrorAlert(c, "Failed to update artist");
    return showSuccessAlert(c, `${updatedCreator.displayName} Updated!`);
  },
);
