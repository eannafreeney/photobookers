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
        </>
      }
    />
  );
};

export default CollectorFollowButton;
