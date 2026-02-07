import { useUser } from "../../contexts/UserContext";
import { Book, Creator } from "../../db/schema";
import { canFollowCreator } from "../../lib/permissions";
import CardCreatorCard from "./CardCreatorCard";
import FollowButton from "../api/FollowButton";
import VerifiedCreator from "./VerifiedCreator";

type CreatorCardProps = {
  creator: Creator | null;
  book: Book;
};

const CreatorCardMobile = ({
  creator,
  book,
  creatorType,
}: CreatorCardProps) => {
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
              {creator.displayName}
            </a>
            <p class="text-gray-500 text-sm flex items-center gap-2">
              {creator.city ? `${creator.city}, ` : ""}
              {creator.country}
              {VerifiedCreator({ creator })}
            </p>
          </div>
        </div>
        <div class="w-1/3 flex justify-end">
          <FollowButton
            creator={creator}
            user={user}
            variant="mobile"
            isCircleButton
          />
        </div>
      </div>
    </div>
  );
};

export default CreatorCardMobile;
