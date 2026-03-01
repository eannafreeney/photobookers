import Modal from "../../../components/app/Modal";
import ResetPasswordForm from "../forms/ResetPasswordForm";

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
      <form action="/auth/reset-password" method="post" {...alpineAttrs}>
        <ResetPasswordForm />
      </form>
    </Modal>
  );
};
export default ResetPasswordModal;
