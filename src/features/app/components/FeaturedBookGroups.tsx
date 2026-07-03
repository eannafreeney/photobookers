import SectionTitle from "../../../components/app/SectionTitle";
import { FEATURED_BOOK_GROUPS } from "../../../constants/featuredBookGroups";
import { tagBooksUrl } from "../../../lib/tags";
import { loadFeaturedBookGroupCovers } from "../services";
import GroupCard from "./GroupCard";

const FeaturedBookGroups = async () => {
  const covers = await loadFeaturedBookGroupCovers();

  return (
    <div id="featured-book-groups">
      <div class="mb-6 border-t-2 border-on-surface-strong pt-3">
        <SectionTitle className="mb-0" kicker="Browse by Theme">
          Groups
        </SectionTitle>
      </div>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex min-w-max items-center gap-4 pr-4">
          {FEATURED_BOOK_GROUPS.map((tag) => (
            <GroupCard
              key={tag}
              tag={tag}
              href={tagBooksUrl(tag)}
              coverUrl={covers.get(tag) ?? null}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedBookGroups;
