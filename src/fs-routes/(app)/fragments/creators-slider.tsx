import { createRoute } from "hono-fsr";
import { getVerifiedCreators } from "../../../features/app/services";
import CreatorsSlider from "../../../features/app/components/CreatorsSlider";

export const GET = createRoute(async (c) => {
  const [err, creators] = await getVerifiedCreators();

  if (err || !creators || creators.length === 0) return c.html(<></>);

  return c.html(
    <div id="creators-slider-fragment">
      <CreatorsSlider creators={creators} />
    </div>,
  );
});
