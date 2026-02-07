import AppLayout from "../layouts/AppLayout";
import Page from "../layouts/Page";

const ClaimVerificationSuccess = () => {
  return (
    <AppLayout title="Verification Successful">
      <Page>
        <h2 class="text-2xl font-bold mb-4">✅ Verification Successful!</h2>
        <p>
          Your creator profile has been claimed successfully. You can now manage
          it from your dashboard.
        </p>
        <a
          href="/dashboard/books"
          class="mt-4 inline-block text-blue-600 underline"
        >
          Go to Dashboard
        </a>
      </Page>
    </AppLayout>
  );
};
export default ClaimVerificationSuccess;
