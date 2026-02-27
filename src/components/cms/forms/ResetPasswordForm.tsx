import FormButtons from "../ui/FormButtons";
import Input from "../ui/Input";

const ResetPasswordForm = () => {
  return (
    <>
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
      <FormButtons buttonText="Reset Password" loadingText="Resetting..." />
      <div class="h-2">
        <p
          x-show="errors.globalError"
          class="text-red-500"
          x-text="errors.globalError"
        />
      </div>
    </>
  );
};
export default ResetPasswordForm;
