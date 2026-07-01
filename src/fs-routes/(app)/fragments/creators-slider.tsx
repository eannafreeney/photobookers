import { createRoute } from "hono-fsr";
import { getTopCreatorsByViews } from "../../../features/creator-views/services";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import Button from "../../../components/app/Button";

const TRENDING_CREATORS_LIMIT = 20;

export const GET = createRoute(async (c) => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);

  if (err || !creators || creators.length === 0) return c.html(<></>);

  return c.html(
    <div id="creators-slider-fragment">
      <div class="mb-6 border-t-2 border-on-surface-strong pt-3">
        <div class="mr-6 flex items-end justify-between">
          <SectionTitle className="mb-0" kicker="The People">
            Trending Creators
          </SectionTitle>
          <ViewAllLink href="/creators" />
        </div>
      </div>
      <CreatorsSlider creators={creators} />
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
