import { Creator } from "../../db/schema";
import Avatar from "./Avatar";

type PageTitleProps = {
  title?: string;
  creator?: Creator;
};

const PageTitle = ({ title, creator }: PageTitleProps) => {
  return (
    <div class="flex items-center gap-2">
      {creator?.coverUrl && (
        <Avatar
          src={creator.coverUrl ?? ""}
          alt={creator.displayName ?? ""}
          size="md"
        />
      )}
      <div class="text-2xl md:text-4xl font-medium my-4">
        {creator?.displayName ?? title}
      </div>
    </div>
  );
};
export default PageTitle;
