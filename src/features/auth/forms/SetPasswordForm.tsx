import FormButtons from "../../../components/forms/FormButtons";
import Input from "../../../components/forms/Input";

type SetPasswordFormProps = {
  buttonText?: string;
  loadingText?: string;
  redirectUrl?: string | null;
};

const SetPasswordForm = ({
  buttonText = "Set Password",
  loadingText = "Setting...",
  redirectUrl = null,
}: SetPasswordFormProps) => {
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
      {redirectUrl && redirectUrl !== "/" ? (
        <input type="hidden" name="redirectUrl" value={redirectUrl} />
      ) : null}
      <FormButtons buttonText={buttonText} loadingText={loadingText} />
      <div class="h-4">
        <p
          x-show="errors.globalError"
          class="text-red-500"
          x-text="errors.globalError"
        />
      </div>
    </>
  );
};
export default SetPasswordForm;
