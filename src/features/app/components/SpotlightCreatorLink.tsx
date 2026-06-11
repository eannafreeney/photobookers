import SocialLinks from "../../../components/app/SocialLinks";
import FollowButton from "../../api/components/FollowButton";
import { Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";

type Props = {
  creator: Creator | null | undefined;
  role: string;
};

const SpotlightCreatorLink = async ({ creator, role }: Props) => {
  if (!creator) return <></>;

  return (
    <div class="flex items-center justify-between gap-3 border border-outline rounded-radius p-4">
      <div class="flex items-center gap-3">
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
      </div>

      <a href={`/creators/${creator.slug}`}>
        <Button variant="outline" color="primary" width="full">
          Visit
        </Button>
      </a>
    </div>
  );
};

export default SpotlightCreatorLink;
