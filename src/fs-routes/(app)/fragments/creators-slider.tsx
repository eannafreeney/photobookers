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
      {/* <div class="flex items-center justify-between mb-2"> */}
      <SectionTitle>Popular Creators</SectionTitle>
      {/* <div class="flex items-center gap-2 ">
          <ViewAllLink href="/artists" text="Artists" />
          <span class="h-4 w-px bg-outline" aria-hidden="true"></span>
          <ViewAllLink href="/publishers" text="Publishers" />
        </div> */}
      {/* </div> */}
      <CreatorsSlider creators={creators} />
    </div>,
  );
});
