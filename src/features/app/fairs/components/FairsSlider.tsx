import type { BookFair } from "../../../../db/schema";
import { HORIZONTAL_SLIDER_CARD_CLASS } from "../../../../lib/horizontalSliderCardWidth";
import FairCard from "./FairCard";

type FairsSliderProps = {
  fairs: BookFair[];
};

const FairsSlider = ({ fairs }: FairsSliderProps) => (
  <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div class="flex min-w-max items-stretch gap-4 pr-4">
      {fairs.map((fair) => (
        <div class={HORIZONTAL_SLIDER_CARD_CLASS}>
          <FairCard fair={fair} />
        </div>
      ))}
    </div>
  </div>
);

export default FairsSlider;
