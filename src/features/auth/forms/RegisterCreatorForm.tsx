import Link from "../../../components/app/Link";
import Checkbox from "../../../components/forms/Checkbox";
import FormButton from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";
import ValidateDisplayName from "../components/ValidateDisplayName";
import ValidateEmail from "../components/ValidateEmail";
import ValidateWebsite from "../components/ValidateWebsite";

type RegisterCreatorFormProps = {
  type: "artist" | "publisher";
};

const RegisterCreatorForm = ({ type }: RegisterCreatorFormProps) => {
  const alpineAttrs = {
    "x-data": "registerCreatorForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "register-form toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:email-availability.window":
      "emailIsTaken = !$event.detail.emailIsAvailable",
    "x-on:displayName-availability.window":
      "displayNameIsTaken = !$event.detail.displayNameIsAvailable",
    "x-on:website-availability.window":
      "websiteIsTaken = !$event.detail.websiteIsAvailable",
    "x-on:turnstile:success.window": "setCaptchaToken($event.detail.token)",
    "x-on:turnstile:expired.window": "clearCaptchaToken()",
  };

  return (
    <>
      <form
        action="/auth/register-creator"
        method="post"
        {...alpineAttrs}
        class="flex flex-col gap-2"
      >
        <ValidateDisplayName />
        <ValidateWebsite />
        <ValidateEmail />
        <Input
          type="password"
          label="Password"
          name="form.password"
          validateInput="validatePassword()"
          placeholder="••••••••"
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          name="form.confirmPassword"
          validateInput="validateConfirmPassword()"
          placeholder="••••••••"
          required
        />
        <div class="my-4">
          <Checkbox
            label="I agree to the terms and conditions"
            name="form.agreeToTerms"
            required
          />
        </div>
        <input
          type="hidden"
          name="type"
          value={type}
          x-init={`form.type = '${type}'`}
        />
        <input
          type="hidden"
          name="form.captchaToken"
          x-model="form.captchaToken"
        />
        <div
          class="cf-turnstile my-4"
          data-theme="light"
          data-size="flexible"
          data-sitekey={process.env.TURNSTILE_SITE_KEY}
          data-callback="onTurnstileSuccess"
          data-expired-callback="onTurnstileExpired"
        ></div>
        <FormButton buttonText="Create Account" loadingText="Submitting..." />
      </form>
      <p class="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link href="/auth/login">
          <span class="font-semibold">Sign In</span>
        </Link>
      </p>
    </>
  );
};

export default RegisterCreatorForm;
