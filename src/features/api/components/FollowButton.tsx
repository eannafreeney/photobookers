import { AuthUser } from "../../../../types";
import { Creator } from "../../../db/schema";
import { canFollowCreator } from "../../../lib/permissions";
import { findFollow } from "../services";
import APIButton from "./APIButton";
import APIButtonCircle from "./APIButtonCircle";

/**
 * Every place a follow control can appear. The variant is posted with the form
 * so `/api/creators/:id/follow` can render every variant back — any of them
 * present in the DOM stays in sync, even when one creator has two controls on
 * the page (e.g. the homepage hero and the trending strip below it).
 */
export const FOLLOW_BUTTON_VARIANTS = [
  "desktop",
  "mobile",
  "strip",
  "hero",
] as const;

export type FollowButtonVariant = (typeof FOLLOW_BUTTON_VARIANTS)[number];

export const parseFollowButtonVariant = (
  value: unknown,
): FollowButtonVariant =>
  FOLLOW_BUTTON_VARIANTS.includes(value as FollowButtonVariant)
    ? (value as FollowButtonVariant)
    : "desktop";

/** Shape is fixed by the variant so a response can rebuild it without the caller. */
export const isCircleFollowVariant = (variant: FollowButtonVariant) =>
  variant === "strip";

type FollowButtonProps = {
  creator: Pick<Creator, "id" | "displayName">;
  user: AuthUser | null;
  isCircleButton?: boolean;
  variant?: FollowButtonVariant;
  /** Pass when the caller already knows the follow state (avoids a query per card). */
  isFollowing?: boolean;
  shouldRefreshFollowedCreators?: boolean;
  shouldRefreshCreatorPosts?: boolean;
};

const FollowButton = async ({
  creator,
  user,
  isCircleButton = false,
  variant = "desktop",
  isFollowing: knownIsFollowing,
  shouldRefreshFollowedCreators = false,
  shouldRefreshCreatorPosts = false,
}: FollowButtonProps) => {
  // Only query if user is logged in and the caller hasn't resolved it already.
  let isFollowing = knownIsFollowing ?? false;
  if (knownIsFollowing === undefined && user?.id) {
    isFollowing = !!(await findFollow(creator.id, user.id));
  }

  const isCircle = isCircleButton || isCircleFollowVariant(variant);
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
    variant,
    action: `/api/creators/${creator.id}/follow`,
    disabled: isDisabled,
    tooltipText: isFollowing ? "Unfollow" : "Follow",
    hiddenInput: { name: "isFollowing", value: isFollowing },
    buttonText: isCircle ? (
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

  if (isCircle) {
    return (
      <APIButtonCircle
        {...props}
        buttonType="circle"
        isDisabled={isDisabled}
        isActive={isFollowing}
        shouldRefreshFollowedCreators={shouldRefreshFollowedCreators}
        shouldRefreshCreatorPosts={shouldRefreshCreatorPosts}
      />
    );
  }

  return (
    <APIButton
      {...props}
      isDisabled={isDisabled}
      isActive={isFollowing}
      shouldRefreshFollowedCreators={shouldRefreshFollowedCreators}
      shouldRefreshCreatorPosts={shouldRefreshCreatorPosts}
    />
  );
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
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);
