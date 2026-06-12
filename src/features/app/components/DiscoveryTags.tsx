import Link from "../../../components/app/Link";
import Pill from "../../../components/app/Pill";
import SectionTitle from "../../../components/app/SectionTitle";
import { DISCOVER_TAGS } from "../../../constants/discover";
import { tagBooksUrl } from "../../../lib/tags";
import { capitalize } from "../../../utils";

const DiscoveryTags = () => {
  return (
    <div class="mt-2 mb-4">
      <div class="border-t-2 border-on-surface-strong pt-3 mb-4 mt-10">
        <SectionTitle className="mb-0" kicker="Browse by Theme">
          Discover
        </SectionTitle>
      </div>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-0">
        <div class="flex w-max md:w-full items-center gap-2 whitespace-nowrap md:whitespace-normal md:justify-between">
          {DISCOVER_TAGS.map((tag) => (
            <Link key={tag} href={tagBooksUrl(tag)}>
              <Pill>{`${capitalize(tag)}`}</Pill>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTags;
