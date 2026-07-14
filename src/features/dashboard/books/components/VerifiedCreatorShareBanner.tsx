import Banner from "../../../../components/app/Banner";
import CopyCellCol from "../../../../components/app/CopyCellCol";
import { Creator } from "../../../../db/schema";
import {
  creatorProfileUrl,
  creatorVerifiedSharePost,
} from "../../../../lib/share";

type Props = {
  creator: Pick<Creator, "displayName" | "slug" | "type">;
};

const VerifiedCreatorShareBanner = ({ creator }: Props) => {
  const sharePost = creatorVerifiedSharePost(creator);
  const profileUrl = creatorProfileUrl(creator.slug);

  return (
    <div
      x-cloak
      x-data={`{ show: $persist(true).as('verified-share-${creator.slug}') }`}
      x-show="show"
    >
      <Banner
        type="success"
        message="You're verified! Share your profile so fans can find you."
      >
        <div class="flex flex-col items-center gap-3 sm:flex-row">
          <CopyCellCol entity={sharePost} buttonWidth="auto" />
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm underline decoration-accent underline-offset-4"
          >
            View profile
          </a>
          <button
            type="button"
            x-on:click="show = false"
            class="text-sm cursor-pointer hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      </Banner>
    </div>
  );
};

export default VerifiedCreatorShareBanner;
