import Link from "../../app/Link";
import FormButton from "../ui/FormButtons";
import Input from "../ui/Input";

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
        <Input
          label="Email"
          name="form.email"
          validateInput="validateField('email')"
          type="email"
          placeholder="you@example.com"
          validationTrigger="blur"
          required
        />
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
