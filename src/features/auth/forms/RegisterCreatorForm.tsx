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
    "x-target.away": "_top",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:email-availability.window":
      "emailIsTaken = !$event.detail.emailIsAvailable",
    "x-on:displayName-availability.window":
      "displayNameIsTaken = !$event.detail.displayNameIsAvailable",
    "x-on:website-availability.window":
      "websiteIsTaken = !$event.detail.websiteIsAvailable",
  };

  return (
    <>
      <form action="/auth/register-creator" method="post" {...alpineAttrs}>
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
        <Checkbox
          label="I agree to the terms and conditions"
          name="form.agreeToTerms"
          required
        />
        <input
          type="hidden"
          name="type"
          value={type}
          x-init={`form.type = '${type}'`}
        />
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
