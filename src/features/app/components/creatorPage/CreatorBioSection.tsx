import ExpandableDescription from "../ExpandableDescription";
import CreatorBioMeta from "./CreatorBioMeta";
import { Creator } from "@/db/schema";
import { findFollowersCount } from "@/db/queries";

type Props = {
  creator: Creator;
  maxWords?: number;
};

const CreatorBioSection = async ({ creator, maxWords = 75 }: Props) => {
  const followerCount = await findFollowersCount(creator.id);
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 0;
  const hasSocials = !!(
    creator.website ||
    creator.facebook ||
    creator.instagram ||
    creator.twitter
  );
  const hasMeta = hasLocation || hasFollowers || hasSocials;
  const bio = creator.bio?.trim() || null;

  if (!bio) {
    if (!hasMeta) return <></>;
    return (
      <div class="flex justify-center">
        <CreatorBioMeta
          creator={creator}
          variant="inline"
          followerCount={followerCount}
        />
      </div>
    );
  }

  if (!hasMeta) {
    return <ExpandableDescription text={bio} maxWords={maxWords} />;
  }

  return (
    <div class="flex gap-6">
      <div class="w-4/5 min-w-0">
        <ExpandableDescription text={bio} maxWords={maxWords} />
      </div>
      <div class="flex w-1/5 flex-col items-end text-right">
        <CreatorBioMeta
          creator={creator}
          variant="stacked"
          align="right"
          followerCount={followerCount}
        />
      </div>
    </div>
  );
};

export default CreatorBioSection;
