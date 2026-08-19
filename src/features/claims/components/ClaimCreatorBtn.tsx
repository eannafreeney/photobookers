import clsx from "clsx";
import Link from "../../../components/app/Link";
import { Creator } from "../../../db/schema";
import { canClaimCreator } from "../../../lib/permissions";
import { AuthUser } from "../../../../types";
import { getPendingClaim } from "../services";

type Props = {
  creator: Creator;
  user: AuthUser | null;
  currentPath?: string;
};

const claimButtonClass = (isDisabled: boolean) =>
  clsx(
    "whitespace-nowrap w-full rounded-radius border px-4 py-2 text-sm font-medium tracking-wide transition hover:opacity-75 text-center block",
    "bg-transparent text-secondary border-secondary",
    isDisabled && "border-secondary/50 opacity-50 pointer-events-none",
  );

const ClaimCreatorBtn = async ({ creator, user, currentPath }: Props) => {
  const isStubAcc = creator.status === "stub";
  const hasCreatorAccount = user?.creator?.id;
  const isAdmin = user?.isAdmin;
  if (!isStubAcc || hasCreatorAccount || isAdmin) return <></>;

  const [_, pendingClaim] = await getPendingClaim(user?.id ?? "", creator.id);
  const hasPendingClaim = user != null && pendingClaim !== null;

  const isDisabled = !canClaimCreator(user, creator) || hasPendingClaim;
  const claimHref = currentPath
    ? `/claims/${creator.id}/start?currentPath=${encodeURIComponent(currentPath)}`
    : `/claims/${creator.id}/start`;

  if (isDisabled) {
    return (
      <span class={claimButtonClass(true)} aria-disabled="true">
        Claim profile
      </span>
    );
  }

  return (
    <Link href={claimHref} className={claimButtonClass(false)}>
      Claim profile
    </Link>
  );
};

export default ClaimCreatorBtn;
