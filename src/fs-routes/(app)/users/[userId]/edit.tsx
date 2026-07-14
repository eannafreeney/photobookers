import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getFlash, getUser } from "../../../../utils";
import { userIdSchema } from "../../../../schemas";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { userProfileFormSchema } from "../../../../features/app/schema";
import { UserProfileFormContext } from "../../../../features/app/types";
import { updateOwnUserProfile } from "../../../../features/app/services";
import UserCoverForm from "../../../../features/app/forms/UserCoverForm";
import UserProfileForm from "../../../../features/app/forms/UserProfileForm";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import PageHeader from "../../../../components/app/PageHeader";
import SectionTitle from "../../../../components/app/SectionTitle";
import InfoPage from "../../../../pages/InfoPage";
import MemberSignInPrompt, {
  memberSignInPrompts,
} from "../../../../features/app/components/MemberSignInPrompt";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../lib/alertHelpers";

export const GET = createRoute(
  paramValidator(userIdSchema),
  async (c: Context) => {
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;

    if (!user) {
      return c.html(
        <AppLayout title="Edit Profile" user={user} currentPath={currentPath} noIndex>
          <Page>
            <MemberSignInPrompt
              prompt={memberSignInPrompts.profile}
              currentPath={currentPath}
            />
          </Page>
        </AppLayout>,
      );
    }

    const userId = c.req.param("userId");
    if (userId !== user.id) {
      return c.html(
        <InfoPage
          errorMessage="You can only edit your own profile."
          user={user}
        />,
      );
    }

    return c.html(
      <AppLayout
        title="Edit Profile"
        user={user}
        flash={flash}
        currentPath={currentPath}
        noIndex
      >
        <Page>
          <div class="flex flex-col gap-8 max-w-2xl">
            <PageHeader
              kicker="Account"
              title="Edit Profile"
              intro="Update your name and profile photo."
            />
            <UserProfileForm user={user} />
            <hr class="border-outline" />
            <div class="flex flex-col gap-4">
              <SectionTitle>Profile Image</SectionTitle>
              <UserCoverForm initialUrl={user.profileImageUrl} user={user} />
            </div>
          </div>
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  formValidator(userProfileFormSchema),
  paramValidator(userIdSchema),
  async (c: UserProfileFormContext) => {
    const user = await getUser(c);
    if (!user) {
      return showErrorAlert(c, "You must be signed in to do this.", 401);
    }

    const userId = c.req.param("userId");
    if (userId !== user.id) {
      return showErrorAlert(c, "You can only edit your own profile.", 403);
    }

    const { firstName, lastName } = c.req.valid("form");

    const [error] = await updateOwnUserProfile(user.id, {
      firstName,
      lastName,
    });
    if (error) return showErrorAlert(c, error.reason);

    return showSuccessAlert(c, "Profile updated");
  },
);
