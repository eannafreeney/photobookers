import { Creator } from "../../db/schema";
import APIButtonCircle from "../api/APIButtonCircle";
import APIButton from "../api/APIButton";
import { canClaimCreator } from "../../lib/permissions";
import { AuthUser } from "../../../types";
import { getPendingClaimByUserAndCreator } from "../../services/claims";

type ClaimCreatorBtnProps = {
  creator: Creator;
  isCircleButton?: boolean;
  user: AuthUser | null;
};

const ClaimCreatorBtn = async ({
  creator,
  isCircleButton = false,
  user,
}: ClaimCreatorBtnProps) => {
  const isStubAcc = creator.status === "stub";
  if (!isStubAcc) return <></>;

  const pendingClaim = await getPendingClaimByUserAndCreator(
    user?.id ?? "",
    creator.id,
  );

  const hasPendingClaim = pendingClaim !== null;

  const id = `claim-${creator.id}`;
  const isDisabled = !canClaimCreator(user, creator) || hasPendingClaim;
  const props = {
    id,
    action: `/claim/${creator.id}`,
    disabled: isDisabled,
    method: "get" as const as "get" | "post",
    tooltipText: "Claim Creator Profile",
    buttonText: isCircleButton ? claimIcon : "Claim",
  };

  if (isCircleButton) {
    return (
      <APIButtonCircle {...props} buttonType="circle" isDisabled={isDisabled} />
    );
  }

  return <APIButton {...props} isDisabled={isDisabled} />;
};

export default ClaimCreatorBtn;

const Button = ({
  isCircleButton,
  isDisabled = false,
}: {
  isCircleButton: boolean;
  isDisabled: boolean;
}) => {
  if (isCircleButton) {
    return (
      <button
        class="cursor-pointer disabled:opacity-50"
        disabled={isDisabled}
        title="Claim Creator Profile"
      >
        {claimIcon}
      </button>
    );
  }

  return (
    <button
      class="flex cursor-pointer items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50"
      disabled={isDisabled}
    >
      Clain
    </button>
  );
};

const claimIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
    />
  </svg>
);
