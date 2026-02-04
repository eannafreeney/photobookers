import { useUser } from "../../contexts/UserContext";
import { Creator } from "../../db/schema";
import { canFollowCreator } from "../../lib/permissions";
import FollowButton from "./FollowButton";
import VerifiedCreator from "./VerifiedCreator";

type CreatorCardProps = {
  creator: Creator | null;
};

const CreatorCardMobile = ({ creator }: CreatorCardProps) => {
  if (!creator) return <></>;

  const user = useUser();

  return (
    <div class="md:hidden">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 w-2/3">
          <img
            src={creator.coverUrl ?? ""}
            alt={creator.displayName}
            class="rounded-full w-10 h-10 object-cover"
          />
          <div>
            <a href={`/creators/${creator.slug}`} class="flex gap-2">
              {creator.displayName} {VerifiedCreator({ creator })}
            </a>
            <p class="text-gray-500 text-sm">
              {creator.city ? `${creator.city}, ` : ""}
              {creator.country}
            </p>
          </div>
        </div>
        <div class="w-1/3">
          <FollowButton
            creator={creator}
            user={user}
            variant="mobile"
          />
        </div>
      </div>
    </div>
  );
};

export default CreatorCardMobile;
