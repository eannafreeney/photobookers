import SectionTitle from "../../../components/app/SectionTitle";
import { CreatorCardResult } from "../../../constants/queries";
import CreatorsCircle from "./CreatorsCircle";

type PublishersSliderProps = {
  creators: CreatorCardResult[];
};

const CreatorsSlider = async ({ creators }: PublishersSliderProps) => {
  return (
    <div class="mt-2 mb-4">
      <SectionTitle className="mb-4">Popular Creators</SectionTitle>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex w-max items-center gap-6">
          {creators.map((creator) => (
            <CreatorsCircle creator={creator} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorsSlider;
