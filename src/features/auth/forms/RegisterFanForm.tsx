import Link from "../../../components/app/Link";
import Checkbox from "../../../components/forms/Checkbox";
import FormButton from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";
import ValidateEmail from "../components/ValidateEmail";

type Props = {
  redirectUrl?: string;
};

const RegisterFanForm = ({ redirectUrl }: Props) => {
  const alpineAttrs = {
    "x-data": "registerFanForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
    "x-on:email-availability.window":
      "emailIsTaken = !$event.detail.emailIsAvailable",
  };

  const action = redirectUrl
    ? `/auth/register-fan?redirectUrl=${redirectUrl}`
    : "/auth/register-fan";

  return (
    <>
      <form action={action} method="post" {...alpineAttrs}>
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
        <Checkbox
          label="I agree to the terms and conditions"
          name="form.agreeToTerms"
          required
        />
        <input
          type="hidden"
          name="type"
          value="fan"
          x-init="form.type = 'fan'"
        />
        <FormButton buttonText="Create Account" loadingText="Submitting..." />
        <p
          x-show="errors.globalError"
          class="text-red-500"
          x-text="errors.globalError"
        ></p>
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

export default RegisterFanForm;
