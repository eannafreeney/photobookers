import { createRoute } from "hono-fsr";
import { getTopCreatorsByViews } from "../../../features/book-views/services";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider";
import SectionTitle from "../../../components/app/SectionTitle";

const TRENDING_CREATORS_LIMIT = 10;

export const GET = createRoute(async (c) => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);

  if (err || !creators || creators.length === 0) return c.html(<></>);

  return c.html(
    <div id="creators-slider-fragment" class="mt-2 mb-4">
      <div class="border-t-2 border-on-surface-strong pt-3 mb-3 mt-10">
        <SectionTitle className="mb-0" kicker="The People">
          Trending Creators
        </SectionTitle>
      </div>
      <CreatorsSlider creators={creators} />
    </div>,
  );
});
