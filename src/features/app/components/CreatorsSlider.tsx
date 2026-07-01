import { CreatorCardResult } from "../../../constants/queries";
import CreatorsCircle from "./CreatorsCircle";

type PublishersSliderProps = {
  creators: CreatorCardResult[];
};

const CreatorsSlider = async ({ creators }: PublishersSliderProps) => {
  return (
    <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div class="flex w-max items-center gap-3">
        {creators.map((creator) => (
          <CreatorsCircle key={creator.id} creator={creator} size={24} />
        ))}
      </div>
    </div>
  );
};

export default CreatorsSlider;
