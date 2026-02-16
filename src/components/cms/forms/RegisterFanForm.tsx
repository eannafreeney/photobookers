import Link from "../../app/Link";
import Checkbox from "../ui/Checkbox";
import FormButton from "../ui/FormButtons";
import Input from "../ui/Input";

const RegisterFanForm = () => {
  const alpineAttrs = {
    "x-data": "registerFanForm()",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <>
      <form action="/auth/register-fan" method="post" {...alpineAttrs}>
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
        <Input
          type="email"
          label="Email"
          name="form.email"
          validateInput="validateEmail()"
          placeholder="you@example.com"
          validationTrigger="blur"
          showEmailAvailabilityChecker
          required
        />
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
          <span class="font-bold">Sign In</span>
        </Link>
      </p>
    </>
  );
};

export default RegisterFanForm;
