import { BookStore } from "../../../../db/schema";
import StoreCard from "./StoreCard";

type StoresSliderProps = {
  stores: BookStore[];
};

const StoresSlider = ({ stores }: StoresSliderProps) => (
  <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div class="flex min-w-max items-stretch gap-4 pr-4">
      {stores.map((store) => (
        <div class="w-[78vw] shrink-0">
          <StoreCard store={store} />
        </div>
      ))}
    </div>
  </div>
);

export default StoresSlider;
