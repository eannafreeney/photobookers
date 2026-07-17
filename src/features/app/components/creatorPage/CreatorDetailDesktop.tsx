import FollowButton from "../../../api/components/FollowButton";
import ShareButton from "../../../api/components/ShareButton";
import CreatorOwnerPostCta from "../CreatorOwnerPostCta";
import CreatorPageBanner from "./CreatorPageBanner";
import { creatorUrl } from "../../spotlightUrls";
import { creatorShareText } from "../../../../lib/share";
import ClaimCreatorBtn from "../../../claims/components/ClaimCreatorBtn";
import CreatorDetailTabs, { CreatorDetailViewProps } from "./CreatorDetailTab";
import CreatorAvatar from "./CreatorAvatar";
import CreatorBioSection from "./CreatorBioSection";

const CreatorDetailDesktop = (props: CreatorDetailViewProps) => {
  const { creator, user, isOwner, postCount, currentPath } = props;

  return (
    <div class="flex flex-col gap-4">
      <CreatorPageBanner
        bannerUrl={creator.bannerUrl}
        displayName={creator.displayName}
      />
      <div class="flex justify-between border-b-2 border-on-surface-strong pb-4">
        <div class="flex items-center gap-4">
          <CreatorAvatar creator={creator} />
          <h1 class="text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-6xl">
            {creator.displayName}
          </h1>
        </div>
        <div class="flex flex-col items-end justify-end gap-3">
          <div class={`grid gap-4 ${isOwner ? "grid-cols-1" : "grid-cols-2"}`}>
            {!isOwner && (
              <FollowButton
                creator={creator}
                user={user}
                shouldRefreshCreatorMessages
              />
            )}
            <ShareButton
              title={creator.displayName}
              text={creatorShareText(creator)}
              url={creatorUrl(creator.slug)}
            />
          </div>
          <ClaimCreatorBtn
            creator={creator}
            user={user}
            currentPath={currentPath}
          />
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <CreatorBioSection creator={creator} />
        {isOwner && (
          <CreatorOwnerPostCta
            creatorSlug={creator.slug}
            postCount={postCount}
          />
        )}
        <CreatorDetailTabs {...props} />
      </div>
    </div>
  );
};

export default CreatorDetailDesktop;
