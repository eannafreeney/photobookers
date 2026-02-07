import Link from "./Link";
import { Creator } from "../../db/schema";

type SocialLinksProps = {
  creator: Creator;
};

const SocialLinks = ({ creator }: SocialLinksProps) => {
  return (
    <div class={`flex gap-2 items-center text-xs`}>
      {creator.website && (
        <Link href={creator.website} target="_blank">
          Website
        </Link>
      )}
      {creator.facebook && (
        <Link href={creator.facebook} target="_blank">
          Facebook
        </Link>
      )}
      {creator.instagram && (
        <Link href={creator.instagram} target="_blank">
          Instagram
        </Link>
      )}
    </div>
  );
};

export default SocialLinks;
