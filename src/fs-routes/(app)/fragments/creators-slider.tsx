import { createRoute } from "hono-fsr";
import { getTopCreatorsByViews } from "../../../features/creator-views/services";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider";
import SectionHeader from "../../../components/app/SectionHeader";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import Button from "../../../components/app/Button";
import { findFollowedCreatorIds } from "../../../db/queries";
import { getUser } from "../../../utils";

const TRENDING_CREATORS_LIMIT = 20;

export const GET = createRoute(async (c) => {
  const [[err, creators], user] = await Promise.all([
    getTopCreatorsByViews(TRENDING_CREATORS_LIMIT),
    getUser(c),
  ]);

  if (err || !creators || creators.length === 0) return c.html(<></>);

  const followedCreatorIds = user?.id
    ? await findFollowedCreatorIds(
        user.id,
        creators.map((creator) => creator.id),
      )
    : new Set<string>();

  return c.html(
    <div id="creators-slider-fragment">
      <SectionHeader kicker="The People" action={<ViewAllLink href="/creators" />}>
        Trending Creators
      </SectionHeader>
      <CreatorsSlider
        creators={creators}
        user={user}
        followedCreatorIds={followedCreatorIds}
        showFollow
      />
      <div class=" mt-8 flex md:hidden justify-center">
        <a href="/creators">
          <Button variant="solid" color="primary" width="xl">
            View All Creators →
          </Button>
        </a>
      </div>
    </div>,
  );
});
