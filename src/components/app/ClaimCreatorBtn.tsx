import { Creator } from "../../db/schema";
import { useUser } from "../../contexts/UserContext";
import clsx from "clsx";
import { AuthUser } from "../../../types";

type ClaimCreatorBtnProps = {
  creator: Creator;
  currentPath?: string;
  user?: AuthUser;
  isDisabled?: boolean;
};

const ClaimCreatorBtn = ({
  creator,
  currentPath,
  user,
  isDisabled,
}: ClaimCreatorBtnProps) => {
  const isStubAcc = creator.status === "stub";
  if (!isStubAcc) return <></>;

  const id = `claim-${creator.id}`;

  const alpineAttrs = {
    "x-target": `${id} modal-root`,
    "x-target.error": "modal-root",
    "x-on:ajax:after": "$dispatch('dialog:open')",
  };

  return (
    <form
      id={id}
      method="get"
      action={`/claim/${creator.id}`}
      class={clsx(
        "whitespace-nowrap rounded-radius border px-4 py-2 text-sm font-medium",
        "tracking-wide transition hover:opacity-75 text-center bg-transparent",
        "w-full text-secondary border border-secondary"
      )}
      {...alpineAttrs}
    >
      <input type="hidden" name="currentPath" value={currentPath} />
      <button
        class="flex cursor-pointer items-center justify-center gap-2 hover:cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDisabled}
      >
        Claim Profile
      </button>
    </form>
  );
};

export default ClaimCreatorBtn;
