import CreatorsSlider from "../components/CreatorsSlider";
import { getVerifiedCreators } from "../services";

const CreatorsSliderFragment = async () => {
  const [err, creators] = await getVerifiedCreators();

  if (err || !creators || creators.length === 0) return <></>;

  return (
    <div id="creators-slider-fragment">
      <CreatorsSlider creators={creators} />
    </div>
  );
};
export default CreatorsSliderFragment;
