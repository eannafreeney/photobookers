import SectionTitle from "../../../components/app/SectionTitle";
import { CreatorCardResult } from "../../../constants/queries";

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
            <a
              href={`/creators/${creator.slug}`}
              key={creator.id ?? creator.slug}
            >
              <img
                src={creator.coverUrl ?? ""}
                alt={creator.displayName ?? ""}
                title={creator.displayName ?? ""}
                class="size-24 rounded-full object-cover"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorsSlider;
