import HeadlessLayout from "../../components/layouts/HeadlessLayout";
import ResendVerificationForm from "../../components/cms/forms/ResendVerificationForm";

const ResendVerificationPage = () => {
  return (
    <HeadlessLayout title="Resend verification email">
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-96 bg-base-100 shadow-none border-none my-4">
          <div class="card-body">
            <h2 class="text-2xl font-bold text-center mb-2">
              Resend verification email
            </h2>
            <p class="text-sm text-center text-base-content/70 mb-4">
              Enter your email and we’ll send you a new verification link.
            </p>
            <ResendVerificationForm />
          </div>
        </div>
      </div>
    </HeadlessLayout>
  );
};

export default ResendVerificationPage;
