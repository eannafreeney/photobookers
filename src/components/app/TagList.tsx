import { capitalize } from "../../utils";
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
        <Link href={`/books/tags/${tag.toLowerCase()}`}>
          <Badge variant="default">{capitalize(tag)}</Badge>
        </Link>
      ))}
    </div>
  );
};
export default TagList;
