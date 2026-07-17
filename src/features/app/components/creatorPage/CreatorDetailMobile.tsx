import CreatorDetailTabs, { CreatorDetailViewProps } from "./CreatorDetailTab";
import FollowButton from "../../../api/components/FollowButton";
import ShareButton from "../../../api/components/ShareButton";
import CreatorOwnerPostCta from "../CreatorOwnerPostCta";
import CreatorPageBanner from "./CreatorPageBanner";
import { creatorUrl } from "../../spotlightUrls";
import { creatorShareText } from "../../../../lib/share";
import MobileHeader from "../MobileHeader";

const CreatorDetailMobile = (props: CreatorDetailViewProps) => {
  const { creator, user, isOwner, postCount } = props;

  return (
    <>
      <CreatorPageBanner
        bannerUrl={creator.bannerUrl}
        displayName={creator.displayName}
      />
      <div class="flex flex-col gap-4">
        <MobileHeader
          kicker={creator.type === "publisher" ? "Publisher" : "Artist"}
          title={creator.displayName ?? undefined}
        >
          <div class="flex justify-between items-center gap-2">
            {!isOwner && (
              <FollowButton creator={creator} variant="mobile" user={user} />
            )}
            <ShareButton
              title={creator.displayName}
              text={creatorShareText(creator)}
              url={creatorUrl(creator.slug)}
            />
          </div>
        </MobileHeader>

        {isOwner && (
          <CreatorOwnerPostCta
            creatorSlug={creator.slug}
            postCount={postCount}
          />
        )}

        <CreatorDetailTabs isMobile {...props} />
      </div>
    </>
  );
};

export default CreatorDetailMobile;
