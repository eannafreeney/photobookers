import { findFollow } from "../../db/queries";
import APIButton from "./APIButton";
import { AuthUser } from "../../../types";
import APIButtonCircle from "./APIButtonCircle";

type FollowButtonProps = {
  creatorId: string;
  user: AuthUser | null;
  isCircleButton?: boolean;
  isDisabled?: boolean;
  variant?: "desktop" | "mobile";
};

const FollowButton = async ({
  creatorId,
  user,
  isCircleButton = false,
  isDisabled = false,
  variant = "desktop",
}: FollowButtonProps) => {
  const userIsCreator = user?.creator?.id === creatorId;

  // Only query if user is logged in, otherwise default to false
  let isFollowing = false;
  if (user?.id) {
    isFollowing = !!(await findFollow(creatorId, user.id));
  }

  const id = `follow-${creatorId}-${variant}`;
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
    xTarget: id,
    action: `/api/follow/creator/${creatorId}`,
    disabled: userIsCreator,
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
      d="M12 4.5v15m7.5-7.5h-15"
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
