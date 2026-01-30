import Form from "../../app/Form";
import Checkbox from "../ui/Checkbox";
import FormButton from "../ui/FormButton";
import Input from "../ui/Input";

type RegisterFormProps = {
  type: "fan" | "artist" | "publisher";
};

const RegisterForm = ({ type }: RegisterFormProps) => {
  return (
    <>
      <Form x-data="registerForm()" action="/auth/register">
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
      </Form>
      <div class="divider">OR</div>
      <p class="text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" class="link link-primary">
          Sign in
        </a>
      </p>
    </>
  );
};
export default RegisterForm;
