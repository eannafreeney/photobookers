import Link from "../../../components/app/Link";
import FormButton from "../../../components/cms/ui/FormButtons";
import Input from "../../../components/cms/ui/Input";
import ValidateEmail from "../components/ValidateEmail";

const LoginForm = ({ redirectUrl }: { redirectUrl?: string | null }) => {
  const alpineAttrs = {
    "x-data": "loginForm()",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-target": "toast",
    "x-on:ajax:error": "isSubmitting = false",
  };

  const action = redirectUrl
    ? `/auth/login?redirectUrl=${redirectUrl}`
    : `/auth/login`;

  return (
    <>
      <form action={action} method="post" {...alpineAttrs}>
        <ValidateEmail />
        <Input
          label="Password"
          name="form.password"
          validateInput="validateField('password')"
          type="password"
          placeholder="••••••••"
          validationTrigger="blur"
          required
        />
        <FormButton buttonText="Log In" loadingText="Logging in..." />
      </form>
      <p class="text-center text-sm mt-4">
        Don't have an account?{" "}
        <Link href="/auth/accounts">
          <span class="font-semibold">Register</span>
        </Link>
      </p>
      <p class="text-center text-sm mt-2">
        <Link href="/auth/resend-verification">Resend verification email</Link>
      </p>
    </>
  );
};

export default LoginForm;
