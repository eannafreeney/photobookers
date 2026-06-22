import Banner from "../../../components/app/Banner";
import Button from "../../../components/app/Button";
import FormPost from "../../../components/forms/FormPost";
import { CreatorClaimStatus, CreatorStatus } from "../../../db/schema";

type Props = {
  claimStatus: CreatorClaimStatus | null;
  creatorStatus: CreatorStatus | null;
};

const VerificationStatusBanner = ({
  claimStatus,
  creatorStatus,
}: Props) => {
  if (creatorStatus === "verified") return <></>;

  if (claimStatus === "pending_admin_review") {
    return (
      <Banner
        type="info"
        message="Your creator profile is pending admin review. You can edit books, but publishing is disabled until admin review."
      />
    );
  }

  return (
    <Banner
      type="info"
      message="Your creator profile is pending verification. You can edit books, but publishing is disabled until verification."
    >
      <FormPost action="/auth/resend-verification" x-target="toast">
        <Button variant="solid" color="warning">
          Resend verification email
        </Button>
      </FormPost>
    </Banner>
  );
};

export default VerificationStatusBanner;
