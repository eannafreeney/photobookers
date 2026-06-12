import { capitalize } from "../../utils";
import { tagBooksUrl } from "../../lib/tags";
import Badge from "./Badge";
import Link from "./Link";

type TagListProps = {
  tags: string[];
};

const TagList = ({ tags }: TagListProps) => {
  if (tags.length === 0) return <></>;
  return (
    <div className="flex items-center flex-wrap gap-2">
      {tags.map((tag) => (
        <Link href={tagBooksUrl(tag)}>
          <Badge variant="default">{capitalize(tag)}</Badge>
        </Link>
      ))}
    </div>
  );
};
export default TagList;
