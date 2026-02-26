import Badge from "../../../components/app/Badge";
import Link from "../../../components/app/Link";
import SectionTitle from "../../../components/app/SectionTitle";
import { DISCOVER_TAGS } from "../../../constants/discover";
import { capitalize } from "../../../utils";

const DiscoveryTags = () => {
  return (
    <>
      <SectionTitle>Discover</SectionTitle>
      <div class="flex flex-wrap items-center gap-2">
        {DISCOVER_TAGS.map((tag) => (
          <Link key={tag} href={`/books/tags/${tag.toLowerCase()}`}>
            <Badge>{capitalize(tag)}</Badge>
          </Link>
        ))}
      </div>
    </>
  );
};
export default DiscoveryTags;
