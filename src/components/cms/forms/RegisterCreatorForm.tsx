import Link from "../../app/Link";
import Checkbox from "../ui/Checkbox";
import FormButton from "../ui/FormButtons";
import Input from "../ui/Input";

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
  };

  return (
    <>
      <form action="/auth/register" method="post" {...alpineAttrs}>
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
          minLength={8}
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          name="form.confirmPassword"
          validateInput="validateConfirmPassword()"
          placeholder="••••••••"
          minLength={8}
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

export default RegisterCreatorForm;