import Link from "../../app/Link";
import FormButton from "../ui/FormButtons";
import Input from "../ui/Input";

const ResendVerificationForm = () => {
  const alpineAttrs = {
    "x-data": "loginForm()",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <>
      <form action="/auth/resend-verification" method="post" {...alpineAttrs}>
        <Input
          label="Email"
          name="form.email"
          validateInput="validateField('email')"
          type="email"
          placeholder="you@example.com"
          validationTrigger="blur"
          required
        />
        <FormButton
          buttonText="Send verification email"
          loadingText="Sending..."
        />
      </form>
      <p class="text-center text-sm mt-4">
        Remember your password?{" "}
        <Link href="/auth/login">
          <span class="font-semibold">Sign in</span>
        </Link>
      </p>
    </>
  );
};

export default ResendVerificationForm;
