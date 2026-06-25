import type { BookFair } from "../../../../db/schema";
import FairCard from "./FairCard";

type FairsSliderProps = {
  fairs: BookFair[];
};

const FairsSlider = ({ fairs }: FairsSliderProps) => (
  <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div class="flex min-w-max items-stretch gap-4 pr-4">
      {fairs.map((fair) => (
        <div class="w-[78vw] shrink-0">
          <FairCard fair={fair} />
        </div>
      ))}
    </div>
  </div>
);

export default FairsSlider;
