import { Creator } from "../../db/schema";
import { useUser } from "../../contexts/UserContext";
import clsx from "clsx";
import { AuthUser } from "../../../types";

type ClaimCreatorBtnProps = {
  creator: Creator;
  currentPath?: string;
  user?: AuthUser;
};

const ClaimCreatorBtn = ({
  creator,
  currentPath,
  user,
}: ClaimCreatorBtnProps) => {
  const userIsCreatorOwner = creator?.ownerUserId === user?.id;
  const creatorIsStub = creator?.status === "stub";
  const userIsAlreadyACreator = user?.creator?.id;

  // if (userIsCreatorOwner || creatorIsStub || userIsAlreadyACreator) {
  //   return <></>;
  // }

  const id = `claim-${creator.id}`;

  const attrs = {
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
      {...attrs}
    >
      <input type="hidden" name="currentPath" value={currentPath} />
      <button
        type="submit"
        class="flex items-center justify-center gap-2 hover:cursor-pointer w-full"
      >
        Claim Creator
      </button>
    </form>
  );
};

export default ClaimCreatorBtn;
