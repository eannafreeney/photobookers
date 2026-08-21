import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator";
import { creatorIdSchema } from "../../../schemas";
import { Context } from "hono";
import { getUser } from "../../../utils";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { creatorFormSchema } from "../../../features/dashboard/creators/schema";
import AppLayout from "../../../components/layouts/AppLayout";
import CreatorForm from "../../../features/dashboard/creators/forms/EditCreatorForm";
import CreatorImageForm from "../../../features/dashboard/images/forms/CreatorCoverForm";
import { getFormValues } from "../../../features/dashboard/creators/utils";
import { CreatorFormWithIdContext } from "../../../features/dashboard/creators/types";
import { updateCreatorProfileAdmin } from "../../../features/dashboard/admin/creators/services";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import CreatorBannerForm from "../../../features/dashboard/images/forms/CreatorBannerForm";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell";
import { getPendingClaim } from "../../../features/claims/services";
import ProfileBadgeCard from "../../../features/dashboard/creators/components/ProfileBadgeCard";
import { getCreatorReferralCounts } from "../../../features/creator-views/services";
import { BADGE_REFERRAL } from "../../../lib/embedBadge";
import InfoPage from "../../../pages/InfoPage";

export const GET = createRoute(
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  async (c: Context) => {
    const creator = c.get("creator");
    const user = await getUser(c);
    const currentPath = c.req.path;

    const [claimError, claim] = await getPendingClaim(user.id, creator.id);
    if (claimError)
      return c.html(<InfoPage errorMessage={claimError.reason} user={user} />);

    const formValues = getFormValues(creator);

    // Badge stats are a nice-to-have on this page — never fail the profile
    // editor because the analytics query fell over.
    const badgeViewCount = await getCreatorReferralCounts(creator.id)
      .then(
        (rows) =>
          rows.find((row) => row.ref === BADGE_REFERRAL)?.viewCount ?? 0,
      )
      .catch(() => null);

    return c.html(
      <AppLayout
        title="Edit Creator Profile"
        user={user}
        currentPath={currentPath}
      >
        <CreatorDashboardShell
          currentPath={currentPath}
          user={user}
          claimStatus={claim?.status ?? null}
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-8 w-1/3">
              <CreatorImageForm
                initialUrl={creator?.coverUrl ?? null}
                creator={creator}
              />
              <CreatorBannerForm
                initialUrl={creator?.bannerUrl ?? null}
                creator={creator}
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
          <ProfileBadgeCard
            creator={creator}
            badgeViewCount={badgeViewCount}
          />
        </CreatorDashboardShell>
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
