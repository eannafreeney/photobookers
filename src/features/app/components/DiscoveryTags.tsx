import Link from "../../../components/app/Link";
import Pill from "../../../components/app/Pill";
import SectionTitle from "../../../components/app/SectionTitle";
import { DISCOVER_TAGS } from "../../../constants/discover";
import { capitalize } from "../../../utils";

const DiscoveryTags = () => {
  return (
    <div class="mt-2 mb-4 pl-4">
      <SectionTitle className="mb-4">Discover</SectionTitle>
      <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-0">
        <div class="flex w-max md:w-full items-center gap-2 whitespace-nowrap md:whitespace-normal md:justify-between">
          {DISCOVER_TAGS.map((tag) => (
            <Link key={tag} href={`/books/tags/${tag.toLowerCase()}`}>
              <Pill>{`${capitalize(tag)}`}</Pill>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTags;
