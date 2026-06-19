import CreatorsSlider from "../components/CreatorsSlider";
import { getTopCreatorsByViews } from "../../book-views/services";

const TRENDING_CREATORS_LIMIT = 20;

const CreatorsSliderFragment = async () => {
  const [err, creators] = await getTopCreatorsByViews(TRENDING_CREATORS_LIMIT);

  if (err || !creators || creators.length === 0) return <></>;

  return (
    <div id="creators-slider-fragment">
      <CreatorsSlider creators={creators} />
    </div>
  );
};
export default CreatorsSliderFragment;
