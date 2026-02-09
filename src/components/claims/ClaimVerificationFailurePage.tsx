import AppLayout from "../layouts/AppLayout";
import Page from "../layouts/Page";

type Props = {
  error?: string;
  verificationCode: string | null;
  verificationUrl: string | null;
};

const ClaimVerificationFailurePage = ({
  error,
  verificationCode,
  verificationUrl,
}: Props) => {
  return (
    <AppLayout title="Verification Failed">
      <Page>
        <div class="flex flex-col gap-4 items-center justify-center min-h-screen">
          <h2 class="text-2xl font-bold mb-4">❌ Verification Failed</h2>
          <p class="mb-2">{error || "Could not verify your website."}</p>
          <p class="text-sm text-gray-600 mb-4">
            Make sure you've added the code <strong>{verificationCode}</strong>{" "}
            to your website at {verificationUrl}
          </p>
          <p class="text-sm">Please try again in a few minutes.</p>
        </div>
      </Page>
    </AppLayout>
  );
};

export default ClaimVerificationFailurePage;
