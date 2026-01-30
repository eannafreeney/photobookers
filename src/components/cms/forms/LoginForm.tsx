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

  return (
    <>
      <form
        action={`/auth/login?redirectUrl=${redirectUrl}`}
        method="POST"
        {...alpineAttrs}
      >
        <Input
          label="Email"
          name="form.email"
          validateInput="validateField('email')"
          type="email"
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          name="form.password"
          validateInput="validateField('password')"
          type="password"
          placeholder="••••••••"
          required
        />
        <FormButton buttonText="Log In" loadingText="Logging in..." />
      </form>

      <div class="divider">OR</div>

      <p class="text-center text-sm">
        Don't have an account? <Link href="/auth/accounts">Register</Link>
      </p>
    </>
  );
};

export default LoginForm;
