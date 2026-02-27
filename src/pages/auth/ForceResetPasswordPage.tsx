import Page from "../../components/layouts/Page";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import ResetPasswordForm from "../../components/cms/forms/ResetPasswordForm";
import { AuthUser } from "../../../types";

type Props = {
  user: AuthUser;
};

const ForceResetPasswordPage = ({ user }: Props) => {
  const alpineAttrs = {
    "x-data": "resetPasswordForm()",
    "x-on:submit": "submitForm($event)",
    "x-target": "toast",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
  };
  return (
    <HeadlessLayout title="Force Reset Password">
      <Page>
        <div class="min-h-screen flex items-center justify-center bg-base-200">
          <div class="card w-96 bg-base-100 shadow-none border-none my-4">
            <div class="card-body">
              <div class="text-2xl font-bold text-center mb-4">
                Hi {user?.firstName ?? "there"}!
              </div>
              <div class="text-sm text-center mb-4">
                Please enter your new password below.
              </div>
              <form
                action="/auth/reset-password"
                method="post"
                {...alpineAttrs}
              >
                <ResetPasswordForm />
              </form>
            </div>
          </div>
        </div>
      </Page>
    </HeadlessLayout>
  );
};
export default ForceResetPasswordPage;
