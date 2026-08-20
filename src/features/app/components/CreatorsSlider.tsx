import { CreatorCardResult } from "../../../constants/queries";
import CreatorsCircle from "./CreatorsCircle";
import { AuthUser } from "../../../../types";

type PublishersSliderProps = {
  creators: CreatorCardResult[];
  user?: AuthUser | null;
  /** Creator ids the current user already follows, resolved in one query. */
  followedCreatorIds?: Set<string>;
  showFollow?: boolean;
};

const CreatorsSlider = async ({
  creators,
  user = null,
  followedCreatorIds,
  showFollow = false,
}: PublishersSliderProps) => {
  return (
    <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div class="flex w-max items-start gap-3 pt-1">
        {creators.map((creator) => (
          <CreatorsCircle
            key={creator.id}
            creator={creator}
            size={24}
            showFollow={showFollow}
            user={user}
            isFollowing={followedCreatorIds?.has(creator.id) ?? false}
          />
        ))}
      </div>
    </div>
  );
};

export default CreatorsSlider;
