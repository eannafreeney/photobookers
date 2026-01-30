import { capitalize } from "../../utils";
import Badge from "./Badge";

type TagListProps = {
  tags: string[];
};

const TagList = ({ tags }: TagListProps) => {
  return (
    <>
      <h3 className="text-md font-bold">Tags</h3>
      <div className="flex items-center flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge variant="default">{capitalize(tag)}</Badge>
        ))}
      </div>
    </>
  );
};
export default TagList;
