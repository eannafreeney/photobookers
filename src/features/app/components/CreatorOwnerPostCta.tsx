import Banner from "../../../components/app/Banner";

type CreatorOwnerPostCtaProps = {
  creatorSlug: string;
  postCount: number;
};

const CreatorOwnerPostCta = ({
  creatorSlug,
  postCount,
}: CreatorOwnerPostCtaProps) => {
  const message =
    postCount === 0
      ? "Share fair dates, studio news, or work-in-progress with people who follow you."
      : "Keep your followers in the loop — share your latest news on your profile.";

  return (
    <div
      x-cloak
      x-data={`{ show: $persist(true).as('owner-post-cta-${creatorSlug}') }`}
      x-show="show"
    >
      <Banner type="info" message={message}>
        <div class="flex items-center gap-3">
          <a
            href="/dashboard/messages"
            class="shrink-0 text-sm font-medium text-accent hover:underline"
          >
            {postCount === 0 ? "Write your first post" : "Write a post"}
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

export default CreatorOwnerPostCta;
