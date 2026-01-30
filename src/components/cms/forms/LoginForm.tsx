import Form from "../../app/Form";
import Link from "../../app/Link";
import FormButton from "../ui/FormButton";
import Input from "../ui/Input";

const LoginForm = ({ redirectUrl }: { redirectUrl?: string | null }) => {
  return (
    <>
      <Form
        x-data="loginForm()"
        action={`/auth/login?redirectUrl=${redirectUrl}`}
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
        <FormButton buttonText="Log In" loadingText="Submitting..." />
      </Form>

      <div class="divider">OR</div>

      <p class="text-center text-sm">
        Don't have an account? <Link href="/auth/accounts">Register</Link>
      </p>
    </>
  );
};

export default LoginForm;
