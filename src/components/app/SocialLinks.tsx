import Link from "./Link";
import { Creator } from "../../db/schema";

const SocialLinks = ({ creator }: { creator: Creator }) => {
  if (creator.status === "stub") return <></>;

  return (
    <div class="flex flex-row gap-2 items-center text-xs">
      {creator.website && <Link href={creator.website}>Website</Link>}
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
      {/* {creator.email && <Link href={creator.email} target="_blank">Email</Link>} */}
    </div>
  );
};

export default SocialLinks;

