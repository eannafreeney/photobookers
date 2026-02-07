import { findFollow } from "../../db/queries";
import APIButton from "./APIButton";
import { AuthUser } from "../../../types";
import APIButtonCircle from "./APIButtonCircle";
import { canFollowCreator } from "../../lib/permissions";
import { Creator } from "../../db/schema";

type FollowButtonProps = {
  creator: Pick<Creator, "id" | "displayName">;
  user: AuthUser | null;
  isCircleButton?: boolean;
  variant?: "desktop" | "mobile";
};

const FollowButton = async ({
  creator,
  user,
  isCircleButton = false,
  variant = "desktop",
}: FollowButtonProps) => {
  const userIsCreator = user?.creator?.id === creator.id;

  // Only query if user is logged in, otherwise default to false
  let isFollowing = false;
  if (user?.id) {
    isFollowing = !!(await findFollow(creator.id, user.id));
  }

  const id = `follow-${creator.id}-${variant}`;
  const isDisabled = !canFollowCreator(user, creator);
  const buttonIcon = (
    <>
      {/* Show empty icon when: not following OR (following AND submitting) */}
      <span x-show={isFollowing ? "isSubmitting" : "!isSubmitting"} x-cloak>
        {followIcon}
      </span>
      {/* Show full icon when: following OR (!following AND submitting) */}
      <span x-show={isFollowing ? "!isSubmitting" : "isSubmitting"} x-cloak>
        {followingIcon}
      </span>
    </>
  );

  const props = {
    id,
    action: `/api/follow/creator/${creator.id}`,
    disabled: userIsCreator,
    tooltipText: isFollowing ? "Unfollow" : "Follow",
    hiddenInput: { name: "isFollowing", value: isFollowing },
    buttonText: isCircleButton ? (
      buttonIcon
    ) : (
      <>
        <span x-show="!isSubmitting">
          {isFollowing ? "Following" : "Follow"}
        </span>
        <span x-show="isSubmitting" x-cloak>
          {isFollowing ? "Follow" : "Following"}
        </span>
        {buttonIcon}
      </>
    ),
  };

  if (isCircleButton) {
    return (
      <APIButtonCircle {...props} buttonType="circle" isDisabled={isDisabled} />
    );
  }

  return <APIButton {...props} isDisabled={isDisabled} />;
};

export default FollowButton;

const followIcon = (
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
      d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
    />
  </svg>
);

const followingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-4 text-green-500"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);
