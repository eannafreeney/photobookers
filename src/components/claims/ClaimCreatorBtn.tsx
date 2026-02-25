import { Creator } from "../../db/schema";
import APIButton from "../api/APIButton";
import { canClaimCreator } from "../../lib/permissions";
import { AuthUser } from "../../../types";
import { getPendingClaimByUserAndCreator } from "../../services/claims";

type ClaimCreatorBtnProps = {
  creator: Creator;
  user: AuthUser | null;
};

const ClaimCreatorBtn = async ({ creator, user }: ClaimCreatorBtnProps) => {
  const isStubAcc = creator.status === "stub";
  const hasCreatorAccount = user?.creator?.id;
  const isAdmin = user?.isAdmin;
  if (!isStubAcc || hasCreatorAccount || isAdmin) return <></>;

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
    buttonText: "Claim",
  };

  return <APIButton {...props} isDisabled={isDisabled} />;
};

export default ClaimCreatorBtn;
