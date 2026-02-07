import AppLayout from "../layouts/AppLayout";
import Page from "../layouts/Page";

type Props = {
  error?: string;
  verificationCode: string | null;
  verificationUrl: string | null;
  creatorId: string | null;
};

const ClaimVerificationFailure = ({
  error,
  verificationCode,
  verificationUrl,
  creatorId,
}: Props) => {
  return (
    <AppLayout title="Verification Failed">
      <Page>
        <h2 class="text-2xl font-bold mb-4">❌ Verification Failed</h2>
        <p class="mb-2">{error || "Could not verify your website."}</p>
        <p class="text-sm text-gray-600 mb-4">
          Make sure you've added the code <strong>{verificationCode}</strong> to
          your website at {verificationUrl}
        </p>
        <p class="text-sm">
          <a href={`/claim/${creatorId}`} class="text-blue-600 underline">
            Try again
          </a>
        </p>
      </Page>
    </AppLayout>
  );
};

export default ClaimVerificationFailure;
