import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";

const ClaimVerificationSuccess = ({ currentPath }: { currentPath: string }) => {
  return (
    <AppLayout title="Verification Successful" currentPath={currentPath}>
      <Page>
        <h2 class="font-display text-3xl font-medium text-on-surface-strong mb-4">✅ Verification Successful!</h2>
        <p>
          Your creator profile has been claimed successfully. You can now manage
          it from your dashboard.
        </p>
        <a
          href="/dashboard"
          class="mt-4 inline-block text-blue-600 underline"
        >
          Go to Dashboard
        </a>
      </Page>
    </AppLayout>
  );
};

export default ClaimVerificationSuccess;
