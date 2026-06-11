import { createRoute } from "hono-fsr";
import { getVerifiedCreators } from "../../../features/app/services";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import SectionTitle from "../../../components/app/SectionTitle";

export const GET = createRoute(async (c) => {
  const [err, creators] = await getVerifiedCreators();

  if (err || !creators || creators.length === 0) return c.html(<></>);

  return c.html(
    <div id="creators-slider-fragment" class="mt-2 mb-4 px-4">
      <div class="border-t-2 border-on-surface-strong pt-3 mb-3 mt-10">
        <SectionTitle className="mb-0" kicker="The People">
          Popular Creators
        </SectionTitle>
      </div>
      <CreatorsSlider creators={creators} />
    </div>,
  );
});
