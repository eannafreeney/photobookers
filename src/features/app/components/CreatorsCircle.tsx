import Link from "../../../components/app/Link";
import VerificationBadge from "../../../components/app/VerificationBadge";
import { CreatorCardResult } from "../../../constants/queries";
import { truncate } from "../../../lib/utils";
import { getImageSizeClass } from "../utils";
import FollowButton from "../../api/components/FollowButton";
import { AuthUser } from "../../../../types";

type Props = {
  creator: CreatorCardResult;
  size?: number;
  showType?: boolean;
  /** Renders an inline follow control under the name (strip variant). */
  showFollow?: boolean;
  user?: AuthUser | null;
  /** Resolved by the caller in one batch query when `showFollow` is set. */
  isFollowing?: boolean;
};

const CreatorsCircle = ({
  creator,
  size = 32,
  showType = false,
  showFollow = false,
  user = null,
  isFollowing,
}: Props) => {
  if (!creator) return <></>;

  return (
    <div
      class={`flex flex-col items-center ${showFollow ? "gap-2" : "gap-4"}`}
    >
      <a href={`/creators/${creator.slug}`} key={creator.id ?? creator.slug}>
        <div class="relative inline-block">
          <img
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            title={creator.displayName ?? ""}
            class={`rounded-full object-cover ${getImageSizeClass(size)}`}
          />
          <div class="absolute top-0 right-3">
            <VerificationBadge creatorStatus={creator.status} size="sm" />
          </div>
        </div>
        <div class="flex flex-col items-center gap-1">
          <Link href={`/creators/${creator.slug}`}>
            <span class="text-sm font-medium">
              {truncate(creator.displayName ?? "", 20)}
            </span>
          </Link>
          {showType ? (
            <span class="kicker text-on-surface-weak text-xs capitalize">
              {creator.type}
            </span>
          ) : null}
        </div>
      </a>
      {showFollow ? (
        <FollowButton
          creator={creator}
          user={user}
          variant="strip"
          isFollowing={isFollowing}
        />
      ) : null}
    </div>
  );
};

export default CreatorsCircle;
