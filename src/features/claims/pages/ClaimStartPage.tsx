import type { AuthUser, Flash } from "../../../../types";
import type { Creator } from "../../../db/schema";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Link from "../../../components/app/Link";
import Button from "../../../components/app/Button";
import Checkbox from "../../../components/forms/Checkbox";
import FormButton from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";
import ValidateEmail from "../../auth/components/ValidateEmail";

type Props = {
  creatorId: string;
  creator: Creator;
  user: AuthUser | null;
  flash?: Flash | null;
};

const claimStartPath = (creatorId: string) => `/claims/${creatorId}/start`;

const ClaimStartPage = ({ creatorId, creator, user, flash }: Props) => {
  const loginHref = `/auth/login?redirectUrl=${encodeURIComponent(claimStartPath(creatorId))}`;

  return (
    <AppLayout
      title="Claim this creator profile"
      user={user}
      currentPath={claimStartPath(creatorId)}
      flash={flash ?? undefined}
    >
      <Page>
        {user ? (
          <LoggedInClaimForm
            creatorId={creatorId}
            user={user}
            creatorWebsite={creator.website ?? ""}
          />
        ) : (
          <LoggedOutSignupForm
            creatorId={creatorId}
            creatorWebsite={creator.website ?? null}
            loginHref={loginHref}
          />
        )}
      </Page>
    </AppLayout>
  );
};

export default ClaimStartPage;

const LoggedInClaimForm = ({
  creatorId,
  user,
  creatorWebsite,
}: {
  creatorId: string;
  user: AuthUser;
  creatorWebsite: string;
}) => (
  <div class="flex flex-col gap-4">
    <h1 class="font-display text-3xl font-medium text-on-surface-strong">Claim creator profile</h1>
    <form
      method="post"
      action={claimStartPath(creatorId)}
      x-data={`claimForm(${JSON.stringify({ creatorWebsite: creatorWebsite || null })})`}
      x-on:submit="submitForm($event)"
    >
      <div class="flex flex-col gap-3 mb-4">
        {creatorWebsite ? (
          <>
            <p class="text-sm text-gray-600">
              This creator has <strong>{creatorWebsite}</strong> on file. If
              your account email (<strong>{user.email}</strong>) is at the same
              domain, you'll be approved instantly. Otherwise, your claim will
              be reviewed by our team.
            </p>
            <input
              type="hidden"
              name="form.verificationUrl"
              value={creatorWebsite}
            />
          </>
        ) : (
          <>
            <p class="text-sm text-gray-600">
              This creator doesn't have a website on file. Please provide their
              website URL. Your claim will then be reviewed by our team.
            </p>
            <Input
              label="Creator's Website URL"
              name="form.verificationUrl"
              type="url"
              placeholder="https://yourwebsite.com"
              required
            />
          </>
        )}
      </div>
      <input type="hidden" name="email" value={user.email} />
      <Button variant="solid" color="primary">
        Submit claim
      </Button>
    </form>
  </div>
);

const LoggedOutSignupForm = ({
  creatorId,
  creatorWebsite,
  loginHref,
}: {
  creatorId: string;
  creatorWebsite: string | null;
  loginHref: string;
}) => {
  const alpineAttrs = {
    "x-data": "claimSignupForm()",
    "@submit": "submitForm($event)",
    "@email-availability.window":
      "emailIsTaken = !$event.detail.emailIsAvailable",
    "@turnstile:success.window": "setCaptchaToken($event.detail.token)",
    "@turnstile:expired.window": "clearCaptchaToken()",
  };

  return (
    <div id="register-form" class="flex flex-col gap-2">
      <h1 class="font-display text-3xl font-medium text-on-surface-strong mb-2">Claim this creator profile</h1>
      <p class="text-sm text-gray-600 mb-2">
        Already have an account?{" "}
        <Link href={loginHref}>
          <span class="font-semibold">Log in</span>
        </Link>
      </p>
      <form
        method="post"
        action={`${claimStartPath(creatorId)}/signup`}
        {...alpineAttrs}
      >
        <div class="flex flex-col gap-3 mb-2">
          <Input
            label="First Name"
            name="form.firstName"
            placeholder="Your first name"
            validateInput="validateField('firstName')"
            required
          />
          <Input
            label="Last Name"
            name="form.lastName"
            placeholder="Your last name"
            validateInput="validateField('lastName')"
            required
          />
          <ValidateEmail />
          {creatorWebsite ? (
            <input
              type="hidden"
              name="verificationUrl"
              value={creatorWebsite}
            />
          ) : (
            <Input
              label="Website"
              name="form.verificationUrl"
              type="url"
              placeholder="https://yourwebsite.com"
              required
            />
          )}
          <div class="my-4">
            <Checkbox
              label="I agree to the terms and conditions"
              name="form.agreeToTerms"
              required
            />
          </div>
        </div>
        <input type="hidden" name="type" value="fan" />
        <input type="hidden" name="captchaToken" x-model="form.captchaToken" />
        <div
          class="cf-turnstile my-4"
          data-theme="light"
          data-size="flexible"
          data-sitekey={process.env.TURNSTILE_SITE_KEY}
          data-callback="onTurnstileSuccess"
          data-expired-callback="onTurnstileExpired"
        ></div>
        <FormButton
          buttonText="Create account & submit claim"
          loadingText="Submitting..."
        />
        <p
          x-show="errors.globalError"
          class="text-red-500"
          x-text="errors.globalError"
        />
      </form>
    </div>
  );
};
