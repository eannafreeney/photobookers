import SocialLinks from "../../../components/app/SocialLinks";
import FollowButton from "../../api/components/FollowButton";
import { Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";

type Props = {
  creator: Creator | null | undefined;
  role: string;
  user: AuthUser | null;
};

const SpotlightCreatorLink = async ({ creator, role, user }: Props) => {
  if (!creator) return <></>;

  return (
    <div class="flex items-center justify-between gap-3 border border-outline rounded-radius p-4">
      <a
        href={`/creators/${creator.slug}`}
        class="flex min-w-0 flex-1 items-center gap-3 transition-colors hover:opacity-80"
      >
        {creator.coverUrl ? (
          <img
            src={creator.coverUrl}
            alt={creator.displayName}
            class="size-12 shrink-0 rounded-full border border-outline object-cover"
          />
        ) : (
          <span
            class="flex size-12 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-alt text-sm font-semibold text-on-surface"
            aria-hidden="true"
          >
            {creator.displayName.charAt(0)}
          </span>
        )}
        <div class="min-w-0">
          <p class="text-xs font-medium text-on-surface">{role}</p>
          <p class="truncate text-sm font-semibold text-on-surface-strong">
            {creator.displayName}
          </p>
        </div>
      </a>

      <div class="flex shrink-0 items-center gap-2">
        <SocialLinks
          creator={creator}
          className="flex items-center gap-2 text-xs"
        />
        <FollowButton creator={creator} user={user} isCircleButton />
      </div>
    </div>
  );
};

export default SpotlightCreatorLink;
