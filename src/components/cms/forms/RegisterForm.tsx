import Link from "../../app/Link";
import Checkbox from "../ui/Checkbox";
import FormButton from "../ui/FormButtons";
import Input from "../ui/Input";

type RegisterFormProps = {
  type: "fan" | "artist" | "publisher";
};

const RegisterForm = ({ type }: RegisterFormProps) => {
  const alpineAttrs = {
    "x-data": "registerForm()",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <>
      <form action="/auth/register" method="POST" {...alpineAttrs}>
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
          showFieldValidator
          required
        />
        <Input
          type="password"
          label="Password"
          name="form.password"
          validateInput="validatePassword()"
          placeholder="••••••••"
          minLength={6}
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          name="form.confirmPassword"
          validateInput="validateConfirmPassword()"
          placeholder="••••••••"
          minLength={6}
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
          <span class="font-bold">Sign In</span>
        </Link>
      </p>
    </>
  );
};
export default RegisterForm;
