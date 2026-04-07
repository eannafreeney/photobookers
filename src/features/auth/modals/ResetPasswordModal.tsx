import Modal from "../../../components/app/Modal";
import ResetPasswordForm from "../forms/SetPasswordForm";

const ResetPasswordModal = () => {
  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    "x-target": "toast",
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "$dispatch('dialog:close')",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <Modal title="Reset Password">
      <form
        action="/auth/reset-password"
        method="post"
        {...alpineAttrs}
        class="flex flex-col gap-4"
      >
        <input type="hidden" name="isModal" value="true" />
        <ResetPasswordForm
          buttonText="Reset Password"
          loadingText="Resetting..."
        />
      </form>
    </Modal>
  );
};
export default ResetPasswordModal;
