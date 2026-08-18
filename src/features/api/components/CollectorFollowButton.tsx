import { AuthUser } from "../../../../types";
import { findUserFollow } from "../../../db/queries";
import { canFollowCollector } from "../collectorFollow";
import APIButton from "./APIButton";

type CollectorFollowButtonProps = {
  targetUserId: string;
  user: AuthUser | null;
};

const CollectorFollowButton = async ({
  targetUserId,
  user,
}: CollectorFollowButtonProps) => {
  let isFollowing = false;
  if (user?.id) {
    isFollowing = !!(await findUserFollow(targetUserId, user.id));
  }

  const isDisabled = !canFollowCollector(user?.id, targetUserId);
  const id = `collector-follow-${targetUserId}`;

  return (
    <APIButton
      id={id}
      action={`/api/users/${targetUserId}/follow`}
      isDisabled={isDisabled}
      isActive={isFollowing}
      hiddenInput={{ name: "isFollowing", value: isFollowing }}
      buttonText={
        <>
          <span x-show="!isSubmitting">
            {isFollowing ? "Following" : "Follow"}
          </span>
          <span x-show="isSubmitting" x-cloak>
            {isFollowing ? "Follow" : "Following"}
          </span>
          <span x-show={isFollowing ? "isSubmitting" : "!isSubmitting"} x-cloak>
            {followIcon}
          </span>
          <span x-show={isFollowing ? "!isSubmitting" : "isSubmitting"} x-cloak>
            {followingIcon}
          </span>
        </>
      }
    />
  );
};

export default CollectorFollowButton;

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
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);
