import Link from "../../../components/app/Link";
import FormButton from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";

const ForgotPasswordForm = () => {
  const alpineAttrs = {
    "x-data": "forgotPasswordForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "forgot-password-form toast",
    "x-target.error": "toast",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <>
      <form
        id="forgot-password-form"
        action="/auth/forgot-password"
        method="post"
        {...alpineAttrs}
        class="flex flex-col gap-2"
      >
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
          buttonText="Send reset link"
          loadingText="Sending..."
        />
      </form>
      <p class="text-center text-sm mt-4">
        Remember your password?{" "}
        <Link href="/auth/login">
          <span class="font-semibold">Back to sign in</span>
        </Link>
      </p>
    </>
  );
};

export default ForgotPasswordForm;
