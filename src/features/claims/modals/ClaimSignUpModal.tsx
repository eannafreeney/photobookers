// src/features/claims/modals/ClaimSignupModal.tsx
import Link from "../../../components/app/Link";
import Button from "../../../components/app/Button";
import Checkbox from "../../../components/forms/Checkbox";
import FormButton from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";
import ValidateEmail from "../../auth/components/ValidateEmail";

type Props = {
  creatorId: string;
  creatorWebsite: string | null;
  currentPath?: string;
};

const ClaimSignupModal = ({
  creatorId,
  creatorWebsite,
  currentPath,
}: Props) => {
  const alpineAttrs = {
    "x-data": "claimSignupForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:ajax:after": "$dispatch('dialog:close')",
    "x-on:email-availability.window":
      "emailIsTaken = !$event.detail.emailIsAvailable",
  };

  const loginHref = currentPath
    ? `/auth/login?redirectUrl=${encodeURIComponent(`/claims/${creatorId}?currentPath=${encodeURIComponent(currentPath ?? "")}`)}`
    : `/auth/login?redirectUrl=${encodeURIComponent(`/claims/${creatorId}`)}`;

  return (
    <div class="flex flex-col gap-2 p-2 max-h-[70vh] overflow-y-auto">
      <p class="text-sm text-gray-600 mb-2">
        Already have an account?{" "}
        <Link href={loginHref}>
          <span class="font-semibold">Log in</span>
        </Link>
      </p>

      <form
        method="post"
        action={`/claims/${creatorId}/register-and-claim`}
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
          <Input
            type="password"
            label="Password"
            name="form.password"
            validateInput="validatePassword()"
            placeholder="••••••••"
            validationTrigger="blur"
            required
          />
          <Input
            type="password"
            label="Confirm Password"
            name="form.confirmPassword"
            validateInput="validateConfirmPassword()"
            placeholder="••••••••"
            validationTrigger="blur"
            required
          />
          {creatorWebsite ? (
            <input
              type="hidden"
              name="form.verificationUrl"
              value={creatorWebsite}
            />
          ) : (
            <Input
              label="Website"
              name="form.verificationUrl"
              type="url"
              placeholder="https://yourwebsite.com"
            />
          )}
          <Checkbox
            label="I agree to the terms and conditions"
            name="form.agreeToTerms"
            required
          />
        </div>
        <input type="hidden" name="form.type" value="fan" />
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

export default ClaimSignupModal;
