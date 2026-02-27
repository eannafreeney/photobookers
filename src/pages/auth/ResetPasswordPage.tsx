import Page from "../../components/layouts/Page";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import { AuthUser } from "../../../types";
import ResetPasswordForm from "../../components/cms/forms/ResetPasswordForm";

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
              <h2 class="text-2xl font-bold text-center mb-4">
                Reset Password
              </h2>
              <form
                action={`/auth/reset-password/${user.id}`}
                method="post"
                {...alpineAttrs}
              >
                <ResetPasswordForm  />
              </form>
            </div>
          </div>
        </div>
      </Page>
    </HeadlessLayout>
  );
};
export default ForceResetPasswordPage;
