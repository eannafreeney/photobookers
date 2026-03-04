import FormButtons from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";

const SetPasswordForm = () => {
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
      <FormButtons buttonText="Set Password" loadingText="Setting..." />
      <div class="h-4 w-full text-left">
        <p
          x-show="errors.globalError"
          class="text-red-500 text-left"
          x-text="errors.globalError"
        />
      </div>
    </>
  );
};
export default SetPasswordForm;
